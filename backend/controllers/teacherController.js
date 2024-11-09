// controllers/teacherController.js
const multer = require('multer')
const xlsx = require('xlsx')
const teacherModel = require('../models/teacherModel');

const upload = multer({ dest: 'uploads/' })

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
        const id = req.params.id;
        const [user] = await teacherModel.getTeacherInfo(id);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Organize data by sections and subjects
        const subjects = [];
        const subjectMap = {};

        user.forEach(item => {
            const subjectKey = `${item.course}-${item.year_and_section}-${item.subject_name}`;

            // Check if this subject and section already exists in the map
            if (!subjectMap[subjectKey]) {
                // Initialize entry in the map
                subjectMap[subjectKey] = {
                    course: item.course,
                    yearAndSection: item.year_and_section,
                    sectionId: item.section_id,         // Add sectionId here
                    subjectId: item.subject_id,         // Add subjectId here
                    subjectName: item.subject_name,
                    students: []
                };
                subjects.push(subjectMap[subjectKey]);
            }

            // If there is a student associated with this section and subject, add the student details
            if (item.student_id) {
                subjectMap[subjectKey].students.push({
                    studentId: item.student_id,
                    firstName: item.student_first_name,
                    lastName: item.student_last_name,
                    status: item.clearance_status
                });
            }
        });

        // Send user details including organized subjects with students
        res.json({
            teacherId: user[0].teacher_id,
            firstName: user[0].first_name,
            middleName: user[0].middle_name,
            lastName: user[0].last_name,
            email: user[0].email,
            role: user[0].role,
            teacherType: user[0].teacher_type,
            subjects: subjects
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

exports.bulkAddTeachers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Map rows to student objects
        const teachers = jsonData.map(row => ({
            first_name: row['First Name'],
            middle_name: row['Middle Name'],
            last_name: row['Last Name'],
            email: row['Email'],
            password: row['Password'],
            teacher_type: row['Teacher Type']
        }));

        // Pass the array of students to the bulkAddStudents model method
        await teacherModel.bulkAddTeachers(teachers); // Ensure bulkAddStudents accepts an array

        res.json({ message: 'Teachers added successfully' });
    } catch (error) {
        console.error('Error adding Teachers:', error);
        res.status(500).json({ message: 'Server error' });
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