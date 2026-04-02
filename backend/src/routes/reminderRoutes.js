const express = require('express');
const { body }  = require('express-validator');
const {
  getReminders,
  createReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All reminder routes require login
router.use(protect);

// ── Validation rules ──────────────────────────────────────
const reminderRules = [
  body('medicineName').notEmpty().withMessage('Medicine name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('frequency')
    .isIn(['once', 'twice', 'thrice', 'four-times'])
    .withMessage('Invalid frequency value'),
  body('times').isArray({ min: 1 }).withMessage('At least one time is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
];

// ── Routes ────────────────────────────────────────────────
router.get('/',                  getReminders);
router.post('/',    reminderRules, createReminder);
router.put('/:id',  reminderRules, updateReminder);
router.patch('/:id/toggle',       toggleReminder);
router.delete('/:id',             deleteReminder);

module.exports = router;
