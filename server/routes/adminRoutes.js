const express = require('express');
const { verifyAdmin } = require('../Middleware/authMiddleware');
const { isAdmin, getDashboardData, getAllShows, getAllBookings } = require('../controller/adminController');
const router = express.Router();

router.get('/is-admin', verifyAdmin, isAdmin);
router.get('/dashboard', verifyAdmin, getDashboardData);
router.get('/all-shows', verifyAdmin, getAllShows);
router.get('/all-bookings', verifyAdmin, getAllBookings);

module.exports = router