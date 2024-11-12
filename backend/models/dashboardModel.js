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
        SELECT COUNT(*) AS total 
        FROM subjects
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
        CASE 
          WHEN u.role = 'student' THEN sd.student_type
          ELSE NULL 
        END AS student_type,
        CASE 
          WHEN u.role = 'teacher' THEN td.teacher_type
          ELSE NULL 
        END AS teacher_type
      FROM users u
      LEFT JOIN student_details sd ON u.id = sd.student_id AND u.role = 'student'
      LEFT JOIN teacher_details td ON u.id = td.teacher_id AND u.role = 'teacher'
      ORDER BY u.created_at DESC 
      LIMIT 5
    `);

    return registrations;
  } catch (error) {
    console.error("Error fetching recent registrations:", error);
    throw error;
  }
};

