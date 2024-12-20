const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = async (role, page = 1, limit = 50000) => {
    try {
        const offset = (page - 1) * limit;

        // Fetch the teacher details with roles, subjects, and sections
        const [rows] = await db.execute(
            `
            SELECT 
                u.id AS teacher_id, 
                u.first_name, 
                u.middle_name, 
                u.last_name, 
                u.email, 
                sec.course, 
                sec.year, 
                sec.section,
                s.name AS subject_name,
                GROUP_CONCAT(r.name SEPARATOR ', ') AS roles
            FROM users u
            LEFT JOIN teacher_roles tr ON tr.teacher_id = u.id
            LEFT JOIN roles r ON tr.role_id = r.id
            LEFT JOIN teacher_subjects tsub ON tsub.teacher_id = u.id
            LEFT JOIN sections sec ON sec.id = tsub.section_id
            LEFT JOIN subjects s ON s.id = tsub.subject_id
            WHERE u.role = ?
            GROUP BY u.id, sec.course, sec.year, sec.section, s.name
            LIMIT ? OFFSET ?
            `,
            [role, limit, offset]
        );

        // Get total count of teachers for pagination
        const [totalRows] = await db.execute(
            `SELECT COUNT(*) as count FROM users WHERE role = ?`,
            [role]
        );
        const total = totalRows[0].count;

        // If no results, return empty array and total count of 0
        if (!rows || rows.length === 0) {
            return { teachers: [], total, totalPages: 0, currentPage: page };
        }

        // Transform the flat result set into grouped data
        const teachersMap = rows.reduce((acc, row) => {
            const teacherId = row.teacher_id;

            // Create a new teacher entry if it doesn't exist
            if (!acc[teacherId]) {
                acc[teacherId] = {
                    id: teacherId,
                    first_name: row.first_name,
                    middle_name: row.middle_name,
                    last_name: row.last_name,
                    email: row.email,
                    roles: row.roles ? row.roles.split(', ') : [], // Split roles into an array
                    yearSectionSubjects: [],
                };
            }

            // Add year and section if it exists
            if (row.course && row.year && row.section) {
                // Check for the existing course and year/section combination
                let yearSection = acc[teacherId].yearSectionSubjects.find(
                    ys =>
                        ys.course === row.course &&
                        ys.year === row.year &&
                        ys.section === row.section
                );

                // If not found, create a new entry
                if (!yearSection) {
                    yearSection = {
                        course: row.course,
                        year: row.year,
                        section: row.section,
                        subjects: [],
                    };
                    acc[teacherId].yearSectionSubjects.push(yearSection);
                }

                // Add the subject if it exists and avoid duplicates
                if (row.subject_name && !yearSection.subjects.includes(row.subject_name)) {
                    yearSection.subjects.push(row.subject_name);
                }
            }

            return acc;
        }, {});

        // Convert the teachers map to an array
        const teachersArray = Object.values(teachersMap);

        // Return the teachers along with pagination info
        return {
            teachers: teachersArray,
            total,
            totalPages: Math.ceil(total / limit), // Calculate total pages
            currentPage: page,
        };
    } catch (error) {
        // Improved error handling
        console.error('Error fetching teachers:', error);
        throw new Error('Failed to fetch teachers: ' + error.message);
    }
};



