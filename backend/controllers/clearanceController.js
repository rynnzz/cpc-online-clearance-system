const clearanceModel = require('../models/clearanceModel');

// Update clearance status
exports.updateClearanceStatus = async (req, res) => {
    try {
        const { studentId, subjectId, sectionId, status } = req.body;

        await clearanceModel.updateClearanceStatus(studentId, subjectId, sectionId, status);
        res.json({ message: 'Clearance status updated successfully' });
    } catch (error) {
        console.error('Error updating clearance status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
