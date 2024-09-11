const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await User.findByEmail(email);

        if (user.length === 0) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', user[0]);

        const isMatch = await bcrypt.compare(password, user[0].password);

        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create JWT token with user ID and role
        const token = jwt.sign(
            { id: user[0].id, role: user[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login response:', { token, role: user[0].role });
        return res.json({ token, role: user[0].role });
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
        // Add other user details if needed
      });
    } catch (error) {
      console.error('Error fetching user info:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };