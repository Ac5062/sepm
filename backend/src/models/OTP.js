const mongoose = require('mongoose');

/**
 * OTP Model
 * Stores one-time passwords for the password-reset flow.
 *
 * Security properties:
 *  - One OTP per email (enforced by deleteMany before create in authController)
 *  - Auto-expires after 10 minutes via MongoDB TTL index
 *  - Deleted immediately after successful verification (one-time use)
 */
const otpSchema = new mongoose.Schema(
  {
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      lowercase: true,
      trim:      true,
      index:     true, // fast lookup by email
    },
    otp: {
      type:     String,
      required: [true, 'OTP value is required'],
    },
    // TTL field — MongoDB removes the document automatically at this timestamp
    expiresAt: {
      type:    Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// TTL index: MongoDB deletes the document once `expiresAt` is reached
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
