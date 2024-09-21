const db = require('../config/database');

exports.getAllSubjects = () => {
  return db.execute(`
    SELECT * from subjects
  `);
}