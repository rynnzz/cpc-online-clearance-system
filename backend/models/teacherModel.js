const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all teachers with user information
exports.getAllTeachers = () => {
    // Query to join users and teacher_details tables and fetch all teacher details
    return db.execute(`
        SELECT u.id, u.role, td.name, td.email, td.subject
        FROM users u
        JOIN teacher_details td ON u.id = td.user_id
        WHERE u.role = 'teacher'
    `);
};

// Find teacher by ID with user information
exports.findById = (id) => {
    return db.execute(`
        SELECT u.id, u.role, td.name, td.email, td.subject
        FROM users u
        JOIN teacher_details td ON u.id = td.user_id
        WHERE u.id = ?
    `, [id]);
};

// Add a new teacher
exports.add = async (teacher) => {
    const { email, password, name, subject } = teacher;

    // Validate input
    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string' || typeof subject !== 'string') {
        throw new Error('Invalid input data');
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (email, password, role)
            VALUES (?, ?, 'teacher')
        `, [email, hashedPassword]);

        const userId = userResult.insertId;

        // Insert teacher details into the teacher_details table
        await db.execute(`
            INSERT INTO teacher_details (user_id, name, email, subject)
            VALUES (?, ?, ?, ?)
        `, [userId, name, email, subject]);

        return { message: 'Teacher account added successfully' };
    } catch (err) {
        console.error(`Error adding teacher account: ${err.message}`);
        throw new Error(`Error adding teacher account: ${err.message}`);
    }
};

// Update a teacher by ID
exports.updateTeacher = (id, teacher) => {
    const { name, email, subject } = teacher;
    return db.execute(`
        UPDATE teacher_details 
        SET name = ?, email = ?, subject = ? 
        WHERE user_id = ?
    `, [name, email, subject, id]);
};

// Delete a teacher by ID
exports.deleteTeacher = (id) => {
    return db.execute(`
        DELETE FROM teacher_details 
        WHERE user_id = ?
    `, [id]);
};
