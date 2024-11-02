// routes/teacherRoutes.js

const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Route to get all teachers
router.get('/', teacherController.getAllTeachers);

router.get('/:id', teacherController.getTeacherInfo)

// Route to add a new teacher
router.post('/', teacherController.addTeacher);

router.post('/:id/year-sections', teacherController.addYearSection);

// Route to update a teacher
router.put('/:id', teacherController.updateTeacher);

// Route to delete a teacher
router.delete('/:id', teacherController.deleteTeacher);

router.delete('/:id', teacherController.deleteTeacherSection);

module.exports = router;
