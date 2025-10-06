import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// ✅ ek var set karo baseURL
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAdmin, setIsAdmin] = useState(false);
    const [shows, setShows] = useState([]);
    const [favoriteMovies, setFavoriteMovies] = useState([]);

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Verify user
    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get('/api/auth/verify', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, [token]);

    // ✅ Fetch if user is Admin
    const fetchIsAdmin = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAdmin(data.isAdmin);
        } catch (error) {
            if (error.response?.status === 403) {
                setIsAdmin(false);
            } else {
                console.error(error);
            }
        }
    };

    // ✅ Fetch all shows
    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all');
            if (data.success) {
                setShows(data.shows);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // ✅ Fetch user’s favorite movies
    const fetchFavoriteMovies = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get('/api/user/favorites', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                const newFavorites = data.favorites || []; // ✅ Change: data.favorites (not data.movies)
                setFavoriteMovies([...newFavorites]); // New array for re-render
                console.log('Updated favorites length:', newFavorites.length);
            } else {
                setFavoriteMovies([]);
                toast.error(data.message || 'Failed to load favorites');
            }
        } catch (error) {
            console.error('Fetch favorites error:', error);
            setFavoriteMovies([]);
            toast.error('Something went wrong loading favorites');
        }
    };

    // ✅ Login
    const login = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("token", jwtToken);
    };

    // ✅ Logout
    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAdmin(false);
        setFavoriteMovies([]);
        localStorage.removeItem('token');
    };

    // Auto-fetch shows
    useEffect(() => {
        fetchShows();
    }, []);

    // Auto-fetch admin + favorites
    useEffect(() => {
        if (user?.role === 'admin') {
            fetchIsAdmin();
        }
        fetchFavoriteMovies();
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading,
                isAdmin,
                shows,
                favoriteMovies,
                fetchIsAdmin,
                fetchShows,
                fetchFavoriteMovies,
                axios,
                image_base_url
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
