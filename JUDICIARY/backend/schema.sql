PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tribunals (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    short_code TEXT NOT NULL UNIQUE,
    color_hex  TEXT NOT NULL DEFAULT '#123423'
);

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    email         TEXT UNIQUE,
    role          TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    tribunal_id   INTEGER NOT NULL REFERENCES tribunals(id) ON DELETE RESTRICT,
    department    TEXT NOT NULL CHECK (department IN (
                    'Registry',
                    'Court Coordination',
                    'Legal Support',
                    'Human Resources',
                    'IT Services',
                    'Finance',
                    'Public Relations',
                    'Records Management'
                  )),
    is_active     INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS notices (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    ref           TEXT NOT NULL UNIQUE,
    tribunal_id   INTEGER REFERENCES tribunals(id) ON DELETE SET NULL,
    is_public     INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
    title         TEXT NOT NULL,
    body          TEXT NOT NULL,
    notice_date   TEXT NOT NULL,
    is_urgent     INTEGER NOT NULL DEFAULT 0 CHECK (is_urgent IN (0, 1)),
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reject_reason TEXT,
    posted_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    submitted_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    notice_id   INTEGER NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    file_name   TEXT NOT NULL,
    file_size   TEXT,
    file_url    TEXT,
    mime_type   TEXT,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resources (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    description   TEXT,
    file_url      TEXT NOT NULL,
    file_size     TEXT,
    tribunal_id   INTEGER REFERENCES tribunals(id) ON DELETE SET NULL,
    is_public     INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
    uploaded_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resource_date TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    meta        TEXT,
    notice_ref  TEXT,
    is_read     INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notices_tribunal     ON notices(tribunal_id);
CREATE INDEX IF NOT EXISTS idx_notices_status       ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_date         ON notices(notice_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_submitted_by ON notices(submitted_by);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_resources_tribunal   ON resources(tribunal_id);

-- Seed tribunals
INSERT OR IGNORE INTO tribunals (name, short_code, color_hex) VALUES
  ('Sports Tribunal',                 'ST',   '#1E6B44'),
  ('Employment Tribunal',             'ET',   '#2C5F7C'),
  ('Rent Tribunal',                   'RNT',  '#8C7220'),
  ('Business Premises Rent Tribunal', 'BPRT', '#4A5A3E'),
  ('Rent Restriction Tribunal',       'RRT',  '#7A2E2E'),
  ('Cooperative Tribunal',            'CT',   '#64615A');

-- Seed default admin account (password: Admin@1234)
-- Hash generated with bcryptjs rounds=12
INSERT OR IGNORE INTO users (user_id, password_hash, full_name, email, role, tribunal_id, department)
VALUES (
  'ADMIN001',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgK8x5O.UO3..oFKhHHlvS',
  'System Administrator',
  'admin@tribunal.go.ke',
  'admin',
  1,
  'IT Services'
);