exports.getTeacherInfo = async (id) => {
    return db.execute(`
        SELECT DISTINCT
            u.id AS teacher_id, 
            u.first_name, 
            u.middle_name, 
            u.last_name, 
            u.email, 
            u.role AS user_role,
            tr.role_id AS teacher_role_id, 
            r.name AS teacher_role_name,
            dep.name AS course_name, 
            sec.year,
            sec.section,
            sec.id AS section_id,
            s.id AS subject_id,
            s.name AS subject_name,
            ss.student_id,
            su.first_name AS student_first_name,
            su.last_name AS student_last_name,
            COALESCE(cs.status, 'Pending') AS clearance_status
        FROM users u
        LEFT JOIN teacher_roles tr ON tr.teacher_id = u.id
        LEFT JOIN roles r ON r.id = tr.role_id
        LEFT JOIN teacher_sections ts ON ts.teacher_id = u.id
        LEFT JOIN sections sec ON sec.id = ts.section_id
        LEFT JOIN departments dep ON sec.course = dep.id
        LEFT JOIN teacher_subjects tsub ON tsub.teacher_id = u.id AND tsub.section_id = sec.id
        LEFT JOIN subjects s ON s.id = tsub.subject_id
        LEFT JOIN student_sections ss ON ss.section_id = sec.id
        LEFT JOIN student_subjects ssb ON ssb.student_id = ss.student_id AND ssb.subject_id = s.id
        LEFT JOIN users su ON su.id = ss.student_id
        LEFT JOIN clearance_status cs ON cs.student_id = ss.student_id AND cs.subject_id = s.id AND cs.section_id = sec.id
        WHERE u.role = 'teacher' 
          AND u.id = ?
        GROUP BY
            teacher_id, course_name, year, section_id, subject_id, ss.student_id
        ORDER BY dep.name, sec.year, s.name, su.last_name, su.first_name;
    `, [id]);
};



// Model: Handle insertion of sections and updating signature
exports.addYearSection = async (data) => {
    const { teacher_id, course, year, section, subjects, signature, roles } = data;
    const connection = await db.getConnection(); // Start a connection for the transaction

    try {
        await connection.beginTransaction(); // Begin transaction

        // Step 1: Validate or Insert Teacher in teacher_details
        const [[existingTeacher]] = await connection.execute(
            `SELECT teacher_id FROM teacher_details WHERE teacher_id = ?`,
            [teacher_id]
        );

        if (!existingTeacher) {
            // Insert teacher with the signature
            await connection.execute(
                `INSERT INTO teacher_details (teacher_id, signature) VALUES (?, ?)`,
                [teacher_id, signature]
            );
        } else {
            // Update signature if it exists but is missing
            await connection.execute(
                `UPDATE teacher_details SET signature = ? WHERE teacher_id = ?`,
                [signature, teacher_id]
            );
        }

        // Step 2: Add Roles for the Teacher
        if (Array.isArray(roles) && roles.length > 0) {
            const [roleRecords] = await connection.execute(
                `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
                roles
            );

            // Find missing roles
            const missingRoles = roles.filter(
                (role) => !roleRecords.some((record) => record.name === role)
            );

            // Insert missing roles into roles table
            for (const role of missingRoles) {
                await connection.execute(`INSERT INTO roles (name) VALUES (?)`, [role]);
            }

            // Fetch all updated roles
            const [updatedRoles] = await connection.execute(
                `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
                roles
            );

            // Assign roles to the teacher
            for (const roleRecord of updatedRoles) {
                const role_id = roleRecord.id;

                const [[existingTeacherRole]] = await connection.execute(
                    `SELECT id FROM teacher_roles WHERE teacher_id = ? AND role_id = ?`,
                    [teacher_id, role_id]
                );

                if (!existingTeacherRole) {
                    await connection.execute(
                        `INSERT INTO teacher_roles (teacher_id, role_id) VALUES (?, ?)`,
                        [teacher_id, role_id]
                    );
                }
            }
        }

        // Step 3: Handle Sections and Subjects
        const [[departmentResult]] = await connection.execute(
            `SELECT id FROM departments WHERE id = ?`,
            [course]
        );

        if (!departmentResult) {
            throw new Error(`Department not found for ID: ${course}`);
        }

        const departmentId = departmentResult.id;

        const [[existingSection]] = await connection.execute(
            `SELECT id FROM sections WHERE course = ? AND year = ? AND section = ?`,
            [departmentId, year, section]
        );

        let section_id;
        if (!existingSection) {
            const [sectionResult] = await connection.execute(
                `INSERT INTO sections (course, year, section) VALUES (?, ?, ?)`,

                [departmentId, year, section]
            );
            section_id = sectionResult.insertId;
        } else {
            section_id = existingSection.id;
        }

        const [[existingTeacherSection]] = await connection.execute(
            `SELECT id FROM teacher_sections WHERE teacher_id = ? AND section_id = ?`,
            [teacher_id, section_id]
        );

        if (!existingTeacherSection) {
            await connection.execute(
                `INSERT INTO teacher_sections (teacher_id, section_id) VALUES (?, ?)`,
                [teacher_id, section_id]
            );
        }

        // Assign subjects to the teacher in the section
        for (const subjectName of subjects) {
            const [[subjectResult]] = await connection.execute(
                `SELECT id FROM subjects WHERE name = ? AND department_id = ?`,
                [subjectName, course]
            );

            if (!subjectResult) {
                throw new Error(`Subject '${subjectName}' not found.`);
            }

            const subject_id = subjectResult.id;

            const [[existingTeacherSubject]] = await connection.execute(
                `SELECT id FROM teacher_subjects WHERE teacher_id = ? AND section_id = ? AND subject_id = ?`,
                [teacher_id, section_id, subject_id]
            );

            if (!existingTeacherSubject) {
                await connection.execute(
                    `INSERT INTO teacher_subjects (teacher_id, section_id, subject_id) VALUES (?, ?, ?)`,

                    [teacher_id, section_id, subject_id]
                );
            }
        }

        // Step 4: Update First Login
        await connection.execute(
            `UPDATE users SET first_login = 0 WHERE id = ?`,
            [teacher_id]
        );

        await connection.commit(); // Commit all changes
        return { message: 'Year, section, roles, and subjects added successfully.' };
    } catch (err) {
        await connection.rollback(); // Rollback if an error occurs
        console.error(`Error adding year, section, roles, and subjects: ${err.message}`);
        throw new Error(`Error adding year, section, roles, and subjects: ${err.message}`);
    } finally {
        connection.release(); // Release the connection
    }
};


