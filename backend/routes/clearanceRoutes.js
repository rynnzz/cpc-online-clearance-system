const express = require('express');
const router = express.Router();
const clearanceController = require('../controllers/clearanceController');

// Route to update clearance status
router.post('/update', clearanceController.updateClearanceStatus);

module.exports = router;
