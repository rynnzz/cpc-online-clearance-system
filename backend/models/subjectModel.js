const db = require('../config/database');

// Get all subjects with optional filters
exports.getAllSubjects = ({ department, year, school_year, semester }) => {
  let query = 'SELECT * FROM subjects WHERE 1=1';
  const params = [];

  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }
  if (year) {
    query += ' AND year_level = ?';
    params.push(year);
  }
  if (school_year) {
    query += ' AND school_year = ?';
    params.push(school_year);
  }
  if (semester) {
    query += ' AND semester = ?';
    params.push(semester);
  }

  return db.execute(query, params);
};

// Add a new subject
exports.addSubject = ({ name, code, units, department, year, schoolYear, semester }) => {
  return db.execute(`
    INSERT INTO subjects (name, code, units, department, year, school_year, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [name, code, units, department, year, schoolYear, semester]);
};

// Bulk add subjects
exports.bulkAddSubjects = (subjects) => {
  if (!subjects || subjects.length === 0) return Promise.resolve(); // No subjects to add

  // Prepare query and values for bulk insert
  const query = `
    INSERT INTO subjects (name, code, units, department, year, school_year, semester)
    VALUES ${subjects.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
  `;
  
  // Flatten values into a single array
  const values = subjects.flatMap(subject => [
    subject.name,
    subject.code,
    subject.units,
    subject.department,
    subject.year,
    subject.school_year,
    subject.semester,
  ]);

  return db.execute(query, values);
};

// Update a subject
exports.updateSubject = (id, { name, code, units, department, year, schoolYear, semester }) => {
  return db.execute(`
    UPDATE subjects
    SET name = ?, code = ?, units = ?, department = ?, year = ?, school_year = ?, semester = ?
    WHERE id = ?
  `, [name, code, units, department, year, schoolYear, semester, id]);
};

// Delete a subject
exports.deleteSubject = (id) => {
  return db.execute(`DELETE FROM subjects WHERE id = ?`, [id]);
};
