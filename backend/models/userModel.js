const db = require('../config/database');

// Find user by email
exports.login = (loginInput) => {
    console.log(loginInput)
    const query = `
      SELECT 
        u.*, 
        sd.student_id, 
        sd.id_num, 
        sd.section_id 
      FROM users u
      LEFT JOIN student_details sd ON u.id = sd.student_id
      WHERE u.email = ? OR sd.id_num = ?
    `;
    return db.execute(query, [loginInput, loginInput]); // Bind loginInput for both email and id_num
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
        SELECT 
            r.id as role_id, -- Include the role ID
            r.name as role_name -- Include the role name
        FROM 
            teacher_roles tr
        JOIN 
            roles r ON tr.role_id = r.id
        WHERE 
            tr.teacher_id = ?`,
        [teacherId]
    );
};

exports.updatePassword = async (userId, hashedPassword) => {
    try {
      return db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    } catch (error) {
      console.error('Error updating password in the database:', error);
      throw error;
    }
  };
  
