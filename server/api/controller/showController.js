const axios = require('axios');
const https = require('https');  // ✅ Add for IPv4 agent
const Movie = require('../models/Movie');
const Show = require('../models/Shows');

const getNowPlayingMovies = async (req, res) => {
    try {
        if (!process.env.TMDB_API_KEY) {
            console.error("TMDB_API_KEY is not set in .env");
            return res.status(500).json({
                success: false,
                error: "TMDB API key not configured",
            });
        }

        console.log("Fetching now playing movies from TMDB...");

        const token = process.env.TMDB_API_KEY.trim();
        if (!token || !token.startsWith('eyJ')) {
            
            console.error("TMDB_API_KEY seems invalid (not a JWT token)");
            return res.status(500).json({
                success: false,
                error: "Invalid TMDB v4 access token format",
            });
        }

        const url = 'https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1';
        console.log('TMDB Request URL:', url);

        // ✅ Force IPv4 to avoid IPv6 timeout issues
        const agent = new https.Agent({
            family: 4,  // IPv4 only
            keepAlive: true,
        });

        const response = await axios.get(url, {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            httpsAgent: agent,  // ✅ Use IPv4 agent
            timeout: 30000,
        });

        console.log('TMDB Response Status:', response.status);
        console.log('TMDB Movies Count:', response.data.results?.length || 0);

        res.status(200).json({
            success: true,
            movies: response.data.results,
        });
    } catch (error) {
        console.error("Full Axios Error Object:", error);
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Response Status:", error.response?.status);
        console.error("Response Data:", error.response?.data);
        console.error("Request Config URL:", error.config?.url);

        let errorMsg = "Failed to fetch movies from TMDB.";
        if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            errorMsg += " Network connection timeout. Fixes: 1) Disable IPv6 (netsh interface ipv6 uninstall on Windows). 2) Set DNS to 8.8.8.8 (Google). 3) Check firewall/antivirus blocking port 443. 4) Disable VPN/proxy. 5) Restart router/modem.";
        } else if (error.response?.status === 401) {
            errorMsg += " Invalid/expired TMDB v4 access token. Regenerate at https://www.themoviedb.org/settings/api (use v4 token, valid 24h).";
        } else if (error.response?.status === 7) {
            errorMsg += " Invalid TMDB API key/token.";
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMsg += " DNS/Network error. Ping api.themoviedb.org in cmd: 'ping api.themoviedb.org' – should resolve to 34.120.225.159 or similar.";
        }

        res.status(500).json({
            success: false,
            error: errorMsg,
        });
    }
};

const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body;

        if (!movieId || !showsInput?.length || !showPrice) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        let movie = await Movie.findById(movieId);

        if (!movie) {
            if (!process.env.TMDB_API_KEY) {
                return res.status(500).json({ success: false, error: "TMDB API key not configured" });
            }

            const token = process.env.TMDB_API_KEY.trim();
            if (!token || !token.startsWith('eyJ')) {
                return res.status(500).json({ success: false, error: "Invalid TMDB v4 access token format" });
            }

            // ✅ Force IPv4 agent
            const agent = new https.Agent({ family: 4, keepAlive: true });

            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}?language=en-US`, {
                    headers: { 
                        accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    httpsAgent: agent,  // ✅ IPv4
                    timeout: 30000,
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?language=en-US`, {
                    headers: { 
                        accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    httpsAgent: agent,  // ✅ IPv4
                    timeout: 30000,
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            };

            movie = await Movie.create(movieDetails);
        }

        const showsToCreate = showsInput.map(show => {
            const dateTimeString = `${show.date}T${show.time}`;
            return {
                movie: movie._id,
                showDateTime: new Date(dateTimeString),
                showPrice: Number(showPrice),
                occupiedSeats: {},
            };
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.status(200).json({
            success: true,
            message: "Shows added successfully",
        });

    } catch (error) {
        console.error("AddShow Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

const getShows = async (req, res) => {
    try {
        const shows = await Show.find().populate('movie').sort({ showDateTime: 1 });

        const uniqueShows = new Set(shows.map(show => show.movie));

        res.status(200).json({
            success: true,
            shows: Array.from(uniqueShows),
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;

        const shows = await Show.find({
            movie: movieId,
            showDateTime: { $gte: new Date() }
        })

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split('T')[0];
            if (!dateTime[date]) {
                dateTime[date] = [];
            }
            dateTime[date].push({
                time: show.showDateTime,
                showId: show._id
            });
        })

        res.status(200).json({
            success: true,
            movie,
            dateTime
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
}

module.exports = { getNowPlayingMovies, addShow, getShows, getShow };