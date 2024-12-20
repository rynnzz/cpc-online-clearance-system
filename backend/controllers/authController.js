const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.login = async (req, res) => {
  const { loginInput, password } = req.body;

  try {
    // Find user by email or student ID
    const [user] = await User.login(loginInput);

    if (user.length === 0) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid Student ID/Email or password' });
    }

    console.log('User found:', user[0]);

    // Check if the provided password matches the stored password
    const isMatch = await bcrypt.compare(password, user[0].password);

    if (!isMatch) {
      console.log('Password mismatch');
      return res.status(400).json({ message: 'Invalid Student ID/Email or password' });
    }

    let roles = [];
    let roleIds = [];
    if (user[0].role === 'teacher') {
      const [teacherRoles] = await User.findTeacherRoles(user[0].id);

      // Extract role names and role IDs
      roles = teacherRoles.map(role => role.role_name);
      roleIds = teacherRoles.map(role => role.role_id);
    }

    // Create JWT token with user details
    const token = jwt.sign(
      {
        id: user[0].id,
        role: user[0].role,
        isFirstLogin: user[0].first_login,
        userRoles: [...new Set([user[0].role, ...roles])], // Ensure uniqueness of roles
        roleIds: [...new Set(roleIds)], // Ensure uniqueness of role IDs
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Prepare the response object
    const response = {
      token,
      user: {
        id: user[0].id,
        studentId: user[0].id_num || null, // Include Student ID if available
        email: user[0].email,
        firstName: user[0].first_name,
        lastName: user[0].last_name,
        userRoles: [...new Set([user[0].role, ...roles])], // Merge role and roles, ensuring uniqueness
        roleIds: [...new Set(roleIds)], // Include all unique role IDs
        firstLogin: user[0].first_login,
      },
    };

    console.log(response);
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

  exports.updatePassword = async (req, res) => {
    const { password } = req.body; // Extract password from the request body
    const userId = req.params.userId; // Get the userId from the request params

    try {
        // Log inputs for debugging
        console.log('User ID:', userId);
        console.log('Password to hash:', password);

        // Ensure password exists in the request body
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the password in the database
        await User.updatePassword(userId, hashedPassword);

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
