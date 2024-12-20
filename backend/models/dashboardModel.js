const db = require('../config/database');

// Fetch various user counts
exports.getUserCounts = async () => {
    try {
      // Query to get the counts of users grouped by role
      const [userCounts] = await db.execute(`
        SELECT role, COUNT(*) AS total 
        FROM users 
        GROUP BY role
      `);
  
      // Query to get the total count of subjects
      const [subjectCounts] = await db.execute(`
        SELECT COUNT(DISTINCT name) AS total 
FROM subjects;

      `);
  
      // Structure the response to include both user counts and subjects count
      const counts = userCounts.reduce((acc, row) => {
        acc[row.role] = row.total;
        return acc;
      }, {});
  
      // Add the subjects count to the response
      counts.subjects = subjectCounts[0].total;
  
      return counts;
    } catch (error) {
      console.error("Error fetching user counts:", error);
      throw error;
    }
  };
  

// Fetch recent registrations (e.g., recent 5)
exports.getRecentRegistrations = async () => {
  try {
    const [registrations] = await db.execute(`
      SELECT 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.created_at,
        sd.student_type AS student_type, -- Fetch student type for students
        GROUP_CONCAT(r.name SEPARATOR ', ') AS teacher_roles -- Concatenate teacher roles
      FROM users u
      LEFT JOIN student_details sd ON u.id = sd.student_id -- Join student_details for students
      LEFT JOIN teacher_roles tr ON u.id = tr.teacher_id -- Join teacher_roles for teachers
      LEFT JOIN roles r ON tr.role_id = r.id -- Fetch role names from roles table
      WHERE u.role IN ('student', 'teacher') -- Filter only students and teachers
      GROUP BY u.id -- Group by user ID to aggregate teacher roles
      ORDER BY u.created_at DESC 
      LIMIT 5
    `);

    return registrations;
  } catch (error) {
    console.error("Error fetching recent registrations:", error.message);
    throw new Error("Unable to fetch recent registrations. Please try again later.");
  }
};

exports.getStudentDashboardData = async (studentId) => {
  try {
    // SQL Query to fetch student dashboard data
    const [rows] = await db.execute(
      `
      SELECT 
        COUNT(DISTINCT ss.subject_id) AS total_subjects, -- Total unique subjects
        IFNULL(SUM(s.units), 0) AS total_units, -- Total subject units
         (
          (
            SELECT COUNT(DISTINCT id) 
            FROM clearance_status 
            WHERE student_id = ? AND status = 'Approved'
          ) +
          (
            SELECT COUNT(DISTINCT id) 
            FROM administrative_clearance_status 
            WHERE student_id = ? AND status = 'Approved'
          )
        ) AS approved_clearances -- Total approved clearances including administrative
      FROM student_subjects ss
      LEFT JOIN clearance_status c 
        ON c.subject_id = ss.subject_id AND c.student_id = ss.student_id
      JOIN subjects s 
        ON ss.subject_id = s.id
      JOIN current_semester cs 
        ON cs.semester = s.semester
      WHERE ss.student_id = ?;
      `,
      [studentId, studentId, studentId]
    );

    // Return the fetched data
    return rows[0];
  } catch (error) {
    console.error("Error fetching student dashboard data:", error.message);
    throw new Error("Unable to fetch dashboard data. Please try again later.");
  }
};



exports.getTeacherDashboardData = async (teacherId) => {
  try {
    // SQL Query to fetch teacher dashboard data
    const [result] = await db.execute(
      `
      SELECT 
        COUNT(DISTINCT ts.subject_id) AS total_subjects, -- Count unique subjects
        COUNT(DISTINCT ts.section_id) AS total_sections, -- Count unique sections
        COUNT(DISTINCT ss.student_id) AS total_students -- Count unique students
      FROM teacher_subjects ts
      LEFT JOIN student_sections ss ON ss.section_id = ts.section_id
      WHERE ts.teacher_id = ?;
      `,
      [teacherId]
    );

    // Return the fetched data
    return {
      totalSubjects: result[0].total_subjects || 0,
      totalSections: result[0].total_sections || 0,
      totalStudents: result[0].total_students || 0,
    };
  } catch (error) {
    console.error("Error fetching teacher dashboard data:", error.message);
    throw new Error("Unable to fetch teacher dashboard data. Please try again later.");
  }
};

exports.getNonTeachingDashboardData = async (roleId) => {
  try {
    // Query to count pending clearances for the given role
    const [pendingClearancesResult] = await db.execute(
      `
      SELECT COUNT(*) AS pending_clearances
      FROM administrative_clearance_status
      WHERE role_id = ? AND status = 'Pending'
      `,
      [roleId]
    );

    // Query to count all students in the users table with role "student"
    const [studentsResult] = await db.execute(
      `
      SELECT COUNT(*) AS total_students
      FROM users
      WHERE role = 'student'
      `
    );

    // Query to count all departments in the departments table
    const [departmentsResult] = await db.execute(
      `
      SELECT COUNT(*) AS total_departments
      FROM departments
      `
    );

    // Return the aggregated data
    return {
      pendingClearances: pendingClearancesResult[0]?.pending_clearances || 0,
      totalStudents: studentsResult[0]?.total_students || 0,
      totalDepartments: departmentsResult[0]?.total_departments || 0,
    };
  } catch (error) {
    console.error("Error fetching non-teaching staff dashboard data:", error.message);
    throw new Error("Unable to fetch non-teaching staff dashboard data. Please try again later.");
  }
};



