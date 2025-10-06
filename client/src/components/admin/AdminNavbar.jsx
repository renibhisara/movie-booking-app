import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useAuth } from '../../context/authContext';

const AdminNavbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className='flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/30'>
            <Link to='/'>
                <img src={assets.logo} alt="logo" className='w-36 h-auto' />
            </Link>

            <button
                onClick={handleLogout}
                className='px-4 py-1 bg-primary hover:bg-primary-dull text-white rounded-md transition'
            >
                Logout
            </button>
        </div>
    );
};

export default AdminNavbar;
