const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all students with user information
exports.getAllStudents = () => {
    // Query to join users, student_sections, and sections tables to fetch all student details
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, 
               sec.course, sec.year_and_section, sd.student_type
        FROM users u
        LEFT JOIN student_details sd ON u.id = sd.student_id
        LEFT JOIN student_sections ss ON u.id = ss.student_id
        LEFT JOIN sections sec ON ss.section_id = sec.id
        WHERE u.role = 'student'
    `);
};



// Find student by ID with user information
exports.findById = (id) => {
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, sd.degree, sd.yr_and_section, sd.student_type
        FROM users u
        JOIN student_details sd ON u.id = sd.student_id
        WHERE u.id = ?
    `, [id]);
};

// Add a new student
exports.addStudent = async (student) => {
    const { first_name, middle_name, last_name, email, password, student_type } = student;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (first_name, middle_name, last_name, email, password , role)
            VALUES (?, ?, ?, ?, ?, 'student')
        `, [first_name, middle_name, last_name, email, hashedPassword]);

        const userId = userResult.insertId;

        // Insert student details into the student_details table
        await db.execute(`
            INSERT INTO student_details (student_id, student_type)
            VALUES (?, ?)
        `, [userId, student_type]);

        return { message: 'student account added successfully' };
    } catch (err) {
        console.error(`Error adding student account: ${err.message}`);
        throw new Error(`Error adding student account: ${err.message}`);
    }
};

exports.bulkAddStudents = async (students) => {

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const promises = students.map(async (student) => {
            const { first_name, middle_name, last_name, email, password, student_type } = student;

            // Ensure password is treated as a string
            const passwordStr = String(password); // Convert to string

            // Hash the password
            const hashedPassword = await bcrypt.hash(passwordStr, saltRounds);

            // Insert new user into the users table
            const [userResult] = await connection.execute(`
                INSERT INTO users (first_name, middle_name, last_name, email, password, role)
                VALUES (?, ?, ?, ?, ?, 'student')
            `, [first_name, middle_name || '', last_name, email, hashedPassword]);

            const userId = userResult.insertId;

            // Insert student details into the student_details table
            await connection.execute(`
                INSERT INTO student_details (student_id, student_type)
                VALUES (?, ?)
            `, [userId, student_type]);
        });

        await Promise.all(promises);

        await connection.commit();
        return { message: 'All student accounts added successfully' };
    } catch (err) {
        await connection.rollback();
        console.error(`Error bulk adding student accounts: ${err.message}`);
        throw new Error(`Error bulk adding student accounts: ${err.message}`);
    } finally {
        connection.release();
    }
};


exports.addSubject = async (id, payload) => {
    const { subjects, course, year_and_section } = payload;
    const connection = await db.getConnection(); // Ensure a connection to the database

    try {
        await connection.beginTransaction(); // Start a transaction

        // Step 1: Check if the section exists in the sections table, insert if not, and get section_id
        let [[existingSection]] = await connection.execute(
            `SELECT id FROM sections WHERE course = ? AND year_and_section = ?`,
            [course, year_and_section]
        );

        let section_id;
        if (!existingSection) {
            const [sectionResult] = await connection.execute(
                `INSERT INTO sections (course, year_and_section) VALUES (?, ?)`,
                [course, year_and_section]
            );
            section_id = sectionResult.insertId; // Get the generated section_id
        } else {
            section_id = existingSection.id; // Use the existing section_id
        }

        // Step 2: Insert or update student_sections with the section_id for this student
        await connection.execute(
            `
            INSERT INTO student_sections (student_id, section_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE section_id = VALUES(section_id)
            `,
            [id, section_id]
        );

        // Step 3: Insert or update each selected subject in student_subjects
        for (const subject of subjects) {
            const [[subjectResult]] = await connection.execute(
                `SELECT id FROM subjects WHERE name = ?`,
                [subject]
            );

            if (!subjectResult) {
                throw new Error(`Subject ${subject} not found`);
            }

            const subject_id = subjectResult.id;

            // Insert into student_subjects with section_id reference
            await connection.execute(
                `INSERT INTO student_subjects (student_id, subject_id, section_id)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id), section_id = VALUES(section_id)`,
                [id, subject_id, section_id]
            );
        }

        // Step 4: Update the user's first_login status
        await connection.execute(
            `UPDATE users SET first_login = FALSE WHERE id = ?`,
            [id]
        );

        await connection.commit(); // Commit the transaction if all inserts succeed
    } catch (error) {
        await connection.rollback(); // Rollback the transaction in case of an error
        console.error(`Error adding subjects and section: ${error.message}`);
        throw error;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};

exports.getStudentInfo = async (studentId) => {
    return db.execute(`
        SELECT 
            u.id AS student_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,
            u.role,
            sd.student_type,
            sec.course,
            sec.year_and_section,
            subj.name AS subject_name,
            subj.code AS subject_code,
            subj.units AS subject_units,
            COALESCE(cs.status, 'Pending') AS clearance_status,
            CASE WHEN COALESCE(cs.status, 'Pending') = 'Approved' THEN td.signature ELSE NULL END AS teacher_signature
        FROM 
            users u
        JOIN 
            student_details sd ON u.id = sd.student_id
        JOIN 
            student_sections ss ON u.id = ss.student_id
        JOIN 
            sections sec ON ss.section_id = sec.id
        JOIN 
            student_subjects ssub ON ssub.student_id = u.id
        JOIN 
            subjects subj ON subj.id = ssub.subject_id
        LEFT JOIN 
            (SELECT student_id, subject_id, section_id, status 
             FROM clearance_status 
             WHERE student_id = ? 
             GROUP BY student_id, subject_id, section_id) cs ON cs.student_id = u.id 
                                                               AND cs.subject_id = subj.id 
                                                               AND cs.section_id = sec.id
        LEFT JOIN 
            (SELECT ts.subject_id, ts.section_id, td.signature
             FROM teacher_subjects ts
             JOIN teacher_details td ON ts.teacher_id = td.teacher_id
             GROUP BY ts.subject_id, ts.section_id) td ON td.subject_id = subj.id 
                                                         AND td.section_id = sec.id
        WHERE 
            u.id = ?
        ORDER BY 
            sec.course, sec.year_and_section, subj.name;
    `, [studentId, studentId]);
};


// Update a student by ID
exports.updateStudent = (id, student) => {
    const { first_name, middle_name, last_name, degree, yr_and_section, student_type } = student;
    return db.execute(`
        UPDATE student_details 
        SET first_name = ?, middle_name = ?, last_name = ?, degree = ?, yr_and_section = ?
        WHERE student_id = ?
    `, [first_name, middle_name, last_name, degree, yr_and_section, student_type, id]);
};

// Delete a student by ID
exports.deleteStudent = (id) => {
    return db.execute(`
        DELETE FROM users 
        WHERE id = ?
    `, [id]);
};