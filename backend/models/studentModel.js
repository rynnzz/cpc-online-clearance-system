const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all students with user information
exports.getAllStudents = () => {
    // Query to join users, student_details, sections, departments, and administrative_clearance_status tables
    return db.execute(`
        SELECT 
            u.id AS student_id, 
            u.role, 
            u.first_name, 
            u.middle_name, 
            u.last_name, 
            u.email,
            d.name AS course, -- Fetch the course name from the departments table
            sec.id AS section_id, -- Fetch the section ID
            d.id AS department_id, -- Fetch the department ID
            sec.year, 
            sec.section, 
            sd.student_type,
            acs.status AS clearance_status -- Fetch administrative clearance status
        FROM users u
        LEFT JOIN student_details sd ON u.id = sd.student_id
        LEFT JOIN sections sec ON sd.section_id = sec.id
        LEFT JOIN departments d ON sec.course = d.id -- Join with the departments table to get course name
        LEFT JOIN administrative_clearance_status acs 
            ON u.id = acs.student_id 
            AND sec.id = acs.section_id 
            AND d.id = acs.department_id -- Join with administrative_clearance_status to get clearance status
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
    const { first_name, middle_name, last_name, email, course, year, section, password, student_type } = student;

    try {

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (first_name, middle_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?, 'student')
        `, [first_name, middle_name, last_name, email, hashedPassword]);

        const userId = userResult.insertId;

        // Get the department_id from the departments table based on the course
        const [departmentResult] = await db.execute(`
            SELECT id FROM departments
            WHERE name = ?
        `, [course]);

        if (departmentResult.length === 0) {
            throw new Error(`Department not found for course: ${course}`);
        }

        const departmentId = departmentResult[0].id;

        // Insert or fetch the section_id from the sections table
        let sectionId;
        const [sectionResult] = await db.execute(`
            SELECT id FROM sections
            WHERE course = ? AND year = ? AND section = ?
        `, [departmentId, year, section]);

        if (sectionResult.length === 0) {
            // Section doesn't exist, insert it
            const [insertSectionResult] = await db.execute(`
                INSERT INTO sections (course, year, section)
                VALUES (?, ?, ?)
            `, [departmentId, year, section]);
            sectionId = insertSectionResult.insertId;
        } else {
            // Section exists, fetch its id
            sectionId = sectionResult[0].id;
        }

        // Insert into student_details
        await db.execute(`
            INSERT INTO student_details (student_id, section_id, student_type)
            VALUES (?, ?, ?)
        `, [userId, sectionId, student_type]);

        // Insert into student_sections
        const [existingStudentSection] = await db.execute(`
            SELECT * FROM student_sections
            WHERE student_id = ? AND section_id = ?
        `, [userId, sectionId]);

        if (existingStudentSection.length === 0) {
            await db.execute(`
                INSERT INTO student_sections (student_id, section_id)
                VALUES (?, ?)
            `, [userId, sectionId]);
        }

        // Fetch subjects based on department_id and year
        const [subjects] = await db.execute(`
            SELECT id FROM subjects
            WHERE department_id = ? AND year = ?
        `, [departmentId, year]);

        // Insert subjects into student_subjects for this student
        if (subjects.length > 0) {
            const subjectPromises = subjects.map(async (subject) => {
                const [existingSubject] = await db.execute(`
                    SELECT * FROM student_subjects
                    WHERE student_id = ? AND subject_id = ?
                `, [userId, subject.id]);

                if (existingSubject.length === 0) {
                    await db.execute(`
                        INSERT INTO student_subjects (student_id, subject_id)
                        VALUES (?, ?)
                    `, [userId, subject.id]);
                }
            });
            await Promise.all(subjectPromises);
        }

        return { message: 'Student account added successfully with section and subjects assigned.' };
    } catch (err) {
        console.error(`Error adding student account: ${err.message}`);
        throw new Error(`Error adding student account: ${err.message}`);
    }
};