exports.clearTeacherSections = async ({ teacher_id, roles, signature }) => {
    const connection = await db.getConnection(); // Get a DB connection

    try {
        await connection.beginTransaction();

        // Update roles and signature (if needed)
        if (roles && Array.isArray(roles) && roles.length > 0) {
            for (const role of roles) {
                // Check if the role exists
                const [existingRole] = await connection.execute(
                    `SELECT id FROM roles WHERE name = ?`,
                    [role]
                );

                // Insert role if it doesn't exist
                const role_id = existingRole[0]?.id || (await connection.execute(
                    `INSERT INTO roles (name) VALUES (?)`,
                    [role]
                ))[0].insertId;

                // Assign role to the teacher if not already assigned
                await connection.execute(
                    `INSERT INTO teacher_roles (teacher_id, role_id) VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE role_id = role_id`,
                    [teacher_id, role_id]
                );
            }
        }

        // Update or insert the teacher's signature
        const [[existingTeacher]] = await connection.execute(
            `SELECT teacher_id FROM teacher_details WHERE teacher_id = ?`,
            [teacher_id]
        );

        if (!existingTeacher) {
            console.log("Inserting new teacher signature:", signature);
            await connection.execute(
                `INSERT INTO teacher_details (teacher_id, signature) VALUES (?, ?)`,
                [teacher_id, signature]
            );
        } else if (signature) {
            console.log("Updating teacher signature:", signature);
            await connection.execute(
                `UPDATE teacher_details SET signature = ? WHERE teacher_id = ?`,
                [signature, teacher_id]
            );
        }

        // Ensure first login is set to 0
        await connection.execute(
            `UPDATE users SET first_login = 0 WHERE id = ?`,
            [teacher_id]
        );

        await connection.commit();
        return { message: 'Teacher roles and signature successfully updated.' };
    } catch (err) {
        await connection.rollback();
        console.error(`Error updating teacher roles and signature: ${err.message}`);
        throw new Error(`Error updating teacher roles and signature: ${err.message}`);
    } finally {
        connection.release();
    }
};




