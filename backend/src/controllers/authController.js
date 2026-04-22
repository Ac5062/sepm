const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const { validationResult } = require('express-validator');
const User    = require('../models/User');
const OTP     = require('../models/OTP');
const Medicine = require('../models/Medicine');
const { sendOTPEmail } = require('../utils/emailService');
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
>>>>>>> acf6b7a (Add backend: auth, medicines, reminders API with security middleware)
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

>>>>>>> acf6b7a (Add backend: auth, medicines, reminders API with security middleware)
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

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────
const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// ── POST /api/auth/forgot-password ───────────────────────
// Generates a 6-digit OTP and emails it
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, an OTP has been sent.',
      });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to DB (TTL auto-deletes after 10 min)
    await OTP.create({ email: email.toLowerCase(), otp });

    // Send email
    await sendOTPEmail(email.toLowerCase(), otp);

    res.status(200).json({
      success: true,
      message: 'If this email is registered, an OTP has been sent.',
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
};

// ── POST /api/auth/verify-otp ─────────────────────────────
// Validates OTP — returns a short-lived reset token on success
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const record = await OTP.findOne({ email: email.toLowerCase() });
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // OTP matched — delete it (one-time use)
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Issue a short-lived reset token (15 min)
    const resetToken = jwt.sign(
      { email: email.toLowerCase(), purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ success: true, resetToken });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP.' });
  }
};

// ── POST /api/auth/reset-password ────────────────────────
// Accepts the reset token and new password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: 'Reset link expired. Please request a new OTP.' });
    }

    if (decoded.purpose !== 'reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update password — pre-save hook will hash it
    user.password = password;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
};

// ── PUT /api/auth/profile ─────────────────────────────────
// Update name and phone (protected)
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name && name.trim().length >= 2) {
      updates.name = name.trim();
    } else if (name !== undefined) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    }

    if (phone) {
      const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number.' });
      }
      updates.phone = phone;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        phone: user.phone,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
};

// ── PUT /api/auth/change-password ─────────────────────────
// Change password (protected — requires current password)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};

// ── GET /api/auth/stats ───────────────────────────────────
// Admin-only: real DB stats for dashboard
const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const [totalUsers, totalMedicines, totalAdmins] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Medicine.countDocuments(),
      User.countDocuments({ role: 'admin' }),
    ]);

    // Monthly user registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Monthly medicines added for the last 6 months
    const monthlyMedicines = await Medicine.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Build a full 6-month array (fill gaps with 0)
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const year  = d.getFullYear();
      const month = d.getMonth() + 1;
      const label = MONTH_NAMES[d.getMonth()];

      const userEntry = monthlyUsers.find(
        (m) => m._id.year === year && m._id.month === month
      );
      const medEntry = monthlyMedicines.find(
        (m) => m._id.year === year && m._id.month === month
      );

      monthlyData.push({
        month: label,
        users:     userEntry  ? userEntry.count  : 0,
        medicines: medEntry   ? medEntry.count   : 0,
      });
    }

    // Medicine category breakdown
    const categoryBreakdown = await Medicine.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalMedicines,
        totalAdmins,
        monthlyData,
        categoryBreakdown: categoryBreakdown.map((c) => ({
          name:  c._id || 'Uncategorized',
          value: c.count,
        })),
      },
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,
  changePassword,
  getAdminStats,
};