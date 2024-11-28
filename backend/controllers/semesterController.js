const semesterModel = require('../models/semesterModel');

exports.updateSemester = async (req, res) => {
    const { semester } = req.body;
  
    // Check if semester is a string
    if (typeof semester !== 'string' || !semester.trim()) {
      return res.status(400).json({ message: 'Invalid semester value. It must be a non-empty string.' });
    }
  
    try {
      await semesterModel.updateSemester(semester);
      res.status(200).json({ message: 'Semester updated successfully' });
    } catch (error) {
      console.error('Error updating semester:', error);
      res.status(500).json({ message: 'Failed to update semester' });
    }
  };
  
  
  
  exports.getSemester = async (req, res) => {
    try {
        const semester = await semesterModel.getSemester();
        res.json(semester)
    } catch (error) {
        console.error('Error fetching semester:', error);
        throw new Error('Failed to fetch semester');
    }
  }
  