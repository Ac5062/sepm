const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ── Helper: generate JWT ──────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Helper: send token response ──────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      role:  user.role,
    },
  });
};

// ── POST /api/auth/register ───────────────────────────────
const register = async (req, res) => {
  // Check express-validator errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password, phone } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({ name, email, password, phone });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    const { email, password } = req.body;

    // Find user — include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = { register, login, getMe };
