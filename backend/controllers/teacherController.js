// controllers/teacherController.js

const teacherModel = require('../models/teacherModel');

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const role = 'teacher'; // Ensure role matches your data
        const page = parseInt(req.query.page) || 1; // Get page from query params
        const limit = parseInt(req.query.limit) || 50000; // Get limit from query params

        const teachers = await teacherModel.getAllTeachers(role, page, limit);
        res.json(teachers); // Respond with the list of teachers and pagination info
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

exports.addYearSection = async (req, res) => {
    console.log('Received data:', req.body); // This should log the array of sections
    const sections = req.body;
    const teacher_id = req.params.id;

    // Check if sections is an array
    if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of sections.' });
    }

    try {
        for (const section of sections) {
            // Validate the section structure
            if (!section || typeof section !== 'object') {
                throw new Error('Each item in sections array must be an object with course, year_and_section, and subjects.');
            }

            const { course, year_and_section, subjects } = section;

            // Validate each property
            if (!course || !year_and_section || !Array.isArray(subjects) || subjects.length === 0) {
                throw new Error('Invalid section format. Each section must have course, year_and_section, and a non-empty array of subjects.');
            }

            // Add teacher_id to each section object before passing it to the model
            await teacherModel.addYearSection({ teacher_id, course, year_and_section, subjects });
        }
        res.json({ message: 'Year and Sections added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Update a teacher                                                                     
exports.updateTeacher = async (req, res) => {
    const { id } = req.params;
    const updatedTeacher = req.body;

    try {
        // Call the model's update function
        const result = await teacherModel.updateTeacher(id, updatedTeacher);
        
        // Send a success response
        res.json({ message: 'Teacher updated successfully', result });
    } catch (err) {
        console.error(`Error updating teacher: ${err.message}`); // Log error for debugging
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

exports.deleteTeacherSection = async (req, res) => {
    const sectionId = req.params.id;
  
    try {
      await teacherModel.deleteSection(sectionId);
      res.json({ message: 'Year Section deleted successfully' });
    } catch (error) {
      console.error('Error deleting section:', error);
      res.status(500).json({ message: 'Error deleting section' });
    }
  };

exports.getTeacherSubjects = async (req, res) => {
    const { teacherId } = req.params;
    if (!teacherId) {
        return res.status(400).json({ error: 'Teacher ID is required' });
    }

    try {
        const subjects = await teacherModel.getTeacherSubjects(teacherId);
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};