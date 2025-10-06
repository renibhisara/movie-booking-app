import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRightIcon, ClockIcon } from 'lucide-react';
import Loading from '../components/Loading';
import BlurCircle from '../components/BlurCircle';
import { assets } from '../assets/assets';
import isoTimeFormat from '../lib/isoTimeFormat';
import { useAuth } from '../context/authContext';
import toast from 'react-hot-toast';

const SeatLayout = () => {
    const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]];

    const { id, date: paramDate } = useParams();
    const [show, setShow] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [date, setDate] = useState(paramDate);
    const [error, setError] = useState(null);

    const { axios, token, user } = useAuth();
    const navigate = useNavigate();

    const getShow = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data } = await axios.get(`/api/show/${id}`);
            console.log('API Response:', data);

            if (!data.success || !data.movie) {
                throw new Error(data.error || 'No movie data found');
            }

            if (!Object.keys(data.dateTime || {}).length) {
                throw new Error('No show timings available for this movie yet.');
            }

            const fetchedShow = {
                ...data.movie,
                dateTime: data.dateTime || {},
                showPrice: data.showPrice || 150
            };

            setShow(fetchedShow);

            const availableDates = Object.keys(fetchedShow.dateTime);
            if (!fetchedShow.dateTime[date] && availableDates.length > 0) {
                const nearestDate = availableDates[0];
                setDate(nearestDate);
                toast('Selected date has no showtimes. Showing nearest available date.');
            }

        } catch (err) {
            console.error('Get show error:', err);
            const msg = err.response?.data?.error || err.message || 'Server error loading show';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // Fix URL if date undefined (runs after getShow sets show)
    useEffect(() => {
        if (show && paramDate === 'undefined' && date && date !== paramDate) {
            navigate(`/movies/${id}/${date}`, { replace: true });
        }
    }, [show, date, paramDate, id, navigate]);

    const getOccupiedSeats = async () => {
        if (!selectedTime?.showId) return;
        try {
            const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`);
            if (data.success) {
                setOccupiedSeats(data.occupiedSeats || []);
            } else {
                toast.error(data.message || 'Failed to load occupied seats');
            }
        } catch (error) {
            console.error('Get occupied seats error:', error);
            toast.error(error.response?.data?.message || 'Failed to load seats');
            setOccupiedSeats([]);
        }
    };

    const handleSeatClick = (seatId) => {
        if (!selectedTime) {
            return toast.error('Please select a time first');
        }
        if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
            return toast.error('You can only select up to 5 seats');
        }
        if (occupiedSeats.includes(seatId)) {
            return toast.error('This seat is already booked');
        }
        setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId]);
    }

    const renderSeats = (row, count = 9) => (
        <div key={row} className='flex gap-2 mt-2'>
            <div className='flex flex-wrap items-center justify-center gap-2'>
                {Array.from({ length: count }, (_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                        <button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            disabled={occupiedSeats.includes(seatId)}
                            className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50
                                ${selectedSeats.includes(seatId) ? 'bg-primary text-white border-primary' : 'hover:bg-primary/20'}
                                ${occupiedSeats.includes(seatId) ? 'bg-gray-500 text-white border-gray-500' : ''}`}
                        >
                            {seatId}
                        </button>
                    )
                })}
            </div>
        </div>
    )

    const bookTickets = async () => {
        try {
            console.log('bookTickets called with:', { showId: selectedTime?.showId, seats: selectedSeats.length, token: !!token });
            if (!user) {
                return toast.error('Please login to book tickets');
            }

            if (!selectedTime?.showId || !selectedSeats.length) {
                return toast.error('Please select a time and at least one seat');
            }

            const { data } = await axios.post('/api/booking/create', {
                showId: selectedTime.showId,
                selectedSeats
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                const redirectUrl = data.url;
                if (redirectUrl.startsWith('/')) {
                    // Relative SPA path (e.g., no-payment case) - use navigate
                    navigate(redirectUrl);
                } else {
                    // Full external URL (e.g., Stripe) - use window.location
                    window.location.href = redirectUrl;
                }
            } else {
                toast.error(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error(error.response?.data?.message || error.message || 'Booking failed');
        }
    }

    useEffect(() => {
        getShow();
    }, [id]);

    useEffect(() => {
        if (selectedTime?.showId) {
            getOccupiedSeats();
        }
    }, [selectedTime]);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
                <BlurCircle top='-100px' left='-100px' />
                <h1 className='text-2xl font-semibold mb-4 text-red-500'>{error || 'Show not found'}</h1>
                <p className='text-gray-400 mb-4'>Something went wrong. Please try again.</p>
                <button
                    onClick={() => navigate('/movies')}
                    className='px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-md font-medium'
                >
                    Back to Movies
                </button>
            </div>
        );
    }

    if (!show) {
        return <Loading />;
    }

    if (!show.dateTime[date] || show.dateTime[date].length === 0) {
        const availableDates = Object.keys(show?.dateTime || []);
        return (
            <div className='flex flex-col items-center justify-center min-h-screen px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
                <BlurCircle top='-100px' left='-100px' />
                <h1 className='text-2xl font-semibold mb-4'>No Timings Available</h1>
                <p className='text-gray-400 mb-4'>No show timings for {date}. Please select another date.</p>
                <div className='flex gap-2 flex-wrap justify-center'>
                    {availableDates.length > 0 ? (
                        availableDates.map((availableDate) => (
                            <button
                                key={availableDate}
                                onClick={() => {
                                    setDate(availableDate);
                                    navigate(`/movies/${id}/${availableDate}`, { replace: true });
                                }}
                                className='px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-md font-medium'
                            >
                                {new Date(availableDate).toLocaleDateString('en-IN', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </button>
                        ))
                    ) : (
                        <p className='text-gray-400'>No available dates</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
            {/* Available Timings */}
            <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
                <p className='text-lg font-semibold px-6'>Available Timings</p>
                <div className='mt-5 space-y-1'>
                    {show.dateTime[date].map((item) => (
                        <div
                            key={item.time}
                            onClick={() => {
                                console.log('Time clicked!', { item, showId: item.showId });
                                setSelectedTime({ ...item, showId: item.showId });
                            }}
                            className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}
                        >
                            <ClockIcon className='w-4 h-4' />
                            <p className='text-sm'>{isoTimeFormat(item.time)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Seat Layout */}
            <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
                <BlurCircle top='-100px' left='-100px' />
                <BlurCircle bottom='0' right='0' />
                <h1 className='text-2xl font-semibold mb-4'>Select your seat</h1>
                <img src={assets.screenImage} alt='screen' className='mb-2' />
                <p className='text-gray-400 text-sm mb-6'>SCREEN SIDE</p>

                <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
                    <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
                        {groupRows[0].map((row) => renderSeats(row))}
                    </div>

                    <div className='grid grid-cols-2 gap-11'>
                        {groupRows.slice(1).map((group, idx) => (
                            <div key={idx}>
                                {group.map((row) => renderSeats(row))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='mt-4 text-sm text-gray-400'>
                    <p>Selected Seats: {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
                    <p>Total: ₹{selectedSeats.length * (show?.showPrice || 150)}</p>
                </div>

                <button
                    onClick={() => {
                        if (!user) return toast.error('Please login to book tickets');
                        if (!selectedTime?.showId || selectedSeats.length === 0) return toast.error('Select time and seats');
                        bookTickets();
                    }}
                    className="flex items-center gap-1 mt-6 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
                >
                    Proceed to Checkout ({selectedSeats.length} seats)
                    <ArrowRightIcon strokeWidth={3} className='w-4 h-4' />
                </button>

            </div>
        </div>
    )
}

export default SeatLayout