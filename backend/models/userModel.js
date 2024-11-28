const db = require('../config/database');

// Find user by email
exports.findByEmail = (email) => {
    return db.execute('SELECT * FROM users WHERE email = ?', [email]);
};

// Find sections assigned to a teacher
exports.findTeacherSections = (teacherId) => {
    return db.execute('SELECT * FROM teacher_sections WHERE teacher_id = ?', [teacherId]);
};

// Find subjects assigned to a teacher
exports.findTeacherSubjects = (teacherId) => {
    return db.execute(`
        SELECT ts.*, s.name as subject_name 
        FROM teacher_subjects ts
        JOIN subjects s ON ts.subject_id = s.id
        WHERE ts.teacher_id = ?`,
        [teacherId]
    );
};

// Find user by ID
exports.findById = (id) => {
    return db.execute('SELECT * FROM users WHERE id = ?', [id]);
};

// Find roles assigned to a teacher
exports.findTeacherRoles = (teacherId) => {
    return db.execute(`
        SELECT r.name as role_name 
        FROM teacher_roles tr
        JOIN roles r ON tr.role_id = r.id
        WHERE tr.teacher_id = ?`,
        [teacherId]
    );
};
