const Bookings = require("../models/Bookings");
const Shows = require("../models/Shows");
const User = require("../models/User");

const isAdmin = async (req, res) => {
    res.status(200).json({
        success: true,
        isAdmin: req.user.role === 'admin'
    });
}

const getDashboardData = async (req, res) => {
    try {
        const bookings = await Bookings.find({ isPaid: true });
        const activeShows = await Shows.find({ showDateTime: { $gte: new Date() } }).populate('movie');

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.status(200).json({
            success: true,
            dashboardData
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

const getAllShows = async (req, res) => {
    try {
        const shows = await Shows.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        res.status(200).json({
            success: true,
            shows
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

const getAllBookings = async (req, res) => {
    try {
        const bookings = await Bookings.find({})
            .populate('user')
            .populate({ path: 'show', populate: { path: 'movie' } })
            .sort({ createdAt: -1 })
            .populate('show', { dateTime: 1 });  // Specific fields if needed

        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

module.exports = { isAdmin, getDashboardData, getAllShows, getAllBookings };