// Add a new teacher
exports.addTeacher = async (teacher) => {
    const { first_name, middle_name, last_name, email, password } = teacher;

    try {
        // Check if the email already exists
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return {
                status: 400,
                message: 'Email already exists in the database.',
            };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new teacher account
        await db.execute(
            `
            INSERT INTO users (first_name, middle_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?, 'teacher')
            `,
            [first_name, middle_name, last_name, email, hashedPassword]
        );

        return { status: 201, message: 'Teacher account added successfully.' };
    } catch (err) {
        console.error(`Error adding teacher account: ${err.message}`);
        throw new Error(`Error adding teacher account: ${err.message}`);
    }
};


exports.bulkAddTeachers = async (teachers) => {

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const promises = teachers.map(async (teacher) => {
            const { first_name, middle_name, last_name, email, password } = teacher;

            // Ensure password is treated as a string
            const passwordStr = String(password); // Convert to string

            // Hash the password
            const hashedPassword = await bcrypt.hash(passwordStr, saltRounds);

             await connection.execute(`
                INSERT INTO users (first_name, middle_name, last_name, email, password, role)
                VALUES (?, ?, ?, ?, ?, 'teacher')
            `, [first_name, middle_name || '', last_name, email, hashedPassword]);
        });

        await Promise.all(promises);

        await connection.commit();
        return { message: 'All teacher accounts added successfully' };
    } catch (err) {
        await connection.rollback();
        console.error(`Error bulk adding teacher accounts: ${err.message}`);
        throw new Error(`Error bulk adding teacher accounts: ${err.message}`);
    } finally {
        connection.release();
    }
};

// Update a teacher by ID
exports.updateTeacher = async (id, teacher) => {
    const {
        first_name,
        middle_name,
        last_name,
        email,
        password
    } = teacher;

    try {
        // Hash the password only if it's provided
        const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

        // Prepare values for updating the `users` table
        const userValues = [
            first_name || null,
            middle_name || null,
            last_name || null,
            email || null,
            hashedPassword,
            id
        ];

        // Update the `users` table
        const [userResult] = await db.execute(`
            UPDATE users
            SET 
                first_name = ?, 
                middle_name = ?, 
                last_name = ?, 
                email = ?, 
                password = COALESCE(?, password) -- Update password only if provided
            WHERE 
                id = ? 
                AND role = 'teacher'
        `, userValues);

        // Check if any rows were affected
        if (userResult.affectedRows === 0) {
            throw new Error('No user found to update');
        }

        return { message: 'Teacher account updated successfully' };
    } catch (err) {
        console.error(`Error updating teacher account: ${err.message}`);
        throw new Error(`Error updating teacher account: ${err.message}`);
    }
};



// Delete a teacher by ID
exports.deleteTeacher = async (id) => {
    // First, delete from teacher_details
    await db.execute(`
        DELETE FROM teacher_details 
        WHERE teacher_id = ?
    `, [id]);

    // Then delete from users table
    await db.execute(`
        DELETE FROM users
        WHERE id = ?
    `, [id]);
};

// Delete teacher section and associated subjects
exports.deleteTeacherSection = async (req, res) => {
    const sectionId = req.params.id;
  
    try {
      // Start by deleting all associated subjects for the given section
      await db.execute('DELETE FROM teacher_subjects WHERE section_id = ?', [sectionId]);
  
      // Then, delete the section itself
      await db.execute('DELETE FROM teacher_sections WHERE id = ?', [sectionId]);
  
      res.json({ message: 'Year Section and associated subjects deleted successfully' });
    } catch (error) {
      console.error('Error deleting section and subjects:', error);
      res.status(500).json({ message: 'Error deleting section and subjects' });
    }
  };
