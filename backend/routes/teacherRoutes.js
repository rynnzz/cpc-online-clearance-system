const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

// Get all teachers
router.get('/', teacherController.getAllTeachers);

// Add a new teacher
router.post('/', teacherController.addTeacher);

// Update a teacher
router.put('/:id', teacherController.updateTeacher);

// Delete a teacher
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;