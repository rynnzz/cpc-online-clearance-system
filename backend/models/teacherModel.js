const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = async (role) => {
    try {
        const [teachers] = await db.execute(
            `
            SELECT 
                u.id, 
                u.first_name, 
                u.middle_name, 
                u.last_name, 
                u.email, 
                u.role, 
                td.yr_and_section, 
                td.teacher_type, 
                GROUP_CONCAT(s.name) AS subjects
            FROM users u
            JOIN teacher_details td ON u.id = td.teacher_id
            LEFT JOIN teacher_subjects ts ON ts.teacher_id = u.id
            LEFT JOIN subjects s ON s.id = ts.subject_id
            WHERE u.role = ?
            GROUP BY u.id, u.first_name, u.middle_name, u.last_name, u.email, td.yr_and_section, td.teacher_type
            `,
            [role]
        );

        if (!teachers || teachers.length === 0) {
            return []; 
        }

        return teachers.map(row => ({
            ...row,
            subjects: row.subjects ? row.subjects.split(',') : [] // Split subjects into an array
        }));
    } catch (error) {
        throw new Error(error.message);
    }
};


// exports.getAllTeachers = () => {
//     return db.execute(`
//       SELECT * FROM users WHERE role = 'teacher';
//     `);
//   }


// Find teacher by ID with user information
exports.findById = (id) => {
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, td.yr_and_section, td.teacher_type
        FROM users u
        JOIN teacher_details td ON u.id = td.teacher_id
        WHERE u.id = ?
    `, [id]);
};

// Add a new teacher
exports.addTeacher = async (teacher) => {
    const { first_name, middle_name, last_name, email, password, yr_and_section, subjects, teacher_type } = teacher;

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
            INSERT INTO teacher_details (teacher_id, yr_and_section, teacher_type)
            VALUES (?, ?, ?)
        `, [userId, yr_and_section, teacher_type]);

        // Insert each subject into the teacher_subjects table
        for (const subjectId of subjects) {
            await db.execute(`
                INSERT INTO teacher_subjects (teacher_id, subject_id)
                VALUES (?, ?)
            `, [userId, subjectId]);
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
        yr_and_section,
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
            SET yr_and_section = ?, teacher_type = ?
            WHERE teacher_id = ?
        `, [yr_and_section || null, teacher_type || null, id]);

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