const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);

router.get('/dashboard', authMiddleware, (req, res) => {
    res.json({ message: 'Welcome to the dashboard!', user: req.user });
  });
router.get('/user-info', authMiddleware, authController.getUserInfo);

router.put('/:userId/change-password', authController.updatePassword)

module.exports = router;
