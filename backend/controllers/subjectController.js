const subjectModel = require('../models/subjectModel');

const multer = require('multer')
const xlsx = require('xlsx')

const upload = multer({ dest: 'uploads/' })

// Get all subjects with optional filters
exports.getAllSubjects = async (req, res) => {
  try {
    const { department, year, school_year, semester } = req.query;
    const [subjects] = await subjectModel.getAllSubjects({
      department,
      year,
      school_year,
      semester,
    });
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new subject
exports.addSubject = async (req, res) => {
  try {
    const { name, code, units, department, year, schoolYear, semester } = req.body;
    await subjectModel.addSubject({
      name,
      code,
      units,
      department,
      year,
      schoolYear,
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
    const { name, code, units, department, year, schoolYear, semester } = req.body;
    await subjectModel.updateSubject(id, {
      name,
      code,
      units,
      department,
      year,
      schoolYear,
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
