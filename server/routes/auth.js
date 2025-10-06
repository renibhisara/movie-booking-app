const express = require('express');
const { register, login, verify } = require('../controller/authController');
const { verifyUser } = require('../Middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verifyUser, verify);

module.exports = router