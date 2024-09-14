// controllers/teacherController.js

const teacherModel = require('../models/teacherModel');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const role = 'teacher'; // Specify the role you want to filter by
        const [teachers] = await teacherModel.getAllTeachers(role);
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a new teacher
exports.addTeacher = async (req, res) => {
    const newTeacher = req.body;
    try {
        await teacherModel.addTeacher(newTeacher);
        res.json({ message: 'Teacher added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a teacher
exports.updateTeacher = async (req, res) => {
    const { id } = req.params;
    const updatedTeacher = req.body;
    try {
        await teacherModel.updateTeacher(id, updatedTeacher);
        res.json({ message: 'Teacher updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a teacher
exports.deleteTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        await teacherModel.deleteTeacher(id);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
