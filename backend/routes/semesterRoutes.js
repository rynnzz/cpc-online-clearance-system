const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

router.put('/update-semester', semesterController.updateSemester)

router.get('/get-semester', semesterController.getSemester)

module.exports = router;