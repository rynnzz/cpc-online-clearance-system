const express = require('express');
const router = express.Router();
const multer = require('multer');
const subjectController = require('../controllers/subjectController');

const upload = multer({ dest: 'uploads/' });

// Get all subjects with optional filtering
router.get('/', subjectController.getAllSubjects);

// Add a new subject
router.post('/', subjectController.addSubject);

router.post('/bulk-add', upload.single('file'), subjectController.bulkAddSubjects);

// Update a subject
router.put('/:id', subjectController.updateSubject);

// Delete a subject
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
