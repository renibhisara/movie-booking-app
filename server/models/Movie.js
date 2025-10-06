const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema(
    {
        _id: {type: String, required: true},
        title: {type: String, required: true},
        overview: {type: String, required: true},
        poster_path: {type: String, required: true},
        backdrop_path: {type: String, required: true},
        release_date: {type: String, required: true},
        original_language: {type: String},
        tagline: {type: String},
        genres: {type: Array, required: true},
        casts: {type: Array, required: true},
        vote_average: {type: Number, required: true},
        runtime: {type: Number, required: true},
    }, {timestamps: true}
)

module.exports = mongoose.model('Movie', movieSchema);