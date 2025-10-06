import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading';
import { useAuth } from '../context/authContext';
import toast from 'react-hot-toast';
import BlurCircle from '../components/BlurCircle';

const MovieDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [show, setShow] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false); // ✅ local favorite state

    const { shows, axios, token, user, fetchFavoriteMovies, favoriteMovies = [], image_base_url } = useAuth();

    const getShow = async () => {
        try {
            const { data } = await axios.get(`/api/show/${id}`);
            if (data.success) setShow(data);
        } catch (error) {
            console.log(error);
        }
    };

    // ✅ sync local favorite state with global favoriteMovies only on initial mount (avoids override after toggle)
    useEffect(() => {
        if (favoriteMovies && id) {
            setIsFavorite(favoriteMovies.some(movie => movie._id === id));
        }
    }, [id]); // Changed deps: only [id] to prevent re-sync after fetchFavoriteMovies()

    const handleFavorite = async () => {
        try {
            if (!user) return toast.error('Please login to proceed');
            if (!id) return toast.error('Invalid movie ID');

            // toggle local state instantly for UI feedback
            setIsFavorite(prev => !prev);

            const { data } = await axios.post(
                '/api/user/update-favorite',
                { movieId: id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(data.message);
                fetchFavoriteMovies(); // re-sync global favorites (background, won't override local)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Something went wrong');
            setIsFavorite(prev => !prev); // revert on error
        }
    };

    useEffect(() => {
        console.log('Navbar re-render, favorites length:', favoriteMovies?.length);
    }, [favoriteMovies]);

    useEffect(() => {
        getShow();
    }, [id]);

    return show ? (
        <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
            <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
                <img
                    src={image_base_url + show.movie.poster_path}
                    alt=""
                    className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover"
                />

                <div className="relative flex flex-col gap-3">
                    <BlurCircle top="-100px" left="-100px" />
                    <p className="text-primary">English</p>
                    <h1 className="text-4xl font-semibold max-w-96 text-balance">{show.movie.title}</h1>

                    <div className="flex items-center gap-2 text-gray-300">
                        <StarIcon className="w-5 h-5 text-primary fill-primary" />
                        {show.movie.vote_average.toFixed(1)} User Rating
                    </div>

                    <p className="text-gray-400 mt-2 text-sm leading-right max-w-xl">{show.movie.overview}</p>

                    <p>
                        {timeFormat(show.movie.runtime)} ●{' '}
                        {show.movie.genres.map(genre => genre.name).join(', ')} ●{' '}
                        {show.movie.release_date.split('-')[0]}
                    </p>

                    <div className="flex items-center flex-wrap gap-4 mt-4">
                        <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
                            <PlayCircleIcon className="w-5 h-5" />
                            Watch Trailer
                        </button>
                        <a
                            href="#dateSelect"
                            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95"
                        >
                            Buy Tickets
                        </a>
                        <button
                            onClick={handleFavorite}
                            className="bg-gray-700 p-2.5 rounded-full transition cursor-pointer active:scale-95"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="20"
                                height="20"
                                fill={isFavorite ? '#F43F5E' : 'none'}
                                stroke={isFavorite ? '#F43F5E' : '#9CA3AF'}
                                strokeWidth="2"
                                className="transition-all"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                                    2 5.42 4.42 3 7.5 3
                                    c1.74 0 3.41.81 4.5 2.09
                                    C13.09 3.81 14.76 3 16.5 3
                                    19.58 3 22 5.42 22 8.5
                                    c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-lg font-medium my-20">Your Favorite Cast</p>
            <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
                <div className="flex items-center gap-4 w-max px-4">
                    {show.movie.casts.slice(0, 12).map((cast, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <img
                                src={image_base_url + cast.profile_path}
                                alt=""
                                className="rounded-full h-20 md:h-20 aspect-square object-cover"
                            />
                            <p className="font-medium text-xs mt-3">{cast.name}</p>
                        </div>
                    ))}
                </div>
            </div>

            <DateSelect dateTime={show.dateTime} id={id} />

            <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
            <div className="flex flex-warp max-sm:justify-center gap-8">
                {shows.slice(0, 4).map((movie, index) => (
                    <MovieCard movie={movie} key={index} />
                ))}
            </div>
            <div className="flex justify-center mt-20">
                <button
                    onClick={() => {
                        navigate('/movies');
                        scrollTo(0, 0);
                    }}
                    className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
                >
                    Show more
                </button>
            </div>
        </div>
    ) : (
        <Loading />
    );
};

export default MovieDetails;