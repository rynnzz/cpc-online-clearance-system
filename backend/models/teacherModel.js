const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = () => {
    // Query to join users and teacher_details tables and fetch all teacher details
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, td.yr_and_section, td.subjects, td.teacher_type
        FROM users u
        JOIN teacher_details td ON u.id = td.user_id
        WHERE u.role = 'teacher'
    `);
};

// Find teacher by ID with user information
exports.findById = (id) => {
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, td.yr_and_section, td.subjects, td.teacher_type
        FROM users u
        JOIN teacher_details td ON u.id = td.user_id
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
            INSERT INTO teacher_details (user_id, yr_and_section, subjects, teacher_type)
            VALUES (?, ?, ?, ?)
        `, [userId, yr_and_section, subjects, teacher_type]);

        return { message: 'Teacher account added successfully' };
    } catch (err) {
        console.error(`Error adding teacher account: ${err.message}`);
        throw new Error(`Error adding teacher account: ${err.message}`);
    }
};

// Update a teacher by ID
exports.updateTeacher = async (id, teacher) => {
    const { first_name, middle_name, last_name, email, password, yr_and_section, subjects, teacher_type } = teacher;

    try {
        // Hash the password (if provided)
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Update the users table
        await db.execute(`
            UPDATE users
            SET first_name = ?, middle_name = ?, last_name = ?, email = ?, password = ?
            WHERE id = ? AND role = 'teacher'
        `, [first_name, middle_name, last_name, email, hashedPassword || password, id]);

        // Update the teacher_details table
        await db.execute(`
            UPDATE teacher_details
            SET yr_and_section = ?, subjects = ?, teacher_type = ?
            WHERE user_id = ?
        `, [yr_and_section, subjects, teacher_type, id]);

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
        WHERE user_id = ?
    `, [id]);
};

// Get subjects handled by a teacher
exports.getTeacherSubjects = async (teacherId) => {
    try {
        const [rows] = await db.query('SELECT subjects FROM teacher_details WHERE user_id = ?', [teacherId]);
        return rows;
    } catch (error) {
        throw new Error('Error fetching teacher subjects');
    }
};