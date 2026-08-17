const express = require('express');
const passport = require('passport');
const {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    generateAccessToken,
    generateRefreshToken,
} = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiterMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

const router = express.Router();

// Apply rate limits to authentication endpoints
router.use(authLimiter);

// Authentication Endpoints
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

// Google OAuth Authentication Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const accessToken = generateAccessToken(req.user._id);
        const refreshToken = generateRefreshToken(req.user._id);
        const isProduction = process.env.NODE_ENV === 'production';

        // Attach Refresh Token as HttpOnly Cookie with production cross-domain support
        res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
        res.redirect(`${clientUrl}/auth-success?token=${accessToken}`);
    }
);

module.exports = router;