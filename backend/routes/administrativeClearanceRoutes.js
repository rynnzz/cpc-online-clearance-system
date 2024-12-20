const express = require('express');
const router = express.Router();
const administrativeClearanceController = require('../controllers/administrativeClearanceController');

// Route to update administrative clearance status
router.post('/update', administrativeClearanceController.updateAdministrativeClearanceStatus);

router.get('/:id/get-administrative-clearance', administrativeClearanceController.fetchAdministrativeClearance)

module.exports = router;
