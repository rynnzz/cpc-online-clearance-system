const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = async (role, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;

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
                ts.course_year_and_section,
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

        if (!rows || rows.length === 0) {
            return { teachers: [], total: 0 };
        }

        // Get total count of teachers for pagination
        const [totalRows] = await db.execute(
            `SELECT COUNT(*) as count FROM users WHERE role = ?`,
            [role]
        );
        const total = totalRows[0].count;

        // Transform the flat result set into grouped data
        const teachers = rows.reduce((acc, row) => {
            const teacherId = row.teacher_id;

            if (!acc[teacherId]) {
                acc[teacherId] = {
                    id: row.teacher_id,
                    first_name: row.first_name,
                    middle_name: row.middle_name,
                    last_name: row.last_name,
                    email: row.email,
                    role: row.role,
                    teacher_type: row.teacher_type,
                    yearSectionSubjects: []
                };
            }

            // Find if the year_and_section already exists in the teacher's array
            let yearSection = acc[teacherId].yearSectionSubjects.find(ys => ys.course_year_and_section === row.course_year_and_section);

            if (!yearSection) {
                yearSection = {
                    course_year_and_section: row.course_year_and_section,
                    subjects: []
                };
                acc[teacherId].yearSectionSubjects.push(yearSection);
            }

            // Add the subject to the correct year and section
            if (row.subject_name) {
                yearSection.subjects.push(row.subject_name);
            }

            return acc;
        }, {});

        // Return the teachers as an array along with pagination info
        return {
            teachers: Object.values(teachers),
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};

// Add a new teacher
exports.addTeacher = async (teacher) => {
    const { first_name, middle_name, last_name, email, password, teacher_type, yearSectionSubjects } = teacher;

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

        // Insert each year & section along with the subjects they handle
        for (const yearSection of yearSectionSubjects) {
            const { course_year_and_section, subjects } = yearSection;

            // Insert into teacher_sections table
            const [sectionResult] = await db.execute(`
                INSERT INTO teacher_sections (teacher_id, course_year_and_section)
                VALUES (?, ?)
            `, [userId, course_year_and_section]);

            const sectionId = sectionResult.insertId; // Get the inserted section_id

            // Check if subjects exist before insertion
            if (Array.isArray(subjects) && subjects.length > 0) {
                for (const subjectId of subjects) {
                    try {
                        await db.execute(`
                            INSERT INTO teacher_subjects (teacher_id, section_id, subject_id)
                            VALUES (?, ?, ?)
                        `, [userId, sectionId, subjectId]);
                    } catch (insertError) {
                        console.error(`Error inserting subject for teacher_id ${userId}, section_id ${sectionId}: ${insertError.message}`);
                    }
                }
            } else {
                console.warn(`No subjects found for year & section: ${course_year_and_section}`);
            }
        }

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
        course_yr_and_section,
        subjects = [],
        teacher_type
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

        // Log the update attempt
        console.log('Updating user with values:', userValues);

        // Update the users table
        const userResult = await db.execute(`
            UPDATE users
            SET first_name = ?, middle_name = ?, last_name = ?, email = ?, password = ?
            WHERE id = ? AND role = 'teacher'
        `, userValues);

        if (userResult[0].affectedRows === 0) {
            throw new Error('No user found to update');
        }

        // Update the teacher_details table
        const teacherResult = await db.execute(`
            UPDATE teacher_details
            SET course_yr_and_section = ?, teacher_type = ?
            WHERE teacher_id = ?
        `, [course_yr_and_section || null, teacher_type || null, id]);

        // Check teacher update
        if (teacherResult[0].affectedRows === 0) {
            throw new Error('No teacher details found to update');
        }

        // Clear existing subjects for the teacher
        await db.execute(`
            DELETE FROM teacher_subjects
            WHERE teacher_id = ?
        `, [id]);

        // Insert new subjects if any
        if (subjects.length > 0) {
            const subjectInsertQueries = subjects.map(subject => {
                return db.execute(`
                    INSERT INTO teacher_subjects (teacher_id, subject_id)
                    VALUES (?, (SELECT id FROM subjects WHERE name = ?))
                `, [id, subject]);
            });

            await Promise.all(subjectInsertQueries);
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