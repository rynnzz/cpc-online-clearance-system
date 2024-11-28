const db = require('../config/database');

exports.updateSemester = async (semester) => {
    return db.execute(
      `UPDATE current_semester SET semester =?`,
      [semester]
    );
  }
  exports.getSemester = async () => {
    const [currentSemester] = await db.execute(`SELECT semester FROM current_semester`);
    return currentSemester
  }
  