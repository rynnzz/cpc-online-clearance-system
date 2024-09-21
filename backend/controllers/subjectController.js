const subjectModel = require('../models/subjectModel');

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const [subjects] = await subjectModel.getAllSubjects();  // Destructure the result array
    res.json(subjects);  // Return the subjects data
  } catch (err) {
    console.error(err);  // Log the error for debugging purposes
    res.status(500).json({ message: 'Server Error' });  // Return a 500 status code with a message
  }
};
