# Dvein Innovations - Internship Academy (Backend)

Backend API for the **Technical Management** and **Announcement & Communication** modules.
Built with Node.js, Express, and SQLite (via `better-sqlite3`) — no external database server needed.

This is an **open internal tool with no login/authentication**. Names entered in the UI
("Your name" field) are stored as plain text for attribution only — they are not accounts.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create your `.env` file (copy `.env.example`):
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`

3. Start the server:
   ```
   npm start
   ```
   or for auto-reload during development:
   ```
   npm run dev
   ```

The API runs on `http://localhost:5000` by default. The SQLite database file
(`database.sqlite`) is created automatically in the backend folder on first run.

## API Overview

### Technical Management (Tasks)
| Method | Endpoint     | Description   |
|--------|--------------|---------------|
| GET    | /api/tasks     | List all tasks |
| GET    | /api/tasks/:id  | Get one task   |
| POST   | /api/tasks     | Create a task  |
| PUT    | /api/tasks/:id  | Update a task  |
| DELETE | /api/tasks/:id  | Delete a task  |

### Announcement & Communication
| Method | Endpoint                       | Description                    |
|--------|----------------------------------|---------------------------------|
| GET    | /api/announcements                | List announcements + comments  |
| POST   | /api/announcements                | Post an announcement            |
| DELETE | /api/announcements/:id             | Delete an announcement          |
| POST   | /api/announcements/:id/comments     | Add a comment (communication)   |

No `Authorization` header needed — every route is open.
