# Judiciary of Kenya — Internal Notice Board

A web-based internal notice board for the Judiciary of Kenya's Tribunals. Tribunal admins post official notices and manage staff memo submissions. Staff get a clean, searchable feed of notices and shared documents scoped to their tribunal.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Tribunals](#tribunals)
- [Database](#database)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)

---

## Overview

Staff log in with their **Staff ID and password** and see only the notices and documents relevant to their tribunal, plus any system-wide public notices. The role (`admin` or `staff`) is stored in the database — no hardcoded IDs. Admins are created directly in the database; all self-registrations are staff accounts.

---

## Features

### For All Users
- 🔐 **Authenticated login** — Staff ID + password, session-based auth (8-hour session)
- 📋 **Notice feed** — Searchable, filterable list of notices scoped to the user's tribunal
- 📌 **Pinned urgent notices** — Urgent items float to the top with a red treatment
- 📁 **Documents tab** — Browse shared resources and notice attachments
- 🔔 **Notification bell** — In-app notifications with unread indicator
- 🖨️ **Print support** — Print any notice with or without attachment details

### For Staff
- 📝 **Submit memos** — Draft and submit memos to a tribunal admin for review
- 📂 **My Submissions** — Track memo status (pending / approved / rejected)
- ↩️ **Withdraw memos** — Cancel a pending memo before the admin acts on it

### For Admins
- 📣 **Post notices** — Publish notices immediately to one or all tribunals
- ✅ **Approvals queue** — Review, approve, or reject pending staff memo submissions
- 📎 **Resource library** — Add shared documents (forms, circulars, templates) by URL
- 👁️ **Cross-tribunal view** — Filter notices and documents across all six tribunals

---

## Project Structure

```
tribunal_notice_board/
├── .gitignore
├── README.md
├── schema.md               # Full database schema documentation
│
├── JUDICIARY/              # Login & registration frontend
│   ├── index.html          # Login page
│   ├── register.html       # Staff registration page
│   ├── script.js           # Login logic — calls POST /api/auth/login
│   ├── register.js         # Registration logic — calls POST /api/auth/register
│   ├── style.css
│   ├── judiciary-logo.png
│   │
│   └── backend/            # Node.js / Express REST API
│       ├── server.js       # App entry point
│       ├── db.js           # SQLite connection & initialisation (sql.js)
│       ├── schema.sql      # Database schema + tribunal seed data
│       ├── package.json
│       ├── sessions/       # Session files (git-ignored)
│       ├── database.db     # SQLite database file (git-ignored)
│       └── routes/
│           ├── auth.js         # /api/auth/*
│           ├── notices.js      # /api/notices/*
│           ├── resources.js    # /api/resources/*
│           └── notifications.js # /api/notifications/*
│
└── dashboard2/             # Main dashboard frontend
    ├── dashboard.html
    ├── logo.png
    ├── css/
    │   └── style.css
    └── js/
        └── dashboard.js    # Dashboard logic — fetches from API
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or newer
- A modern browser (Chrome, Firefox, Edge, Safari)

### 1. Install dependencies

```bash
cd JUDICIARY/backend
npm install
```

### 2. Add the database file

Place the `database.db` file inside `JUDICIARY/backend/`. If you don't have one yet, the backend will create a fresh database automatically on first run using `schema.sql` (tribunals are seeded, but you will need to insert at least one admin user manually).

### 3. Start the backend

```bash
cd JUDICIARY/backend
npm start
# or for auto-reload during development:
npm run dev
```

The API will be available at `http://localhost:3000`.

### 4. Open the frontend

Open `JUDICIARY/index.html` directly in your browser **or** use VS Code Live Server:

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `JUDICIARY/index.html` → **Open with Live Server**
3. App opens at `http://127.0.0.1:5500/JUDICIARY/index.html`

> The frontend expects the backend at `http://localhost:3000`. Both must be running at the same time.

### 5. Create your first admin user

Until the admin management panel is built, insert an admin directly into the database. Use a tool like [DB Browser for SQLite](https://sqlitebrowser.org/) or run:

```bash
cd JUDICIARY/backend
node -e "
const bcrypt = require('bcryptjs');
const { db, dbPromise } = require('./db');
dbPromise.then(() => {
  const hash = bcrypt.hashSync('YourPassword123', 12);
  db.prepare(\`INSERT INTO users (user_id, password_hash, full_name, email, role, tribunal_id, department)
    VALUES (?, ?, ?, ?, 'admin', 1, 'Registry')\`)
    .run('ADMIN-001', hash, 'Your Name', 'admin@tribunal.go.ke');
  console.log('Admin created.');
  process.exit(0);
});
"
```

---

## API Reference

All endpoints are prefixed with `/api`. Requests and responses use JSON. Session cookie is set on login and required for all protected routes.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/tribunals` | Public | List all tribunals (for registration dropdown) |
| `POST` | `/api/auth/register` | Public | Register a new staff account |
| `POST` | `/api/auth/login` | Public | Login and start a session |
| `POST` | `/api/auth/logout` | Required | Destroy the session |
| `GET` | `/api/auth/me` | Required | Return the current session user |

### Notices

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notices` | Required | Get notices (scoped by tribunal + role) |
| `GET` | `/api/notices/my-submissions` | Required | Staff: get own memo submissions |
| `POST` | `/api/notices` | Required | Admin: post notice. Staff: submit memo |
| `PATCH` | `/api/notices/:id/status` | Admin | Approve or reject a pending memo |
| `DELETE` | `/api/notices/:id` | Required | Staff: withdraw own pending memo |

### Resources

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/resources` | Required | Get shared documents (scoped by tribunal) |
| `POST` | `/api/resources` | Admin | Add a resource by URL |
| `DELETE` | `/api/resources/:id` | Admin | Remove a resource |

### Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notifications` | Required | Get current user's notifications (latest 50) |
| `PATCH` | `/api/notifications/read` | Required | Mark all notifications as read |

---

## User Roles

| Role | Description |
|---|---|
| **admin** | Tribunal administrator. Posts notices, manages approvals, uploads resources. Can see all tribunals. |
| **staff** | Regular employee. Reads notices for their tribunal + public notices, submits memos, downloads documents. |

- All self-registrations via `register.html` are created as `staff`.
- Admin accounts are created directly in the database.
- Role is determined entirely by the `role` column in the `users` table — no hardcoded IDs.

---

## Tribunals

| Tribunal | Code |
|---|---|
| Sports Tribunal | ST |
| Employment Tribunal | ET |
| Rent Tribunal | RNT |
| Business Premises Rent Tribunal | BPRT |
| Rent Restriction Tribunal | RRT |
| Cooperative Tribunal | CT |

Notices can be scoped to a single tribunal or published as **Public** (visible to all staff).

---

## Database

The app uses **SQLite** via [sql.js](https://github.com/sql-js/sql.js) (pure JavaScript — no native build tools required).

- The database file is `JUDICIARY/backend/database.db` (git-ignored)
- On first run, `schema.sql` is executed automatically to create all tables and seed the six tribunals
- See [`schema.md`](schema.md) for full table definitions, column details, indexes, and sample seed data

### Tables

| Table | Purpose |
|---|---|
| `tribunals` | Master list of the six tribunals |
| `users` | Staff and admin accounts |
| `notices` | All notices and staff memo submissions |
| `attachments` | Files attached to notices |
| `resources` | Standalone shared documents |
| `notifications` | Per-user in-app notification records |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript (ES2020) |
| Fonts | Google Fonts — Inter |
| Backend | Node.js, Express 4 |
| Database | SQLite 3 via sql.js |
| Auth | express-session + session-file-store (8-hour sessions) |
| Password hashing | bcryptjs (cost factor 12) |

---

## Roadmap

- [ ] Wire dashboard.js publish form to `POST /api/notices`
- [ ] Wire dashboard.js document upload to `POST /api/resources`
- [ ] Wire approve / reject buttons to `PATCH /api/notices/:id/status`
- [ ] Wire withdraw button to `DELETE /api/notices/:id`
- [ ] Load real notifications from `GET /api/notifications`
- [ ] Admin user-management panel (create / deactivate accounts)
- [ ] Email notifications on memo approval / rejection
- [ ] Audit log table for all admin actions
- [ ] HTTPS + secure cookie for production deployment
