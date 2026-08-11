const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, generateToken } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user._id);
        res.redirect(`http://localhost:4200/auth-success?token=${token}`);
    }
);

module.exports = router;