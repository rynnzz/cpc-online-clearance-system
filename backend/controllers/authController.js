const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
      // Find user by email
      const [user] = await User.findByEmail(email);

      if (user.length === 0) {
          console.log('User not found');
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      console.log('User found:', user[0]);

      // Check if the provided password matches the stored password
      const isMatch = await bcrypt.compare(password, user[0].password);

      if (!isMatch) {
          console.log('Password mismatch');
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      let roles = [];
      if (user[0].role === 'teacher') {
          const [teacherRoles] = await User.findTeacherRoles(user[0].id);

          roles = teacherRoles.map(role => role.role_name); // Extract role names
      }

      // Create JWT token with user ID, role, and first_login status
      const token = jwt.sign(
          { 
            id: user[0].id, 
            role: user[0].role, 
            isFirstLogin: user[0].first_login,
            userRoles: [...new Set([user[0].role, ...roles])],
          },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
      );

      // Prepare the response object
      const response = {
        token,
        user: {
          id: user[0].id,
          email: user[0].email,
          firstName: user[0].first_name,
          lastName: user[0].last_name,
          userRoles: [...new Set([user[0].role, ...roles])], // Merge role and roles, ensuring uniqueness
          firstLogin: user[0].first_login,
        }
      };
      
      console.log(response)
      return res.json(response);
  } catch (error) {
      console.error('Server error:', error);
      return res.status(500).json({ message: 'Server error' });
  }
};



exports.getUserInfo = async (req, res) => {
    try {
      const userId = req.userId; // `userId` should be set by the `verifyToken` middleware
      const [user] = await User.findById(userId);
  
      if (user.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Send user details including role
      res.json({
        role: user[0].role,
        firstLogin:user[0].first_login
        // Add other user details if needed
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };