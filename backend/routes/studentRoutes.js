const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Get all students
router.get('/', studentController.getAllStudents);

// Add a new student
router.post('/', studentController.addStudent);

router.post('/:id/add-subject', studentController.addSubject)

// Update a student
router.put('/:id', studentController.updateStudent);

// Delete a student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;