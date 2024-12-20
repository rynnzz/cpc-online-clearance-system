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
            sd.id_num,
            MAX(acs.status) AS clearance_status -- Fetch the latest administrative clearance status
        FROM users u
        LEFT JOIN student_details sd ON u.id = sd.student_id
        LEFT JOIN sections sec ON sd.section_id = sec.id
        LEFT JOIN departments d ON sec.course = d.id -- Join with the departments table to get course name
        LEFT JOIN administrative_clearance_status acs 
            ON u.id = acs.student_id 
            AND sec.id = acs.section_id 
            AND d.id = acs.department_id -- Join with administrative_clearance_status to get clearance status
        WHERE u.role = 'student'
        GROUP BY 
            u.id, 
            u.role, 
            u.first_name, 
            u.middle_name, 
            u.last_name, 
            u.email, 
            d.name, 
            sec.id, 
            d.id, 
            sec.year, 
            sec.section, 
            sd.student_type
    `);
};



exports.getAdministrativeClearanceStatus = (studentId) => {
    return db.execute(`
        SELECT DISTINCT
            acs.id AS clearance_id,
            acs.student_id,
            u.first_name AS student_first_name,
            u.last_name AS student_last_name,
            acs.department_id,
            dep.name AS department_name,
            acs.section_id,
            sec.year AS section_year,
            sec.section AS section_name,
            acs.status AS clearance_status,
            acs.role_id,
            r.name AS role_name,
            td.signature AS teacher_signature,
            tu.first_name AS teacher_first_name,
            tu.last_name AS teacher_last_name,
            acs.updated_at
        FROM 
            administrative_clearance_status acs
        JOIN 
            users u ON acs.student_id = u.id
        JOIN 
            departments dep ON acs.department_id = dep.id
        JOIN 
            sections sec ON acs.section_id = sec.id
        JOIN 
            roles r ON acs.role_id = r.id
        LEFT JOIN 
            teacher_roles tr ON tr.role_id = acs.role_id
        LEFT JOIN 
            teacher_details td ON td.teacher_id = tr.teacher_id
        LEFT JOIN 
            users tu ON tu.id = tr.teacher_id
        WHERE 
            acs.student_id = ?
            AND r.name NOT IN ('Full Time', 'Part Time')
        ORDER BY 
            acs.updated_at DESC;
    `, [studentId]);
};


// Add a new student
exports.addStudent = async (student) => {
    const { id_num, first_name, middle_name, last_name, email, course, year, section, password, student_type } = student;

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
            INSERT INTO student_details (student_id, section_id, student_type, id_num)
            VALUES (?, ?, ?, ?)
        `, [userId, sectionId, student_type, id_num]);

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

        // Fetch roles excluding Full Time and Part Time
        const [roles] = await db.execute(`
            SELECT id FROM roles
            WHERE name NOT IN ('Full Time', 'Part Time')
        `);

        // Populate administrative_clearance_status
        const clearancePromises = roles.map(async (role) => {
            await db.execute(`
                INSERT INTO administrative_clearance_status (student_id, department_id, section_id, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'Pending', NOW(), NOW())
            `, [userId, departmentId, sectionId, role.id]);
        });
        await Promise.all(clearancePromises);

        return { message: 'Student account added successfully with section, subjects, and administrative clearance populated.' };
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
            const { id_num, first_name, middle_name, last_name, email, course, year, section, password, student_type } = student;

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
            await connection.execute(`
                INSERT INTO student_sections (student_id, section_id)
                VALUES (?, ?)
            `, [userId, sectionId]);

            // Insert student details into the student_details table
            await connection.execute(`
                INSERT INTO student_details (student_id, section_id, student_type, id_num)
                VALUES (?, ?, ?, ?)
            `, [userId, sectionId, student_type, id_num]);

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

            // Fetch all roles
            const [roles] = await connection.execute(`
                SELECT id FROM roles
                WHERE name NOT IN ('Full Time', 'Part Time')
            `);

            if (roles.length === 0) {
                throw new Error('No roles found in the roles table');
            }

            // Populate administrative_clearance_status table for the student
            const clearancePromises = roles.map(async (role) => {
                await connection.execute(`
                    INSERT INTO administrative_clearance_status (student_id, department_id, section_id, role_id, status)
                    VALUES (?, ?, ?, ?, 'Pending')
                `, [userId, departmentId, sectionId, role.id]);
            });

            await Promise.all(clearancePromises);
        });

        await Promise.all(promises);

        await connection.commit();
        return { message: 'All student accounts and administrative clearance statuses added successfully' };
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
            CASE WHEN COALESCE(cs.status, 'Pending') = 'Approved' THEN td.signature ELSE NULL END AS teacher_signature,
            teacher.first_name AS teacher_first_name,
            teacher.last_name AS teacher_last_name
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
            teacher_subjects ts ON ts.subject_id = subj.id 
                                AND ts.section_id = sec.id
        LEFT JOIN 
            users teacher ON teacher.id = ts.teacher_id -- Join to get the teacher's name
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

        // Update the `student_sections` table
        const [existingStudentSection] = await db.execute(`
            SELECT id FROM student_sections WHERE student_id = ?
        `, [id]);

        if (existingStudentSection.length > 0) {
            // Update the existing record
            await db.execute(`
                UPDATE student_sections
                SET section_id = ?
                WHERE student_id = ?
            `, [sectionId, id]);
        } else {
            // Insert a new record if it doesn't exist
            await db.execute(`
                INSERT INTO student_sections (student_id, section_id)
                VALUES (?, ?)
            `, [id, sectionId]);
        }

        // Update the `administrative_clearance_status` table
        await db.execute(`
            UPDATE administrative_clearance_status
            SET department_id = ?, section_id = ?
            WHERE student_id = ?
        `, [departmentId, sectionId, id]);

        // Get subjects based on department and year level
        const [subjects] = await db.execute(`
            SELECT id FROM subjects
            WHERE department_id = ? AND year = ?
        `, [departmentId, year]);

        // Update the `student_subjects` table
        if (subjects.length > 0) {
            // Clear existing subjects
            await db.execute(`
                DELETE FROM student_subjects WHERE student_id = ?
            `, [id]);

            // Insert new subjects
            for (const subject of subjects) {
                await db.execute(`
                    INSERT INTO student_subjects (student_id, subject_id)
                    VALUES (?, ?)
                `, [id, subject.id]);
            }
        }

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

