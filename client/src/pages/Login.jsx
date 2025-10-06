import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { user, loading, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate(user.role === "admin" ? "/admin" : "/home", { replace: true });
        }
    }, [user, loading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:3000/api/auth/login", {
                email,
                password,
            });

            if (response.data.success) {
                login(response.data.user, response.data.token);
            } else {
                setError(response.data.error || "Invalid credentials");
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Server Error");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (user) return null; // redirect handled by useEffect

    return (
        <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dull"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dull"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dull transition"
                    >
                        LOGIN
                    </button>
                </form>

                <div className="mt-3 flex justify-between">
                    <div className="text-left">
                        <a href="/forgot-password" className="text-sm text-gray-400 hover:underline">
                            Forgot Password?
                        </a>
                    </div>
                    <div className="text-right">
                        <a href="/register" className="text-red-400 font-medium">
                            Register
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
