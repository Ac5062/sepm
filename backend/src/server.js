require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const connectDB = require('../config/db');
const {
  securityHeaders,
  sanitizeInput,
  generalLimiter,
} = require('./middleware/securityMiddleware');

// ── Route imports ────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const medicineRoutes  = require('./routes/medicineRoutes');
const reminderRoutes  = require('./routes/reminderRoutes');

// ── Connect to database ──────────────────────────────────
connectDB();

const app = express();

// ── Security headers (helmet replacement) ───────────────
app.use(securityHeaders);

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'development') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    if (origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Body parsers — limit payload size to prevent large-body DoS attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── Input sanitization ───────────────────────────────────
app.use(sanitizeInput);

// ── General rate limiter (200 req / 15 min per IP) ──────
app.use('/api', generalLimiter);

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/reminders', reminderRoutes);

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Affordable Medicine API is running' });
});

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
