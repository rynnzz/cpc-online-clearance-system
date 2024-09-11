const express = require('express');
const { getUserInfo, login } = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);

router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to the dashboard!', user: req.user });
  });
router.get('/user-info', authMiddleware, getUserInfo);

module.exports = router;
