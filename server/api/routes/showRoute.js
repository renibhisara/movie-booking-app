    const express = require('express');
    const { addShow, getNowPlayingMovies, getShows, getShow } = require('../controller/showController');
    const { verifyAdmin } = require('../Middleware/authMiddleware');
    const router = express.Router();

    router.get('/now-playing', verifyAdmin, getNowPlayingMovies);
    router.post('/add', verifyAdmin, addShow);
    router.get('/all', getShows);
    router.get('/:movieId', getShow);

    module.exports = router; 