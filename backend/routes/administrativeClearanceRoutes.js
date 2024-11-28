const express = require('express');
const router = express.Router();
const administrativeClearanceController = require('../controllers/administrativeClearanceController');

// Route to update administrative clearance status
router.post('/update', administrativeClearanceController.updateAdministrativeClearanceStatus);

router.get('/:id/get-clearance-status', administrativeClearanceController.getClearanceStatus)

module.exports = router;
