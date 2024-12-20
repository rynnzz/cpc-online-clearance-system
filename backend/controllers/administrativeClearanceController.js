const administrativeClearanceModel = require('../models/administrativeClearanceModel');

exports.fetchAdministrativeClearance = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Role ID is required' });
        }

        const [results] = await administrativeClearanceModel.getAdministrativeClearance(id);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No clearance data found for this role' });
        }

        return res.status(200).json({ clearanceData: results });
    } catch (error) {
        console.error('Error fetching administrative clearance:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateAdministrativeClearanceStatus = async (req, res) => {
    try {
        const { studentId, departmentId, sectionId, status, roleId } = req.body;
        console.log(req.body);
        // Call the model to update the status
        await administrativeClearanceModel.updateClearanceStatus(studentId, departmentId, sectionId, status, roleId);

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