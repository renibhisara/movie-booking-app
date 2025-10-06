const mongoose = require("mongoose");
const Bookings = require("../models/Bookings");
const Movie = require("../models/Movie");
const User = require("../models/User");

const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;

        const bookings = await Bookings.find({ user }).populate({
            path: 'show',
            populate: { path: 'movie' }
        }).sort({ createdAt: -1 });

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

const updateFavorite = async (req, res) => {
    try {
        const { movieId } = req.body;
        if (!movieId) {
            return res.status(400).json({ success: false, message: "movieId is required" });
        }

        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.favorites) user.favorites = [];

        const exists = user.favorites.includes(movieId);

        if (!exists) {
            user.favorites.push(movieId);
        } else {
            user.favorites = user.favorites.filter(fav => fav !== movieId);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Favorite updated successfully",
            favorites: user.favorites
        });

    } catch (error) {
        console.error("🔥 updateFavorite error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


const getFavorites = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.favorites) {
            return res.status(200).json({ success: true, favorites: [] });
        }

        const movies = await Movie.find({ _id: { $in: user.favorites } });

        res.status(200).json({
            success: true,
            favorites: movies
        });
    } catch (error) {
        console.error("🔥 getFavorites error:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


module.exports = { getUserBookings, updateFavorite, getFavorites };