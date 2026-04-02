require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');

const connectDB = require('../config/db');

// ── Route imports ────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const medicineRoutes  = require('./routes/medicineRoutes');
const reminderRoutes  = require('./routes/reminderRoutes');

// ── Connect to database ──────────────────────────────────
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────
// In development allow any localhost port; in production restrict to CLIENT_URL
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost / 127.0.0.1 origin in development
    if (process.env.NODE_ENV === 'development') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }
    // In production, only allow the configured CLIENT_URL
    if (origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
