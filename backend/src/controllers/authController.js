const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

/**
 * Helper to get cookie options dynamically based on environment
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax', // 'none' is required for cross-domain HTTPS cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

/**
 * Helper to send Access Token in JSON response and Refresh Token in HttpOnly Cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, getCookieOptions())
    .json({
      _id: user._id,
      name: user.name,
      email: user.email,
      themePreference: user.themePreference,
      accessToken,
    });
};

// @desc    Register User
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login User
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      sendTokenResponse(user, 200, res);
    } else {
      res.status(401);
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token using HttpOnly Refresh Token Cookie
// @route   POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const refreshTokenCookie = req.cookies.refreshToken;

    if (!refreshTokenCookie) {
      res.status(401);
      throw new Error('Not authorized, no refresh token provided');
    }

    const decoded = jwt.verify(
      refreshTokenCookie,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401);
    next(new Error('Refresh token expired or invalid'));
  }
};

// @desc    Logout User / Clear Refresh Token Cookie
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  res.cookie('refreshToken', '', {
    ...getCookieOptions(),
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  generateAccessToken,
  generateRefreshToken,
};