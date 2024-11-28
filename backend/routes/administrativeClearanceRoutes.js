const express = require('express');
const router = express.Router();
const administrativeClearanceController = require('../controllers/administrativeClearanceController');

// Route to update administrative clearance status
router.post('/update', administrativeClearanceController.updateAdministrativeClearanceStatus);

module.exports = router;
