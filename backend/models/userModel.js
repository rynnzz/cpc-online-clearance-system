const db = require('../config/database');

exports.findByEmail = (email) => {
    return db.execute('SELECT * FROM users WHERE email = ?', [email]);
};

exports.findById = (id) => {
    return db.execute('SELECT * FROM users WHERE id = ?', [id]);
  };