exports.bulkAddStudents = async (students) => {
    const connection = await db.getConnection();
    const saltRounds = 10; // Adjust salt rounds as needed

    try {
        await connection.beginTransaction();

        const promises = students.map(async (student) => {
            const { first_name, middle_name, last_name, email, course, year, section, password, student_type } = student;

            // Ensure password is treated as a string
            const passwordStr = String(password);

            // Hash the password
            const hashedPassword = await bcrypt.hash(passwordStr, saltRounds);

            // Insert new user into the users table
            const [userResult] = await connection.execute(`
                INSERT INTO users (first_name, middle_name, last_name, email, password, role)
                VALUES (?, ?, ?, ?, ?, 'student')
            `, [first_name, middle_name || '', last_name, email, hashedPassword]);

            const userId = userResult.insertId;

            // Get the department id based on the course name
            const [departmentResult] = await connection.execute(`
                SELECT id FROM departments
                WHERE name = ?
            `, [course]);

            if (departmentResult.length === 0) {
                throw new Error(`Department not found for course: ${course}`);
            }

            const departmentId = departmentResult[0].id;

            // Check if the section already exists, and insert it if it doesn't
            let sectionId;
            const [sectionResult] = await connection.execute(`
                SELECT id FROM sections
                WHERE course = ? AND year = ? AND section = ?
            `, [departmentId, year, section]);

            if (sectionResult.length > 0) {
                sectionId = sectionResult[0].id;
            } else {
                const [insertSection] = await connection.execute(`
                    INSERT INTO sections (course, year, section)
                    VALUES (?, ?, ?)
                `, [departmentId, year, section]);
                sectionId = insertSection.insertId;
            }

            // Insert into the student_sections table
            const [studentSectionResult] = await connection.execute(`
                INSERT INTO student_sections (student_id, section_id)
                VALUES (?, ?)
            `, [userId, sectionId]);

            // Insert student details into the student_details table
            await connection.execute(`
                INSERT INTO student_details (student_id, section_id, student_type)
                VALUES (?, ?, ?)
            `, [userId, sectionId, student_type]);

            // Automatically assign subjects to the student based on course and year
            const [subjectResults] = await connection.execute(`
                SELECT id FROM subjects
                WHERE department_id = ?
                AND year = ?
            `, [departmentId, year]);

            const subjectPromises = subjectResults.map(async (subject) => {
                await connection.execute(`
                    INSERT INTO student_subjects (student_id, subject_id)
                    VALUES (?, ?)
                `, [userId, subject.id]);
            });

            await Promise.all(subjectPromises);
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

// exports.addSubject = async (id, payload) => {
//     const { subjects, course, year_and_section } = payload;
//     const connection = await db.getConnection(); // Ensure a connection to the database

//     try {
//         await connection.beginTransaction(); // Start a transaction

//         // Step 1: Check if the section exists in the sections table, insert if not, and get section_id
//         let [[existingSection]] = await connection.execute(
//             `SELECT id FROM sections WHERE course = ? AND year_and_section = ?`,
//             [course, year_and_section]
//         );

//         let section_id;
//         if (!existingSection) {
//             const [sectionResult] = await connection.execute(
//                 `INSERT INTO sections (course, year_and_section) VALUES (?, ?)`,
//                 [course, year_and_section]
//             );
//             section_id = sectionResult.insertId; // Get the generated section_id
//         } else {
//             section_id = existingSection.id; // Use the existing section_id
//         }

//         // Step 2: Insert or update student_sections with the section_id for this student
//         await connection.execute(
//             `
//             INSERT INTO student_sections (student_id, section_id)
//             VALUES (?, ?)
//             ON DUPLICATE KEY UPDATE section_id = VALUES(section_id)
//             `,
//             [id, section_id]
//         );

//         // Step 3: Insert or update each selected subject in student_subjects
//         for (const subject of subjects) {
//             const [[subjectResult]] = await connection.execute(
//                 `SELECT id FROM subjects WHERE name = ?`,
//                 [subject]
//             );

//             if (!subjectResult) {
//                 throw new Error(`Subject ${subject} not found`);
//             }

//             const subject_id = subjectResult.id;

//             // Insert into student_subjects with section_id reference
//             await connection.execute(
//                 `INSERT INTO student_subjects (student_id, subject_id, section_id)
//                  VALUES (?, ?, ?)
//                  ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id), section_id = VALUES(section_id)`,
//                 [id, subject_id, section_id]
//             );
//         }

//         // Step 4: Update the user's first_login status
//         await connection.execute(
//             `UPDATE users SET first_login = FALSE WHERE id = ?`,
//             [id]
//         );

//         await connection.commit(); // Commit the transaction if all inserts succeed
//     } catch (error) {
//         await connection.rollback(); // Rollback the transaction in case of an error
//         console.error(`Error adding subjects and section: ${error.message}`);
//         throw error;
//     } finally {
//         connection.release(); // Release the connection back to the pool
//     }
// };

exports.getStudentInfo = async (studentId) => {
    return db.execute(`
        SELECT 
            u.id AS student_id,
            u.first_name,
            u.middle_name,
            u.last_name,
            u.email,
            u.role,
            d.name AS course,
            sec.year AS year,
            sec.section AS section,
            sd.student_type,
            subj.name AS subject_name,
            subj.code AS subject_code,
            subj.units AS subject_units,
            subj.semester,
            subj.school_year,
            COALESCE(cs.status, 'Pending') AS clearance_status,
            CASE WHEN COALESCE(cs.status, 'Pending') = 'Approved' THEN td.signature ELSE NULL END AS teacher_signature
        FROM 
            users u
        JOIN 
            student_details sd ON u.id = sd.student_id
        JOIN 
            sections sec ON sd.section_id = sec.id
        JOIN 
            departments d ON sec.course = d.id
        LEFT JOIN 
            subjects subj ON subj.department_id = d.id
                         AND subj.year = sec.year
        LEFT JOIN 
            clearance_status cs ON cs.student_id = u.id 
                                 AND cs.subject_id = subj.id
        LEFT JOIN 
            (SELECT ts.subject_id, ts.section_id, td.signature
             FROM teacher_subjects ts
             JOIN teacher_details td ON ts.teacher_id = td.teacher_id
             GROUP BY ts.subject_id, ts.section_id) td ON td.subject_id = subj.id
        WHERE 
            u.id = ?
            AND subj.semester = (SELECT semester FROM current_semester LIMIT 1) -- Filter by current semester
        ORDER BY 
            subj.semester, subj.name;
    `, [studentId]);
};


// Update a student by ID
exports.updateStudent = async (id, student) => {
    const { first_name, middle_name, last_name, email, password, student_type, year, section, course } = student;

    try {
        // Check if the student exists
        const [existingUser] = await db.execute(`
            SELECT id FROM users WHERE id = ? AND role = 'student'
        `, [id]);

        if (!existingUser.length) {
            throw new Error('Student not found');
        }

        // Hash the password if it is provided
        let hashedPassword = null;
        if (password) {
            const saltRounds = 10; // Define salt rounds
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Build the `users` update query dynamically
        let updateUserQuery = `
            UPDATE users 
            SET first_name = ?, middle_name = ?, last_name = ?, email = ?
        `;
        const userParams = [first_name, middle_name, last_name, email];

        // Include the password update if provided
        if (password) {
            updateUserQuery += `, password = ?`;
            userParams.push(hashedPassword);
        }
        updateUserQuery += ` WHERE id = ? AND role = 'student'`;
        userParams.push(id);

        // Execute the update for the `users` table
        await db.execute(updateUserQuery, userParams);

        // Check if the course exists in the departments table
        const [departmentResult] = await db.execute(`
            SELECT id FROM departments WHERE name = ?
        `, [course]);

        if (!departmentResult.length) {
            throw new Error(`Course not found: ${course}`);
        }

        const departmentId = departmentResult[0].id;

        // Check if the section already exists, or create it if it doesn't
        let sectionId;
        const [sectionResult] = await db.execute(`
            SELECT id FROM sections
            WHERE course = ? AND year = ? AND section = ?
        `, [departmentId, year, section]);

        if (sectionResult.length > 0) {
            sectionId = sectionResult[0].id;
        } else {
            const [insertSectionResult] = await db.execute(`
                INSERT INTO sections (course, year, section)
                VALUES (?, ?, ?)
            `, [departmentId, year, section]);
            sectionId = insertSectionResult.insertId;
        }

        // Update the `student_details` table
        await db.execute(`
            UPDATE student_details
            SET section_id = ?, student_type = ?
            WHERE student_id = ?
        `, [sectionId, student_type, id]);

        return { success: true, message: 'Student updated successfully' };
    } catch (error) {
        console.error(`Error updating student: ${error.message}`);
        throw new Error(`Error updating student: ${error.message}`);
    }
};


// Delete a student by ID
exports.deleteStudent = (id) => {
    return db.execute(`
        DELETE FROM users 
        WHERE id = ?
    `, [id]);
};