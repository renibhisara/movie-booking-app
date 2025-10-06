const Bookings = require('../models/Bookings');
const Show = require('../models/Shows');
const Stripe = require('stripe');

// Only instantiate Stripe if key is provided
let stripeInstance;
if (process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn('STRIPE_SECRET_KEY not set - payment integration disabled');
}

const checkSeatsAvailability = async (showId, selectedSeats) => {
    if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        return false; // Invalid input, treat as unavailable
    }

    try {
        const showData = await Show.findById(showId);
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats || {};

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.error('checkSeatsAvailability error:', error.message);
        return false;
    }
};

const createBooking = async (req, res) => {
    try {
        console.log('createBooking hit with body:', req.body);
        console.log('User ID from token:', req.user._id);

        const userId = req.user._id;
        const { showId, selectedSeats } = req.body;

        if (!Array.isArray(selectedSeats) || selectedSeats.length === 0 || selectedSeats.length > 5) {
            return res.status(400).json({ success: false, error: 'Invalid seats selected (max 5)' });
        }

        const showData = await Show.findById(showId).populate('movie');
        if (!showData) {
            return res.status(404).json({ success: false, error: 'Show not found' });
        }

        if (showData.showDateTime <= new Date()) {
            return res.status(400).json({ success: false, error: 'Cannot book past or current shows' });
        }

        if (!showData.showPrice || showData.showPrice <= 0) {
            return res.status(500).json({ success: false, error: 'Invalid show price' });
        }

        if (!showData.occupiedSeats) {
            showData.occupiedSeats = {};
        }

        const isAnySeatTaken = selectedSeats.some(seat => showData.occupiedSeats[seat]);
        if (isAnySeatTaken) {
            const takenSeats = selectedSeats.filter(seat => showData.occupiedSeats[seat]);
            return res.status(400).json({ 
                success: false, 
                error: `Seats ${takenSeats.join(', ')} are already taken` 
            });
        }

        const totalAmount = showData.showPrice * selectedSeats.length;

        const booking = await Bookings.create({
            user: userId,
            show: showId,
            amount: totalAmount,
            bookedSeats: selectedSeats,
            isPaid: false
        });

        console.log('Booking created:', booking._id);

        selectedSeats.forEach(seat => {
            showData.occupiedSeats[seat] = userId;
        });
        showData.markModified('occupiedSeats');
        await showData.save();

        console.log('Show updated with occupied seats');

        let paymentUrl;
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';  // Fallback

        if (stripeInstance) {
            const movieTitle = showData.movie?.title || 'Movie Ticket';
            const session = await stripeInstance.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'inr',
                        product_data: { 
                            name: `${movieTitle} - ${selectedSeats.length} seats`,
                            metadata: { bookingId: booking._id.toString() }
                        },
                        unit_amount: Math.floor(totalAmount * 100)
                    },
                    quantity: 1
                }],
                mode: 'payment',
                metadata: { bookingId: booking._id.toString() },
                success_url: `${baseUrl}/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/movies/${showId}?cancelled=true`,  // Back to show without date junk
            });

            paymentUrl = session.url;
            booking.paymentLink = paymentUrl;
            await booking.save();

            console.log('Stripe session created:', session.id);
        } else {
            // No payment: Relative path for SPA navigate
            paymentUrl = `/my-bookings?bookingId=${booking._id}`;
            console.warn('No Stripe - using relative redirect');
        }

        res.status(201).json({ 
            success: true, 
            url: paymentUrl,
            bookingId: booking._id 
        });

    } catch (error) {
        console.error('Booking creation failed:', {
            message: error.message,
            stack: error.stack,
            body: req.body,
            userId: req.user?._id
        });
        res.status(500).json({ success: false, error: 'Booking failed: ' + error.message });
    }
};

const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);

        if (!showData) {
            return res.status(404).json({ success: false, error: 'Show not found' });
        }

        const occupiedSeats = showData.occupiedSeats ? Object.keys(showData.occupiedSeats) : [];

        res.status(200).json({
            success: true,
            occupiedSeats
        });
    } catch (error) {
        console.error('getOccupiedSeats error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

module.exports = { checkSeatsAvailability, createBooking, getOccupiedSeats };