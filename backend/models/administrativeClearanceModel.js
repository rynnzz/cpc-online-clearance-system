const db = require('../config/database');

exports.getAdministrativeClearance = async (roleId) => {
    if (!roleId) {
        throw new Error('Role ID is required');
    }

    return db.execute(`
        SELECT 
            acs.id AS clearance_id,
            acs.student_id,
            u.first_name AS student_first_name,
            u.last_name AS student_last_name,
            u.email AS student_email,
            sd.id_num AS student_id_number,
            acs.department_id,
            dep.name AS department_name,
            acs.section_id,
            sec.year AS section_year,
            sec.section AS section_name,
            acs.status AS clearance_status,
            acs.role_id,
            r.name AS role_name,
            acs.updated_at
        FROM 
            administrative_clearance_status acs
        JOIN 
            users u ON acs.student_id = u.id
        JOIN
            student_details sd ON u.id = sd.student_id
        JOIN 
            departments dep ON acs.department_id = dep.id
        JOIN 
            sections sec ON acs.section_id = sec.id
        JOIN 
            roles r ON acs.role_id = r.id
        WHERE 
            acs.role_id = ? 
            AND r.name NOT IN ('Full Time', 'Part Time') -- Exclude Full Time and Part Time roles
        ORDER BY 
            acs.updated_at DESC
    `, [roleId]);
};


// Update or insert administrative clearance status for a student in a specific department and section
exports.updateClearanceStatus = async (studentId, departmentId, sectionId, status = 'Pending', roleIds = []) => {
    try {
        // Ensure roleIds is an array
        if (!Array.isArray(roleIds)) {
            throw new Error('roleIds must be an array');
        }

        // Iterate over each roleId and execute the query
        for (const roleId of roleIds) {
            // Check if a record already exists
            const [rows] = await db.execute(`
                SELECT id FROM administrative_clearance_status 
                WHERE student_id = ? 
                  AND department_id = ? 
                  AND section_id = ?
                  AND role_id = ?
            `, [studentId, departmentId, sectionId, roleId]);

            if (rows.length > 0) {
                // Record exists, perform an UPDATE
                await db.execute(`
                    UPDATE administrative_clearance_status
                    SET 
                        status = ?, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE 
                        student_id = ? 
                        AND department_id = ? 
                        AND section_id = ?
                        AND role_id = ?
                `, [status, studentId, departmentId, sectionId, roleId]);
            } else {
                // Record does not exist, perform an INSERT
                await db.execute(`
                    INSERT INTO administrative_clearance_status (student_id, department_id, section_id, status, role_id, updated_at)
                    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `, [studentId, departmentId, sectionId, status, roleId]);
            }
        }
    } catch (error) {
        console.error('Error updating administrative clearance status:', error);
        throw error;
    }
};
