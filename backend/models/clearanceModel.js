const db = require('../config/database');

// Update or insert clearance status for a student in a specific subject and section
exports.updateClearanceStatus = async (studentId, subjectId, sectionId, status = 'Pending') => {
    // First, check if a record already exists
    const [rows] = await db.execute(`
        SELECT id FROM clearance_status 
        WHERE student_id = ? 
          AND subject_id = ? 
          AND section_id = ?
    `, [studentId, subjectId, sectionId]);

    if (rows.length > 0) {
        // Record exists, perform an UPDATE
        return db.execute(`
            UPDATE clearance_status
            SET 
                status = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                student_id = ? 
                AND subject_id = ? 
                AND section_id = ?
        `, [status, studentId, subjectId, sectionId]);
    } else {
        // Record does not exist, perform an INSERT with default status as 'Pending'
        return db.execute(`
            INSERT INTO clearance_status (student_id, subject_id, section_id, status, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [studentId, subjectId, sectionId, status]);
    }
};