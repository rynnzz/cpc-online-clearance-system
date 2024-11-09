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
