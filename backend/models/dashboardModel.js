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
