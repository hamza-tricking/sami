const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'samy_super_secret_jwt_key_2026_luxury_pastry';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, role }, secret, { expiresIn });
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: User not found',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials: Password incorrect',
      });
    }

    const token = signToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile from token
// @access  Private
router.get('/me', protect, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