// Fetch students who are fully cleared
exports.getClearedStudents = async () => {
    try {
        return db.execute(`
            SELECT DISTINCT
                u.id AS student_id,
                u.first_name AS student_first_name,
                u.last_name AS student_last_name,
                u.email AS student_email,
                sd.id_num as student_id_num,
                sec.year AS section_year,
                sec.section AS section_name,
                dep.name AS department_name,
                COUNT(DISTINCT cs.subject_id) AS total_subjects,
                COUNT(DISTINCT CASE WHEN cs.status = 'Approved' THEN cs.subject_id END) AS approved_subjects,
                acs.status AS admin_status
            FROM users u
            LEFT JOIN student_details sd ON sd.student_id = u.id
            LEFT JOIN student_sections ss ON ss.student_id = u.id
            LEFT JOIN sections sec ON sec.id = ss.section_id
            LEFT JOIN departments dep ON sec.course = dep.id
            LEFT JOIN clearance_status cs ON cs.student_id = u.id
            LEFT JOIN administrative_clearance_status acs ON acs.student_id = u.id
            WHERE u.role = 'student'
              AND NOT EXISTS (
                  SELECT 1
                  FROM clearance_status cs_pending
                  WHERE cs_pending.student_id = u.id
                    AND cs_pending.status IN ('Pending', 'Rejected') -- Exclude Pending and Rejected statuses
              )
              AND NOT EXISTS (
                  SELECT 1
                  FROM administrative_clearance_status acs_pending
                  WHERE acs_pending.student_id = u.id
                    AND acs_pending.status IN ('Pending', 'Rejected') -- Exclude Pending and Rejected statuses
              )
            GROUP BY u.id, sec.year, sec.section, dep.name, acs.status
            HAVING approved_subjects = total_subjects AND admin_status = 'Approved'
            ORDER BY u.last_name, u.first_name;
        `);
    } catch (error) {
        console.error('Error fetching cleared students:', error);
        throw error;
    }
};


