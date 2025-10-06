const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const showSchema = new Schema(
    {
        movie: {type: String, required: true, ref: 'Movie'},
        showDateTime: {type: Date, required: true},
        showPrice: {type: Number, required: true},
        occupiedSeats: {type: Object,default:{}},
    }, {minimize: false}
)

module.exports = mongoose.model('Show', showSchema);