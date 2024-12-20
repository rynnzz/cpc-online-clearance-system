const express = require('express');
const router = express.Router();
const multer = require('multer');
const teacherController = require('../controllers/teacherController');

const upload = multer({ dest: 'uploads/' });

// Route to get all teachers
router.get('/', teacherController.getAllTeachers);

router.get('/:id/get-teacher-subjects', teacherController.getTeacherSubjects)

router.get('/:id/get-teacher-info', teacherController.getTeacherInfo)

// Route to add a new teacher
router.post('/', teacherController.addTeacher);

router.post('/bulk-add', upload.single('file'), teacherController.bulkAddTeachers);

router.post('/:id/year-sections', teacherController.addYearSection);

// Route to update a teacher
router.put('/:id', teacherController.updateTeacher);

// Route to delete a teacher
router.delete('/:id', teacherController.deleteTeacher);

router.delete('/:id', teacherController.deleteTeacherSection);

module.exports = router;
