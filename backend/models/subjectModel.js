const db = require('../config/database');

// Get all subjects with optional filters
exports.getAllSubjectsAndDepartments = async ({ department, year, school_year, semester }) => {
  // Query to get all departments
  const [departments] = await db.execute('SELECT * FROM departments');

  // Query to get subjects based on filters
  let query = 'SELECT * FROM subjects WHERE 1=1';
  const params = [];

  if (department) {
    query += ' AND department_id = ?';
    params.push(department);
  }
  if (year) {
    query += ' AND year = ?';
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

  const [subjects] = await db.execute(query, params);

  // Return both subjects and departments
  return { subjects, departments };
};


// Add a new subject
exports.addSubject = async ({ name, code, units, department, year, school_year, semester }) => {
  // Get the department ID, inserting the department if it doesn’t exist
  const [existingDepartment] = await db.execute(
    `SELECT id FROM departments WHERE name = ?`,
    [department]
  );

  let departmentId;
  if (existingDepartment.length > 0) {
    departmentId = existingDepartment[0].id;
  } else {
    const [result] = await db.execute(
      `INSERT INTO departments (name) VALUES (?)`,
      [department]
    );
    departmentId = result.insertId;
  }

  // Insert the subject with the obtained department_id
  return db.execute(
    `
      INSERT INTO subjects (name, code, units, department_id, year, school_year, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [name, code, units, departmentId, year, school_year, semester]
  );
};

// Bulk add subjects
exports.bulkAddSubjects = async (subjects) => {
  if (!subjects || subjects.length === 0) return Promise.resolve(); // No subjects to add

  const departmentIds = {};

  // Prepare to insert each subject with the correct department_id
  for (const subject of subjects) {
    // Check if department_id already exists in the cache
    if (!departmentIds[subject.department]) {
      // Check if department exists in the departments table
      const [existingDepartment] = await db.execute(
        `SELECT id FROM departments WHERE name = ?`,
        [subject.department]
      );

      if (existingDepartment.length > 0) {
        departmentIds[subject.department] = existingDepartment[0].id;
      } else {
        // Insert new department and store the id
        const [result] = await db.execute(
          `INSERT INTO departments (name) VALUES (?)`,
          [subject.department]
        );
        departmentIds[subject.department] = result.insertId;
      }
    }

    // Set department_id for the current subject
    subject.department_id = departmentIds[subject.department];
  }

  // Prepare query and values for bulk insert
  const query = `
    INSERT INTO subjects (name, code, units, department_id, year, school_year, semester)
    VALUES ${subjects.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')}
  `;

  // Flatten values into a single array
  const values = subjects.flatMap(subject => [
    subject.name,
    subject.code,
    subject.units,
    subject.department_id,
    subject.year,
    subject.school_year,
    subject.semester,
  ]);

  return db.execute(query, values);
};

// Update an existing subject
exports.updateSubject = async (subjectId, { name, code, units, department, year, school_year, semester }) => {
  // Check if the department exists, or insert it if it doesn’t
  const [existingDepartment] = await db.execute(
    `SELECT id FROM departments WHERE name = ?`,
    [department]
  );

  let departmentId;
  if (existingDepartment.length > 0) {
    departmentId = existingDepartment[0].id;
  } else {
    const [result] = await db.execute(
      `INSERT INTO departments (name) VALUES (?)`,
      [department]
    );
    departmentId = result.insertId;
  }

  // Update the subject with the new data
  return db.execute(
    `
      UPDATE subjects
      SET name = ?, code = ?, units = ?, department_id = ?, year = ?, school_year = ?, semester = ?
      WHERE id = ?
    `,
    [name, code, units, departmentId, year, school_year, semester, subjectId]
  );
};

// Delete a subject by ID
exports.deleteSubject = async (subjectId) => {
  return db.execute(
    `DELETE FROM subjects WHERE id = ?`,
    [subjectId]
  );
};