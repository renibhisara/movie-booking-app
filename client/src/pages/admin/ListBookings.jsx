import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import dateFormat from '../../lib/dateFormat';
import { useAuth } from '../../context/authContext';

const ListBookings = () => {

    const { axios, token, user } = useAuth();

    const currency = import.meta.env.VITE_CURRENCY

    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const getAllBookings = async () => {
        try {
            setError(null);
            const { data } = await axios.get('/api/admin/all-bookings', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data.success) {
                setBookings(data.bookings || []);
            } else {
                throw new Error(data.message || 'Failed to load bookings');
            }
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error fetching bookings');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            getAllBookings();
        }
    }, [user]);

    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
                <h1 className='text-2xl font-semibold mb-4 text-red-500'>{error}</h1>
                <p className='text-gray-400 mb-4'>Something went wrong. Please try again.</p>
                <button 
                    onClick={getAllBookings} 
                    className='px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-md font-medium'
                >
                    Retry
                </button>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className='flex flex-col items-center justify-center min-h-screen px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
                <h1 className='text-2xl font-semibold mb-4'>No Bookings Found</h1>
                <p className='text-gray-400 mb-4'>There are no bookings available.</p>
            </div>
        );
    }

    return (
        <>
            <Title text1="List" text2="Bookings" />
            <div className='max-w-4xl mt-6 overflow-x-hidden'>
                <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
                    <thead>
                        <tr className='bg-primary/20 text-left text-white'>
                            <th className='p-2 font-medium pl-5'>User Name</th>
                            <th className='p-2 font-medium'>Movie Name</th>
                            <th className='p-2 font-medium'>Show Time</th>
                            <th className='p-2 font-medium'>Seats</th>
                            <th className='p-2 font-medium'>Amount</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm font-light'>
                        {bookings.map((item, index) => (
                            <tr key={item._id || index} className='border-b border-primary/20 bg-primary/5 even:bg-primary/10'>
                                <td className='p-2 min-w-45 pl-5'>{item.user?.name || 'Unknown User'}</td>
                                <td className='p-2'>{item.show?.movie?.title || 'Unknown Movie'}</td>
                                {/* ✅ Fixed: Assume dateTime is a string or use a fallback; adjust based on your data structure */}
                                <td className='p-2'>{item.show?.dateTime ? dateFormat(item.show.dateTime) : 'N/A'}</td>
                                {/* ✅ Fixed: bookedSeats is an array, not object – join directly */}
                                <td className='p-2'>{Array.isArray(item.bookedSeats) ? item.bookedSeats.join(', ') : 'N/A'}</td>
                                <td className='p-2'>{currency} {item.amount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default ListBookings