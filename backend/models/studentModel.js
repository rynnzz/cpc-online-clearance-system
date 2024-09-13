const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all students with user information
exports.getAllStudents = () => {
    // Query to join users and student_details tables and fetch all student details
    return db.execute(`
        SELECT u.id, u.email, u.role,  sd.first_name, sd.middle_name, sd.last_name, sd.degree, sd.yr_and_section
        FROM users u
        JOIN student_details sd ON u.id = sd.user_id
        WHERE u.role = 'student'
    `);
};

// Find student by ID with user information
exports.findById = (id) => {
    return db.execute(`
        SELECT u.id, u.role, sd.first_name, sd.middle_name, sd.last_name, sd.degree, sd.yr_and_section
        FROM users u
        JOIN student_details sd ON u.id = sd.user_id
        WHERE u.id = ?
    `, [id]);
};

// Add a new student
exports.add = async (student) => {
    const { first_name, middle_name, last_name, email, password, degree, yr_and_section } = student;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (email, password, role)
            VALUES (?, ?, 'student')
        `, [email, hashedPassword]);

        const userId = userResult.insertId;

        // Insert student details into the student_details table
        await db.execute(`
            INSERT INTO student_details (user_id, first_name, middle_name, last_name, degree, yr_and_section)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [userId, first_name, middle_name, last_name, degree, yr_and_section]);

        return { message: 'student account added successfully' };
    } catch (err) {
        console.error(`Error adding student account: ${err.message}`);
        throw new Error(`Error adding student account: ${err.message}`);
    }
};

// Update a student by ID
exports.updateStudent = (id, student) => {
    const { first_name, middle_name, last_name, degree, yr_and_section } = student;
    return db.execute(`
        UPDATE student_details 
        SET first_name = ?, middle_name = ?, last_name = ?, degree = ?, yr_and_section = ?
        WHERE user_id = ?
    `, [first_name, middle_name, last_name, degree, yr_and_section, id]);
};

// Delete a student by ID
exports.deleteStudent = (id) => {
    return db.execute(`
        DELETE FROM student_details 
        WHERE user_id = ?
    `, [id]);
};
