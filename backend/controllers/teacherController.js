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

exports.getTeacherInfo = async (req, res) => {
    try {
        const id = req.params.id; // Get the id from the URL parameters
        const [user] = await teacherModel.getTeacherInfo(id); // Fetch user info

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send user details including all relevant data
        res.json({
            teacherId: user[0].teacher_id,
            firstName: user[0].first_name,
            middleName: user[0].middle_name,
            lastName: user[0].last_name,
            email: user[0].email,
            role: user[0].role,
            teacherType: user[0].teacher_type,
            subjects: user.map(item => ({
                course: item.course,
                yearAndSection: item.year_and_section,
                subjectName: item.subject_name,
            })),
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Server error' });
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

// Controller: Handling the payload (array of sections) and the signature
exports.addYearSection = async (req, res) => {
    const { sections, signature } = req.body; // Extract sections and signature from the payload
    const teacher_id = req.params.id;

    // Validate the sections array
    if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: 'Invalid data format. Expected an array of sections.' });
    }

    try {
        for (const section of sections) {
            const { course, year_and_section, subjects } = section;

            // Call the model function to handle each section, including the signature
            await teacherModel.addYearSection({ teacher_id, course, year_and_section, subjects, signature });
        }

        res.json({ message: 'Year and Sections added successfully' });
    } catch (err) {
        console.error('Error:', err.message);
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