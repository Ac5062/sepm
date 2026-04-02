const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['once', 'twice', 'thrice', 'four-times'],
      required: [true, 'Frequency is required'],
    },
    times: {
      type: [String],  // e.g. ['09:00', '21:00']
      required: [true, 'At least one time is required'],
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: String,
      default: null,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// A user's reminders are always scoped to that user
reminderSchema.index({ user: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
