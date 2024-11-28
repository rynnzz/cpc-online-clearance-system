const db = require('../config/database');

// Update or insert administrative clearance status for a student in a specific department and section
exports.updateClearanceStatus = async (studentId, departmentId, sectionId, status = 'Pending') => {
    // First, check if a record already exists
    const [rows] = await db.execute(`
        SELECT id FROM administrative_clearance_status 
        WHERE student_id = ? 
          AND department_id = ? 
          AND section_id = ?
    `, [studentId, departmentId, sectionId]);

    if (rows.length > 0) {
        // Record exists, perform an UPDATE
        return db.execute(`
            UPDATE administrative_clearance_status
            SET 
                status = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                student_id = ? 
                AND department_id = ? 
                AND section_id = ?
        `, [status, studentId, departmentId, sectionId]);
    } else {
        // Record does not exist, perform an INSERT with default status as 'Pending'
        return db.execute(`
            INSERT INTO administrative_clearance_status (student_id, department_id, section_id, status, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [studentId, departmentId, sectionId, status]);
    }
};