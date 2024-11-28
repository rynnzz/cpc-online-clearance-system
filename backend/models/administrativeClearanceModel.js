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

exports.getClearanceStatus = async (studentId, departmentId, sectionId) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                acs.student_id, 
                acs.department_id, 
                acs.section_id, 
                acs.status,
                d.name AS department_name,
                s.section AS section_name,
                acs.updated_at
            FROM administrative_clearance_status acs
            LEFT JOIN departments d ON acs.department_id = d.id
            LEFT JOIN sections s ON acs.section_id = s.id
            WHERE acs.student_id = ? AND acs.department_id = ? AND acs.section_id = ?
        `, [studentId, departmentId, sectionId]);
        return rows;
    } catch (error) {
        throw new Error('Failed to fetch clearance status: ' + error.message);
    }
};