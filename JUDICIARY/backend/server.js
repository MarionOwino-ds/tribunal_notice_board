const express = require('express');
const session  = require('express-session');
const FileStore = require('session-file-store')(session);
const cors     = require('cors');
const path     = require('path');

const authRoutes          = require('./routes/auth');
const noticesRoutes       = require('./routes/notices');
const resourcesRoutes     = require('./routes/resources');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes         = require('./routes/users');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Allow requests from any localhost origin (Live Server, direct file open, etc.)
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin (no origin header), null (file:// origin), and any localhost
    if (!origin || origin === 'null' || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(new Error('CORS: Not allowed'));
  },
  credentials: true
}));

// Session middleware
app.use(session({
  store: new FileStore({
    path: path.join(__dirname, 'sessions'),
    ttl: 28800,
    retries: 1
  }),
  secret: 'tribunal-intranet-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,       // set true when serving over HTTPS
    maxAge: 8 * 60 * 60 * 1000
  }
}));

// Serve JUDICIARY frontend (login / register pages)
app.use(express.static(path.join(__dirname, '..')));

// Serve dashboard2 frontend
app.use(express.static(path.join(__dirname, '..', '..', 'dashboard2')));

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/notices',       noticesRoutes);
app.use('/api/resources',     resourcesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users',         usersRoutes);

// 404 fallback for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Start server — db is synchronous now, no promise needed
app.listen(PORT, () => {
  console.log(`\n✅  Tribunal backend running at http://localhost:${PORT}`);
  console.log(`    Login page  → http://localhost:${PORT}/index.html`);
  console.log(`    Dashboard   → http://localhost:${PORT}/dashboard.html`);
  console.log(`\n    Default admin: ADMIN001 / Admin@1234\n`);
});
