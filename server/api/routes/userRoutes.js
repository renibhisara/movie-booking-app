const express = require('express');
const { getUserBookings, updateFavorite, getFavorites } = require('../controller/userController');
const { verifyUser } = require('../Middleware/authMiddleware');
const router = express.Router();

router.get('/bookings', verifyUser, getUserBookings);
router.post('/update-favorite', verifyUser, updateFavorite);
router.get('/favorites', verifyUser, getFavorites);

module.exports = router