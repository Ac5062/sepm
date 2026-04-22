const nodemailer = require('nodemailer');

// ── Cached transporter (created once per process) ─────────
let _transporter = null;

// ── Create transporter ────────────────────────────────────
// If EMAIL_USER is set → use real SMTP from .env
// Otherwise → auto-create a free Ethereal test account
const getTransporter = async () => {
  if (_transporter) return _transporter;

  if (process.env.EMAIL_USER) {
    _transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST   || 'smtp.ethereal.email',
      port:   parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Auto-create a free Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    console.log(`📬 Ethereal test email account created: ${testAccount.user}`);
    _transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return _transporter;
};

// ── Send OTP email ────────────────────────────────────────
const sendOTPEmail = async (toEmail, otp) => {
  const transporter = await getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Affordable Medicine" <noreply@affordablemedicine.com>`,
    to: toEmail,
    subject: 'Password Reset OTP - Affordable Medicine',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #16a34a; margin-bottom: 8px;">🔐 Password Reset OTP</h2>
        <p style="color: #374151; margin-bottom: 24px;">
          You requested a password reset for your Affordable Medicine account.
          Use the OTP below to proceed. It is valid for <strong>10 minutes</strong>.
        </p>
        <div style="background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 8px; text-align: center; padding: 20px; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #15803d;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Affordable Medicine Alternative · Do not reply to this email
        </p>
      </div>
    `,
    text: `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, ignore this email.`,
  };

  const info = await transporter.sendMail(mailOptions);

  // In development with Ethereal, log the preview URL
  if (process.env.NODE_ENV === 'development') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 OTP email preview: ${previewUrl}`);
    }
  }

  return info;
};

module.exports = { sendOTPEmail };
