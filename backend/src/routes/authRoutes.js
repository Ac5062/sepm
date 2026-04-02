const express = require('express');
const { body }  = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ── Validation rules ──────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name must contain only letters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .matches(/^(\+91[\-\s]?)?[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────
router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get('/me',        protect,       getMe);   // protected — returns current user

module.exports = router;
