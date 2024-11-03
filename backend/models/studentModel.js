const db = require('../config/database');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Get all students with user information
exports.getAllStudents = () => {
    // Query to join users and student_details tables and fetch all student details
    return db.execute(`
        SELECT u.id, u.role, u.first_name, u.middle_name, u.last_name, u.email, sd.degree, sd.yr_and_section, sd.student_type
        FROM users u
        JOIN student_details sd ON u.id = sd.student_id
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
    const { first_name, middle_name, last_name, email, password, degree, yr_and_section, student_type } = student;

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the users table
        const [userResult] = await db.execute(`
            INSERT INTO users (first_name, middle_name, last_name, email, password , role)
            VALUES (?, ?, ?, ?, ?, 'student')
        `, [first_name, middle_name, last_name, email, hashedPassword]);

        const userId = userResult.insertId;

        // Insert student details into the student_details table
        await db.execute(`
            INSERT INTO student_details (student_id, degree, yr_and_section, student_type)
            VALUES (?, ?, ?, ?)
        `, [userId, degree, yr_and_section, student_type]);

        return { message: 'student account added successfully' };
    } catch (err) {
        console.error(`Error adding student account: ${err.message}`);
        throw new Error(`Error adding student account: ${err.message}`);
    }
};

exports.addSubject = async (id, payload) => {
    const { subjects } = payload
    const connection = await db.getConnection(); // Ensure a connection to the database

    try {
        await connection.beginTransaction(); // Start a transaction

        for (const subject of subjects) {
            const [[subjectResult]] = await connection.execute(
                `SELECT id FROM subjects WHERE name = ?`,
                [subject]
            );

            if (!subjectResult) {
                throw new Error(`Subject ${subject} not found`);
            }

            const subject_id = subjectResult.id;

            // Insert into student_subjects
            await connection.execute(
                `INSERT INTO student_subjects (student_id, subject_id) VALUES (?, ?)`,
                [id, subject_id]
            );
        }

        await connection.execute(
            `UPDATE users SET first_login = FALSE WHERE id = ?`,
            [id]
        );

        await connection.commit(); // Commit the transaction if all inserts succeed
    } catch (error) {
        await connection.rollback(); // Rollback the transaction in case of an error
        console.error(`Error adding subjects: ${error.message}`);
        throw error;
    } finally {
        connection.release(); // Release the connection back to the pool
    }
};


// Update a student by ID
exports.updateStudent = (id, student) => {
    const { first_name, middle_name, last_name, degree, yr_and_section, student_type } = student;
    return db.execute(`
        UPDATE student_details 
        SET first_name = ?, middle_name = ?, last_name = ?, degree = ?, yr_and_section = ?
        WHERE student_id = ?
    `, [first_name, middle_name, last_name, degree, yr_and_section, student_type, id]);
};

// Delete a student by ID
exports.deleteStudent = (id) => {
    return db.execute(`
        DELETE FROM student_details 
        WHERE student_id = ?
    `, [id]);
};