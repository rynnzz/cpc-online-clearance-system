const administrativeClearanceModel = require('../models/administrativeClearanceModel');

// Update administrative clearance status
exports.updateAdministrativeClearanceStatus = async (req, res) => {
    try {
        const { studentId, departmentId, sectionId, status } = req.body;
        // Call the model to update the status
        await administrativeClearanceModel.updateClearanceStatus(studentId, departmentId, sectionId, status);

        // Respond with a success message
        res.json({ message: 'Administrative clearance status updated successfully.' });
    } catch (error) {
        console.error('Error updating administrative clearance status:', error);

        // Respond with an error message
        res.status(500).json({ message: 'Server error. Failed to update administrative clearance status.' });
    }
};

exports.getClearanceStatus = async (req, res) => {
    try {
        const { studentId, departmentId, sectionId } = req.params;

        if (!studentId || !departmentId || !sectionId) {
            return res.status(400).json({ message: 'Missing required parameters.' });
        }

        const status = await administrativeClearanceModel.getClearanceStatus(studentId, departmentId, sectionId);
        if (status.length === 0) {
            return res.status(404).json({ message: 'Clearance status not found.' });
        }

        res.status(200).json({ status });
    } catch (error) {
        console.error('Error fetching clearance status:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};