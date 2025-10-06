import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', {
                name, email, password, role
            });
            console.log("Register Response:", response.data);
            if (response.data.success) {
                navigate('/login'); 
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Server Error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl text-white font-bold mb-4">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input type="text" placeholder="Name" onChange={e => setName(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black text-white" />
                <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black text-white" />
                <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required className="w-full p-2 mb-3 rounded bg-black text-white" />
                <select onChange={e => setRole(e.target.value)} value={role} className="w-full p-2 mb-3 rounded bg-black text-white">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" className="w-full bg-primary py-2 text-white rounded hover:bg-primary-dull">Register</button>
            </form>
        </div>
    );
};

export default Register;
