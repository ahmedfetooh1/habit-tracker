const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, generateToken } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiterMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Apply stricter rate limits to authentication routes to prevent brute-force attacks
router.use(authLimiter);

// User Registration Route
router.post('/register', validateRegister, registerUser);

// User Login Route
router.post('/login', validateLogin, loginUser);

// Google OAuth Authentication Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user._id);
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
        res.redirect(`${clientUrl}/auth-success?token=${token}`);
    }
);

module.exports = router;