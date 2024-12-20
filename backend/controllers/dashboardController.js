// controllers/dashboardController.js
const dashboardModel = require('../models/dashboardModel');

exports.getDashboardData = async (req, res) => {
  try {
    const userCounts = await dashboardModel.getUserCounts();
    const recentRegistrations = await dashboardModel.getRecentRegistrations();

    // Combine all data into one response
    const dashboardData = {
      userCounts,
      recentRegistrations,
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getStudentDashboardData = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Fetch data from the model
    const dashboardData = await dashboardModel.getStudentDashboardData(studentId);

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
  }
};

exports.getTeacherDashboardData = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    const teacherDashboardData = await dashboardModel.getTeacherDashboardData(teacherId)

    res.json(teacherDashboardData);
  } catch (error) {
  console.error("Error fetch teacher dashboard data", error)
}
}

exports.getNonTeachingDashboardData = async (req, res) => {
  try {
    const roleId = req.params.roleId

    const nonTeachingDashboardData = await dashboardModel.getNonTeachingDashboardData(roleId)

    res.json(nonTeachingDashboardData);
  } catch (error) {
    console.error("Error fetch non-teaching dashboard data", error)
  }
}

