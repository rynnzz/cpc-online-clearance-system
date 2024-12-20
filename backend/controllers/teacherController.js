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
            const subjectKey = `${item.course_name}-${item.year}--${item.section}${item.subject_name}`;

            // Check if this subject and section already exists in the map
            if (!subjectMap[subjectKey]) {
                // Initialize entry in the map
                subjectMap[subjectKey] = {
                    course: item.course_name,
                    year: item.year,
                    sectionId: item.section_id,
                    section: item.section,         // Add sectionId here
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
            subjects: subjects
        });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTeacherSubjects = async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).json({ error: "Teacher ID is required" });
    }

    try {
        const [response] = await teacherModel.getTeacherSubjects(id); // Await and destructure response
        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching teacher subjects:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};


// Add a new teacher
exports.addTeacher = async (req, res) => {
    const newTeacher = req.body;

    try {
        const result = await teacherModel.addTeacher(newTeacher);

        // Check the result from the model for specific cases
        if (result.status === 400) {
            return res.json({ 
                status: 400, 
                message: result.message 
            });
        }

        // Successful teacher addition
        return res.status(201).json({ 
            status: 201, 
            message: result.message 
        });

    } catch (err) {
        console.error("Error in addTeacher:", err);
        return res.status(500).json({ 
            status: 500, 
            message: "Internal Server Error",
            error: err.message 
        });
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
        }));

        // Pass the array of students to the bulkAddStudents model method
        await teacherModel.bulkAddTeachers(teachers); // Ensure bulkAddStudents accepts an array

        res.json({ message: 'Teachers added successfully' });
    } catch (error) {
        console.error('Error adding Teachers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addYearSection = async (req, res) => {
    const { course, year, section, subjects, signature, roles, handlesSection, sections } = req.body;
    const teacher_id = req.params.id;

    try {
        if (!signature || typeof signature !== 'string') {
            return res.status(400).json({ error: 'Signature is required and must be a valid string.' });
        }

        // Process Sections
        if (handlesSection) {
            if (!Array.isArray(sections) || sections.length === 0) {
                return res.status(400).json({ error: 'Sections must be provided when handlesSection is true.' });
            }

            for (const sectionData of sections) {
                const { department, year: sectionYear, section: sectionName, subjects: sectionSubjects } = sectionData;

                if (!department || !sectionYear || !sectionName || !Array.isArray(sectionSubjects) || sectionSubjects.length === 0) {
                    return res.status(400).json({ error: `Invalid data for section "${sectionName}".` });
                }

                await teacherModel.addYearSection({
                    teacher_id,
                    course: department,
                    year: sectionYear,
                    section: sectionName,
                    subjects: sectionSubjects,
                    signature,
                    roles,
                });
            }

            res.status(200).json({ message: 'Roles, sections, and subjects successfully added.' });
        } else if (course && year && section && Array.isArray(subjects) && subjects.length > 0) {
            await teacherModel.addYearSection({
                teacher_id,
                course,
                year,
                section,
                subjects,
                signature,
                roles,
            });

            res.status(200).json({ message: 'Roles, section, and subjects successfully added for a single section.' });
        } else {
            await teacherModel.clearTeacherSections({ teacher_id, roles, signature });

            res.status(200).json({ message: 'Roles and signature successfully added. Teacher does not handle sections.' });
        }
    } catch (err) {
        console.error(`Error in addYearSection controller: ${err.message}`);
        res.status(500).json({ error: 'Failed to add roles, sections, and subjects.' });
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