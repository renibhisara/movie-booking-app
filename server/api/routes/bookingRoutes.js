const express = require('express');
const { createBooking, getOccupiedSeats } = require('../controller/bookingController');
const { verifyUser } = require('../Middleware/authMiddleware');
const router = express.Router();

router.post('/create', verifyUser, createBooking);
router.get('/seats/:showId', getOccupiedSeats);

module.exports = router;