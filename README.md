# Judiciary of Kenya — Internal Notice Board

A lightweight, web-based internal notice board for the Judiciary of Kenya's Tribunals. It enables tribunal admins to post official notices and manage staff memo submissions, and provides staff with a clean, searchable view of notices and shared documents relevant to their tribunal.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Tribunals](#tribunals)
- [Database](#database)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)

---

## Overview

The Internal Notice Board serves as a centralised digital noticeboard for Kenyan judiciary tribunals. Staff log in with their **User ID and password** and see only the notices and documents relevant to their tribunal (plus any system-wide public notices). Admins can post notices, approve or reject staff memo submissions, and manage a shared document library.

---

## Features

### For All Users
- 🔐 **Authenticated login** — User ID + password login with role-based access
- 📋 **Notice feed** — Searchable, filterable list of all relevant notices
- 📌 **Pinned urgent notices** — Urgent items float to the top with a red treatment
- 📁 **Documents tab** — Browse and open all notice attachments plus shared resources
- 🔔 **Notification bell** — Real-time in-app notifications panel with unread indicator
- 🖨️ **Print support** — Print any notice with or without attachment details

### For Staff
- 📝 **Submit memos** — Draft and submit memos to a tribunal admin for review
- 📂 **My Submissions** — Track the status of all submitted memos (pending / approved / rejected)
- ↩️ **Withdraw memos** — Cancel a pending memo before the admin acts on it

### For Admins
- 📣 **Post notices** — Publish notices immediately to one or all tribunals
- ✅ **Approvals queue** — Review, approve, or reject pending staff memo submissions
- 📎 **Resource library** — Upload standalone documents (forms, circulars, templates) to the Documents tab
- 👁️ **Cross-tribunal view** — Filter notices and documents across all six tribunals

---

## Project Structure

```
tribunal_notice_board/
├── index.html          # Main application shell & all HTML views
├── style.css           # All styles (design tokens, layout, components)
├── logo.png            # Judiciary of Kenya logo
└── src/
    └── script.js       # Application logic (data, rendering, events)
```

> **Planned additions** (see [Roadmap](#roadmap)):
> - `backend/` — Python/Node.js REST API
> - `backend/database.db` — SQLite database file
> - `backend/schema.sql` — Database creation script

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A local web server (recommended) **or** open `index.html` directly in a browser

### Running Locally

**Option 1 — VS Code Live Server (recommended)**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code.
2. Right-click `index.html` → **Open with Live Server**.
3. The app opens at `http://127.0.0.1:5500`.

**Option 2 — Python simple server**
```bash
# Python 3
cd tribunal_notice_board
python -m http.server 8080
# Visit http://localhost:8080
```

**Option 3 — Node.js serve**
```bash
npx serve .
# Visit the URL printed in the terminal
```

### Login

On the login screen, enter your **User ID** and **password** as assigned by your tribunal administrator. See [`schema.md`](schema.md) for how user accounts are created in the database.

> **Development note:** The current codebase uses in-memory JavaScript data. Once the backend API is wired up, the login screen will POST credentials to `/api/login` and receive a session token.

---

## User Roles

| Role | Description |
|---|---|
| **Admin** | Tribunal administrator. Can post notices, manage approvals, and upload shared resources. Sees all six tribunals. |
| **Staff** | Regular tribunal employee. Can read notices for their tribunal (plus Public), submit memos, and download documents. |

Each user account belongs to exactly one tribunal and has one role.

---

## Tribunals

The system currently supports the following six tribunals:

| Tribunal |
|---|
| Sports Tribunal |
| Employment Tribunal |
| Rent Tribunal |
| Business Premises Rent Tribunal |
| Rent Restriction Tribunal |
| Cooperative Tribunal |

Notices can be scoped to a single tribunal or published as **Public** (visible to all staff across all tribunals).

---

## Database

The application uses **SQLite** as its database. See [`schema.md`](schema.md) for:

- Full table definitions with all column types and constraints
- Instructions for creating the database from scratch
- Sample `INSERT` statements to seed initial data
- Notes on indexes and foreign key setup

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript (ES2020) |
| Fonts | Google Fonts — Source Serif 4, IBM Plex Sans, IBM Plex Mono |
| Database | SQLite 3 |
| Backend *(planned)* | Python (Flask / FastAPI) or Node.js (Express) |
| Auth *(planned)* | Session tokens or JWT |

---

## Roadmap

- [ ] Wire up backend API for login (`POST /api/login`)
- [ ] Replace in-memory notice data with database reads (`GET /api/notices`)
- [ ] Persist new notices and memo submissions to the database
- [ ] File upload endpoint for memo attachments
- [ ] Admin user-management panel (create / deactivate accounts)
- [ ] Email notifications on memo approval / rejection
- [ ] Audit log table for all admin actions
