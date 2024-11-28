const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = async (role, page = 1, limit = 50000) => {
    try {
        const offset = (page - 1) * limit;

        // Fetch the teacher details with subjects and sections
        const [rows] = await db.execute(
            `
            SELECT 
                u.id AS teacher_id, 
                u.first_name, 
                u.middle_name, 
                u.last_name, 
                u.email, 
                u.role, 
                sec.course,
                sec.year,
                sec.section,
                s.name AS subject_name
            FROM users u
            LEFT JOIN teacher_subjects tsub ON tsub.teacher_id = u.id
            LEFT JOIN sections sec ON sec.id = tsub.section_id
            LEFT JOIN subjects s ON s.id = tsub.subject_id
            WHERE u.role = ?
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
                    role: row.role,
                    yearSectionSubjects: [],
                };
            }

            // Add year and section if it exists
            if (row.year_and_section) {
                // Check for the existing course and year/section combination
                let yearSection = acc[teacherId].yearSectionSubjects.find(
                    ys => ys.course === row.course && ys.year_and_section === row.year_and_section
                );

                // If not found, create a new entry
                if (!yearSection) {
                    yearSection = {
                        course: row.course,
                        year_and_section: row.year_and_section,
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
        SELECT 
            u.id AS teacher_id, 
            u.first_name, 
            u.middle_name, 
            u.last_name, 
            u.email, 
            u.role, 
            dep.name AS course_name, -- Fetch course name from departments table
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
        LEFT JOIN teacher_sections ts ON ts.teacher_id = u.id
        LEFT JOIN sections sec ON sec.id = ts.section_id
        LEFT JOIN departments dep ON sec.course = dep.id -- Join departments table for course name
        LEFT JOIN teacher_subjects tsub ON tsub.teacher_id = u.id AND tsub.section_id = sec.id
        LEFT JOIN subjects s ON s.id = tsub.subject_id
        LEFT JOIN student_sections ss ON ss.section_id = sec.id
        LEFT JOIN student_subjects ssb ON ssb.student_id = ss.student_id AND ssb.subject_id = s.id
        LEFT JOIN users su ON su.id = ss.student_id
        LEFT JOIN clearance_status cs ON cs.student_id = ss.student_id AND cs.subject_id = s.id AND cs.section_id = sec.id
        WHERE u.role = 'teacher' 
          AND u.id = ?
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
            await connection.execute(
                `INSERT INTO teacher_details (teacher_id, signature) VALUES (?, ?)`,
                [teacher_id, signature || null]
            );
        }

        // Step 2: Add Roles for the Teacher
        if (Array.isArray(roles) && roles.length > 0) {
            const [roleRecords] = await connection.execute(
                `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
                roles
            );

            const missingRoles = roles.filter(
                (role) => !roleRecords.some((record) => record.name === role)
            );

            for (const role of missingRoles) {
                await connection.execute(`INSERT INTO roles (name) VALUES (?)`, [role]);
            }

            const [updatedRoles] = await connection.execute(
                `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
                roles
            );

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

        for (const subjectName of subjects) {
            const [[subjectResult]] = await connection.execute(
                `SELECT id FROM subjects WHERE name = ?`,
                [subjectName]
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

        // Remove teacher's sections and subjects
        await connection.execute(
            `DELETE FROM teacher_sections WHERE teacher_id = ?`,
            [teacher_id]
        );

        await connection.execute(
            `DELETE FROM teacher_subjects WHERE teacher_id = ?`,
            [teacher_id]
        );

        // Update roles and signature (if needed)
        for (const role of roles) {
            const [existingRole] = await connection.execute(
                `SELECT id FROM roles WHERE name = ?`,
                [role]
            );

            const role_id = existingRole[0]?.id || (await connection.execute(
                `INSERT INTO roles (name) VALUES (?)`,
                [role]
            ))[0].insertId;

            await connection.execute(
                `INSERT INTO teacher_roles (teacher_id, role_id) VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE role_id = role_id`,
                [teacher_id, role_id]
            );
        }

        await connection.execute(
            `UPDATE teacher_details SET signature = ? WHERE teacher_id = ?`,
            [signature, teacher_id]
        );

        await connection.execute(
            `UPDATE users SET first_login = 0 WHERE id = ?`,
            [teacher_id]
        );

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        console.error(`Error clearing teacher sections: ${err.message}`);
        throw new Error(`Error clearing teacher sections: ${err.message}`);
    } finally {
        connection.release();
    }
};




// Add a new teacher
exports.addTeacher = async (teacher) => {
    const { first_name, middle_name, last_name, email, password } = teacher;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await db.execute(`
            INSERT INTO users (first_name, middle_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?, 'teacher')
        `, [first_name, middle_name, last_name, email, hashedPassword]);

        return { message: 'Teacher account added successfully' };
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
        password,
        yearSectionSubjects = [] // Expecting an array of { course, year_and_section, subjects }
    } = teacher;

    try {
        const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

        // Prepare values for users table
        const userValues = [
            first_name || null,
            middle_name || null,
            last_name || null,
            email || null,
            hashedPassword,
            id
        ];

        // Update the users table
        const userResult = await db.execute(`
            UPDATE users
            SET first_name = ?, middle_name = ?, last_name = ?, email = ?, password = COALESCE(?, password)
            WHERE id = ? AND role = 'teacher'
        `, userValues);

        if (userResult[0].affectedRows === 0) {
            throw new Error('No user found to update');
        }

        // Fetch existing sections and subjects for the teacher
        const [existingSections] = await db.execute(`
            SELECT ts.section_id AS section_id, ts.course, ts.year_and_section, 
                   GROUP_CONCAT(tsub.subject_id) AS subjects
            FROM teacher_sections ts
            LEFT JOIN teacher_subjects tsub ON ts.section_id = tsub.section_id
            WHERE ts.teacher_id = ?
            GROUP BY ts.section_id
        `, [id]);

        const existingSectionsMap = existingSections.reduce((map, section) => {
            map[`${section.course}_${section.year_and_section}`] = {
                section_id: section.section_id,
                subjects: section.subjects ? section.subjects.split(',').map(Number) : []
            };
            return map;
        }, {});

        // Loop over new yearSectionSubjects (provided by admin)
        for (const section of yearSectionSubjects) {
            const { course, year_and_section, subjects } = section;
            const sectionKey = `${course}_${year_and_section}`;

            // Check if section already exists
            if (existingSectionsMap[sectionKey]) {
                const existingSection = existingSectionsMap[sectionKey];
                const existingSubjectIds = existingSection.subjects;

                // Delete subjects that are unchecked
                const subjectsToDelete = existingSubjectIds.filter(subjectId => !subjects.includes(subjectId));

                if (subjectsToDelete.length > 0) {
                    const deletePlaceholders = subjectsToDelete.map(() => '?').join(',');
                    await db.execute(`
                        DELETE FROM teacher_subjects
                        WHERE section_id = ? AND subject_id IN (${deletePlaceholders})
                    `, [existingSection.section_id, ...subjectsToDelete]);
                }

                // Add new subjects that are not in the existing ones
                const subjectsToAdd = subjects.filter(subject => !existingSubjectIds.includes(subject));

                for (const subjectName of subjectsToAdd) {
                    const [subjectRows] = await db.execute(`
                        SELECT id FROM subjects WHERE name = ?
                    `, [subjectName]);

                    if (subjectRows.length === 0) {
                        console.error(`Subject name not found: ${subjectName}`);
                        continue;
                    }

                    const subjectId = subjectRows[0].id;

                    await db.execute(`
                        INSERT INTO teacher_subjects (teacher_id, section_id, subject_id)
                        VALUES (?, ?, ?)
                    `, [id, existingSection.section_id, subjectId]);
                }

                delete existingSectionsMap[sectionKey];
            } else {
                // If the section is new, insert the section and subjects
                const [sectionResult] = await db.execute(`
                    INSERT INTO teacher_sections (teacher_id, course, year_and_section)
                    VALUES (?, ?, ?)
                `, [id, course, year_and_section]);

                const sectionId = sectionResult.insertId;

                for (const subjectName of subjects) {
                    const [subjectRows] = await db.execute(`
                        SELECT id FROM subjects WHERE name = ?
                    `, [subjectName]);

                    if (subjectRows.length === 0) {
                        console.error(`Subject name not found: ${subjectName}`);
                        continue;
                    }

                    const subjectId = subjectRows[0].id;

                    await db.execute(`
                        INSERT INTO teacher_subjects (teacher_id, section_id, subject_id)
                        VALUES (?, ?, ?)
                    `, [id, sectionId, subjectId]);
                }
            }
        }

        // Delete any sections that were not updated
        const remainingSectionIds = Object.values(existingSectionsMap).map(section => section.section_id);
        if (remainingSectionIds.length > 0) {
            const deletePlaceholders = remainingSectionIds.map(() => '?').join(',');
            await db.execute(`
                DELETE FROM teacher_sections WHERE section_id IN (${deletePlaceholders})
            `, remainingSectionIds);
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
  