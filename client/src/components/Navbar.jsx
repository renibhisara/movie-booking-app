import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, XIcon } from 'lucide-react'
import { useAuth } from '../context/authContext'

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout, favoriteMovies = [] } = useAuth(); 

    return (
        <div className='fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5'>
            <Link to="/" className='max-md:flex-1'>
                <img src={assets.logo} alt="" className='w-36 h-auto' />
            </Link>

            <div className={`max-md:absolute max-md:top-0 max-md:left-0 
                max-md:font-medium max-md:text-lg z-50 flex flex-col 
                md:flex-row items-center max-md:justify-center gap-8 
                min-md:px-8 py-3 max-md:h-screen min-md:rounded-full 
                backdrop-blur bg-black/70 md:bg-white/10 md:border 
                border-gray-300/20 overflow-hidden transition-[width] 
                duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
                <XIcon className='md:hidden absolute top-6 right-6 w-6 h-6 
                    cursor-pointer' onClick={() => setIsOpen(false)} />

                <Link to='/' onClick={() => { scrollTo(0, 0); setIsOpen(false); }}>Home</Link>
                <Link to='/movies' onClick={() => { scrollTo(0, 0); setIsOpen(false); }}>Movies</Link>
                <Link to='/' onClick={() => { scrollTo(0, 0); setIsOpen(false); }}>Theaters</Link>
                <Link to='/' onClick={() => { scrollTo(0, 0); setIsOpen(false); }}>Releases</Link>
                {favoriteMovies?.length > 0 && (
                    <Link to='/favorite' onClick={() => { scrollTo(0, 0); setIsOpen(false); }}>
                        Favorites
                    </Link>
                )}
            </div>

            <div className='flex items-center gap-8'>
                <SearchIcon className='max-md:hidden w-6 h-6 cursor-pointer' />

                {!user ? (
                    <button onClick={() => navigate('/login')}
                        className='px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull text-white rounded-full font-medium cursor-pointer'>
                        Login
                    </button>
                ) : (
                    <div className="relative group">
                        <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer'>
                            {user.name[0].toUpperCase()}
                        </div>

                        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <Link
                                to="/my-bookings"
                                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                My Bookings
                            </Link>
                            <button
                                onClick={logout}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <MenuIcon className='max-md:ml-4 md:hidden w-8 h-8 cursor-pointer'
                onClick={() => setIsOpen(!isOpen)}
            />
        </div>
    )
}

export default Navbar