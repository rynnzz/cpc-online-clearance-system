// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/data', dashboardController.getDashboardData);

router.get('/student-dashboard/:studentId', dashboardController.getStudentDashboardData);

router.get('/teacher-dashboard/:teacherId', dashboardController.getTeacherDashboardData);

router.get('/:roleId/non-teaching-dashboard', dashboardController.getNonTeachingDashboardData);

module.exports = router;
