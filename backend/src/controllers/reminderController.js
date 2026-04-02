const { validationResult } = require('express-validator');
const Reminder = require('../models/Reminder');

// ── GET /api/reminders ────────────────────────────────────
// Returns all reminders for the logged-in user
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reminders.' });
  }
};

// ── POST /api/reminders ───────────────────────────────────
const createReminder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    const reminder = await Reminder.create({
      ...req.body,
      user: req.user._id,
    });
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating reminder.' });
  }
};

// ── PUT /api/reminders/:id ────────────────────────────────
const updateReminder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, // Ensure user owns this reminder
      req.body,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or you do not have permission.',
      });
    }

    res.status(200).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating reminder.' });
  }
};

// ── PATCH /api/reminders/:id/toggle ──────────────────────
// Toggle active/inactive without sending the full object
const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found.' });
    }

    reminder.active = !reminder.active;
    await reminder.save();

    res.status(200).json({ success: true, data: reminder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling reminder.' });
  }
};

// ── DELETE /api/reminders/:id ─────────────────────────────
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,  // Ensure user owns this reminder
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found or you do not have permission.',
      });
    }

    res.status(200).json({ success: true, message: 'Reminder deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting reminder.' });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
};
