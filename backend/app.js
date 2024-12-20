const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const clearanceRoutes = require('./routes/clearanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const administrativeClearanceRoutes = require('./routes/administrativeClearanceRoutes');
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/clearance', clearanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/semester', semesterRoutes);
app.use('/api/administrative', administrativeClearanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
