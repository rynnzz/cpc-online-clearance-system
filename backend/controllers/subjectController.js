const subjectModel = require('../models/subjectModel');

const multer = require('multer')
const xlsx = require('xlsx')

const upload = multer({ dest: 'uploads/' })

// Get all subjects with optional filters
exports.getAllSubjectsAndDepartments = async (req, res) => {
  try {
    const { department, year, school_year, semester } = req.query;
    
    // Get both subjects and departments from the model
    const { subjects, departments } = await subjectModel.getAllSubjectsAndDepartments({
      department,
      year,
      school_year,
      semester,
    });
    
    // Send the subjects and departments in the response
    res.json({ subjects, departments });
  } catch (err) {
    console.error('Error fetching subjects and departments:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Add a new subject
exports.addSubject = async (req, res) => {
  try {
    const { name, code, units, department, year, school_year, semester } = req.body;
    console.log(req.body)
    await subjectModel.addSubject({
      name,
      code,
      units,
      department,
      year,
      school_year,
      semester,
    });
    res.status(201).json({ message: 'Subject added successfully' });
  } catch (err) {
    console.error('Error adding subject:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.bulkAddSubjects = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse the Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Map the Excel data to the format required for insertion
    const subjects = jsonData.map(row => ({
      name: row['Subject Name'],
      code: row['Subject Code'],
      units: row['Units'],
      department: row['Department'],
      year: row['Year Level'],
      school_year: row['School Year'],
      semester: row['Semester']
    }));
    // Insert subjects into the database
    await subjectModel.bulkAddSubjects(subjects);

    res.status(201).json({ message: 'Subjects added successfully' });
  } catch (err) {
    console.error('Error adding subjects from Excel:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, units, department, year, school_year, semester } = req.body;
    console.log(req.body);
    await subjectModel.updateSubject(id, {
      name,
      code,
      units,
      department,
      year,
      school_year,
      semester,
    });
    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    console.error('Error updating subject:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await subjectModel.deleteSubject(id);
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateSemester = async (req, res) => {
  const { semester } = req.body;

  // Check if semester is a string
  if (typeof semester !== 'string' || !semester.trim()) {
    return res.status(400).json({ message: 'Invalid semester value. It must be a non-empty string.' });
  }

  try {
    await subjectModel.updateSemester(semester);
    res.status(200).json({ message: 'Semester updated successfully' });
  } catch (error) {
    console.error('Error updating semester:', error);
    res.status(500).json({ message: 'Failed to update semester' });
  }
};



exports.getSemester = async (req, res) => {
  try {
      const semester = await subjectModel.getSemester();
      res.json(semester)
  } catch (error) {
      console.error('Error fetching semester:', error);
      throw new Error('Failed to fetch semester');
  }
}
