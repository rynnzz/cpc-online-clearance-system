// controllers/studentController.js
const multer = require('multer')
const xlsx = require('xlsx')
const studentModel = require('../models/studentModel');

const upload = multer({ dest: 'uploads/' })

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await studentModel.getAllStudents();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkAddStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Map rows to student objects
        const students = jsonData.map(row => ({
            id_num: row['ID Number'],
            first_name: row['First Name'],
            middle_name: row['Middle Name'],
            last_name: row['Last Name'],
            email: row['Email'],
            password: row['Password'],
            course: row['Course'],
            year: row['Year Level'],
            section: row['Section'],
            student_type: row['Student Type']
        }));

        // Pass the array of students to the bulkAddStudents model method
        await studentModel.bulkAddStudents(students); // Ensure bulkAddStudents accepts an array

        res.json({ message: 'Students added successfully' });
    } catch (error) {
        console.error('Error adding students:', error);
        res.status(500).json({ message: 'Server error' });
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

exports.addSubject = async (req, res) => {
    const id = req.params.id
    const  payload  = req.body;
    console.log(payload)

    try {
        await studentModel.addSubject(id, payload);
        res.json({ message: 'Subjects added successfully'})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

exports.getStudentInfo = async (req, res) => {
    try {
        const id = req.params.id;
        const [user] = await studentModel.getStudentInfo(id);

        if (user.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Organize data by sections and subjects
        const sections = [];
        const sectionMap = {};

        user.forEach(item => {
            const sectionKey = `${item.course}-${item.year}-${item.section}`;

            // Check if this section already exists in the map
            if (!sectionMap[sectionKey]) {
                // Initialize entry in the map
                sectionMap[sectionKey] = {
                    course: item.course,
                    year: item.year,
                    section: item.section,
                    subjects: []
                };
                sections.push(sectionMap[sectionKey]);
            }

            // Add subject details with clearance status, signature, and teacher's name
            sectionMap[sectionKey].subjects.push({
                subjectName: item.subject_name,
                subjectCode: item.subject_code,
                units: item.subject_units,
                semester: item.semester,
                schoolYear: item.school_year,
                status: item.clearance_status || 'Pending', // Default to 'Pending' if no status
                signature: item.clearance_status === 'Approved' ? item.teacher_signature : null, // Include signature if status is 'Approved'
                teacherName: item.teacher_first_name && item.teacher_last_name
                    ? `${item.teacher_first_name} ${item.teacher_last_name}`
                    : null // Include teacher's name if available
            });
        });

        // Send student details including organized sections with subjects
        res.json({
            studentId: user[0].student_id,
            firstName: user[0].first_name,
            middleName: user[0].middle_name,
            lastName: user[0].last_name,
            email: user[0].email,
            role: user[0].role,
            studentType: user[0].student_type,
            sections: sections
        });
    } catch (error) {
        console.error('Error fetching student info:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getAdministrativeClearanceStatus = async (req, res) => {
    try {
        const studentId = req.params.id; // Extract studentId from request parameters

        if (!studentId) {
            return res.status(400).json({ message: 'Student ID is required.' });
        }

        // Fetch administrative clearance status from the model
        const [clearanceData] = await studentModel.getAdministrativeClearanceStatus(studentId);

        if (clearanceData.length === 0) {
            return res.status(404).json({ message: 'No administrative clearance records found for this student.' });
        }

        // Send the data in response
        res.status(200).json({ clearanceData });
    } catch (error) {
        console.error('Error fetching administrative clearance status:', error);
        res.status(500).json({ message: 'Server error while fetching administrative clearance status.' });
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

exports.getClearedStudents = async (req, res) => {
    try {
        const [rows] = await studentModel.getClearedStudents();
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching cleared students:', error);
        res.status(500).json({ error: 'Failed to fetch cleared students.' });
    }
};