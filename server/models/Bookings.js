const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: Schema.Types.ObjectId, ref: 'Show', required: true },
    amount: { type: Number, required: true },
    bookedSeats: [{ type: String, required: true }],  // Explicitly array of strings
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);