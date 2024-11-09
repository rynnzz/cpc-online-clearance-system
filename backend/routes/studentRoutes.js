const express = require('express');
const router = express.Router();
const multer = require('multer');
const studentController = require('../controllers/studentController');

const upload = multer({ dest: 'uploads/' });

// Get all students
router.get('/', studentController.getAllStudents);

// Add a new student
router.post('/', studentController.addStudent);

router.post('/bulk-add', upload.single('file'), studentController.bulkAddStudents);

router.get('/:id/get-student-info', studentController.getStudentInfo)

router.post('/:id/add-subject', studentController.addSubject)

// Update a student
router.put('/:id', studentController.updateStudent);

// Delete a student
router.delete('/:id', studentController.deleteStudent);

module.exports = router;