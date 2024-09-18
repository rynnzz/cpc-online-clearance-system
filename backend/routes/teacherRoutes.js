// routes/teacherRoutes.js

const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Route to get all teachers
router.get('/', teacherController.getAllTeachers);

// Route to add a new teacher
router.post('/', teacherController.addTeacher);

// Route to update a teacher
router.put('/:id', teacherController.updateTeacher);

// Route to delete a teacher
router.delete('/:id', teacherController.deleteTeacher);

// Route to get subjects handled by a specific teacher
router.get('/:teacherId/subjects', teacherController.getTeacherSubjects);

module.exports = router;
