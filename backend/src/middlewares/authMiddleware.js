const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes and verify JWT Access Token
 */
const protect = async (req, res, next) => {
    let token;

  // Check for Token in Authorization Header (Bearer Token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
    }

    try {
        // Verify Access Token using access secret (fallback to JWT_SECRET)
        const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET
        );

        // Attach user payload to request object (excluding password)
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        res.status(401);
        next(new Error('Not authorized, token failed or expired'));
    }
};

module.exports = { protect };