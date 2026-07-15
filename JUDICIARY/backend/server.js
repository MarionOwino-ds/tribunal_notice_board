const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cors = require('cors');
const path = require('path');

const { dbPromise } = require('./db');
const authRoutes          = require('./routes/auth');
const noticesRoutes       = require('./routes/notices');
const resourcesRoutes     = require('./routes/resources');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Allow requests from the frontend (Live Server default port)
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));

// Session middleware — stored in sessions.db next to the main database
app.use(session({
  store: new FileStore({ path: path.join(__dirname, 'sessions'), ttl: 28800, retries: 1 }),
  secret: 'tribunal-intranet-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,       // set to true when serving over HTTPS
    maxAge: 8 * 60 * 60 * 1000  // 8-hour session (one working day)
  }
}));

// Serve the frontend statically
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/auth',          authRoutes);
app.use('/api/notices',       noticesRoutes);
app.use('/api/resources',     resourcesRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 fallback for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

dbPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`Tribunal backend running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});
