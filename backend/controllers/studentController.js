// controllers/studentController.js

const studentModel = require('../models/studentModel');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const role = 'student'; // Specify the role you want to filter by
        const [students] = await studentModel.getAllStudents(role);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add a new student
exports.addStudent = async (req, res) => {
    const newStudent = req.body;
    try {
        await studentModel.addStudent(newStudent);
        res.json({ message: 'student added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a student
exports.updateStudent = async (req, res) => {
    const { id } = req.params;
    const updatedStudent = req.body;
    try {
        await studentModel.updateStudent(id, updatedStudent);
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await studentModel.deleteStudent(id);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};