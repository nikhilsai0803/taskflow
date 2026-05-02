require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/authRoutes');
const userRoutes    = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes    = require('./routes/taskRoutes');

connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow all Railway + localhost origins. In production set CORS_ORIGIN env var
// to your exact frontend Railway URL, e.g. https://taskflow-frontend.up.railway.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.trim()))) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks',    taskRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
