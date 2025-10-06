const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log("Token:", token);
        if (!token) {
            return res.status(401).json({ success: false, error: 'Token not Provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log("Decoded:", decoded);
        if (!decoded) {
            return res.status(401).json({ success: false, error: 'Token not Valid' });
        }

        const user = await User.findById(decoded._id).select('-password');
        console.log("User:", user);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }
};

const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, error: 'Token missing' });

        const decoded = jwt.verify(token, process.env.JWT_KEY);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded._id || decoded.id).select('-password');
        console.log('DB User:', user);

        if (!user) return res.status(401).json({ success: false, error: 'User not found' });

        if (!user.role || user.role.toLowerCase() !== 'admin') {
            console.log('User role invalid:', user.role);
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('verifyAdmin error:', err.message);
        return res.status(401).json({ success: false, error: 'Invalid token or server error' });
    }
};

module.exports = { verifyUser, verifyAdmin };
