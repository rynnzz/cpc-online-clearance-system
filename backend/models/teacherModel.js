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
                td.teacher_type,
                ts.course,
                ts.year_and_section,
                s.name AS subject_name
            FROM users u
            JOIN teacher_details td ON u.id = td.teacher_id
            LEFT JOIN teacher_subjects tsub ON tsub.teacher_id = u.id
            LEFT JOIN subjects s ON s.id = tsub.subject_id
            LEFT JOIN teacher_sections ts ON ts.teacher_id = u.id
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
                    teacher_type: row.teacher_type,
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

// Model: Handle insertion of sections and updating signature
exports.addYearSection = async (data) => {
    const { teacher_id, course, year_and_section, subjects, signature } = data;

    const connection = await db.getConnection(); // Start a connection for the transaction

    try {
        await connection.beginTransaction(); // Begin transaction

        // Insert into teacher_sections and retrieve the section_id
        const [result] = await connection.execute(
            `INSERT INTO teacher_sections (teacher_id, course, year_and_section) VALUES (?, ?, ?)`,
            [teacher_id, course, year_and_section]
        );
        const section_id = result.insertId; // Get the generated section_id

        // Insert subjects for each section
        for (const subject of subjects) {
            const [[subjectResult]] = await connection.execute(
                `SELECT id FROM subjects WHERE name = ?`,
                [subject]
            );
            const subject_id = subjectResult.id;

            // Insert into teacher_subjects
            await connection.execute(
                `INSERT INTO teacher_subjects (teacher_id, section_id, subject_id) VALUES (?, ?, ?)`,
                [teacher_id, section_id, subject_id]
            );
        }

        // Update the teacher's signature in teacher_details
        await connection.execute(
            `UPDATE teacher_details SET signature = ? WHERE teacher_id = ?`,
            [signature, teacher_id]
        );

        // Update first_login to false after all subjects have been successfully inserted
        await connection.execute(
            `UPDATE users SET first_login = FALSE WHERE id = ?`,
            [teacher_id]
        );

        await connection.commit(); // Commit the transaction if all inserts succeed
    } 
    catch (err) {
        await connection.rollback(); // Rollback if there’s an error
        console.error(`Error adding new year and section with subjects: ${err.message}`);
        throw new Error(`Error adding new year and section with subjects: ${err.message}`);
    } 
    finally {
        connection.release(); // Release the connection back to the pool
    }
};



// Add a new teacher
exports.addTeacher = async (teacher) => {
    const { first_name, middle_name, last_name, email, password, teacher_type } = teacher;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (first_name, middle_name, last_name, email, password, role)
            VALUES (?, ?, ?, ?, ?, 'teacher')
        `, [first_name, middle_name, last_name, email, hashedPassword]);

        const userId = userResult.insertId;

        // Insert teacher details into the teacher_details table
        await db.execute(`
            INSERT INTO teacher_details (teacher_id, teacher_type)
            VALUES (?, ?)
        `, [userId, teacher_type]);

        return { message: 'Teacher account added successfully' };
    } catch (err) {
        console.error(`Error adding teacher account: ${err.message}`);
        throw new Error(`Error adding teacher account: ${err.message}`);
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
        teacher_type,
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

        // Update the teacher_details table
        const teacherResult = await db.execute(`
            UPDATE teacher_details
            SET teacher_type = ?
            WHERE teacher_id = ?
        `, [teacher_type || null, id]);

        if (teacherResult[0].affectedRows === 0) {
            throw new Error('No teacher details found to update');
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
exports.deleteTeacher = (id) => {
    return db.execute(`
        DELETE FROM teacher_details 
        WHERE teacher_id = ?
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
  