<<<<<<< HEAD
# Internship Academy — Staff / HR Portal (React frontend)

React (Vite) frontend for the Staff/HR-only Internship Management System, wired to call
a Node.js/Express backend as described in the project doc. It works in **demo mode**
out of the box (mock data) and automatically switches to **live mode** once your
backend endpoints respond.

## Run it

```bash
npm install
cp .env.example .env      # set VITE_API_URL to your backend, e.g. http://localhost:5000/api
npm run dev
```

Open the printed local URL (default `http://localhost:5173`).

## How the "connect to backend" part works

All network calls live in `src/api.js`. Each function tries the real endpoint first;
if the request fails (no backend running yet, wrong URL, 404, etc.) it logs a warning
to the console and falls back to local mock data / a no-op, so the UI keeps working.
The top bar shows a **"Backend connected" / "Demo mode"** pill so it's always clear
which mode you're in.

## Expected backend endpoints (Node.js + Express)

| Method | Path                              | Purpose                                   |
|--------|-----------------------------------|--------------------------------------------|
| POST   | `/api/auth/login`                 | `{ email, password, role }` → `{ token, user }` |
| GET    | `/api/interns`                    | Returns the intern list (attendance, tasks, assignments) |
| PATCH  | `/api/attendance/:internId`       | `{ date, status }` — update today's attendance |
| POST   | `/api/leave`                      | `{ internId, date, type, reason, remarks }` |
| POST   | `/api/certificates/:internId/generate` | Marks/generates a certificate |
| GET    | `/api/reports/:type?format=csv\|pdf\|excel` | Downloads an attendance/certificate report |

This matches the **Users** and **Attendance** tables from the project's proposed
database schema. Auth uses a Bearer token (JWT), stored in `localStorage` as
`ims_token` and attached automatically to every request.

## Project structure

```
src/
  api.js                    # backend calls + demo-mode fallback
  utils.js                  # attendance %, eligibility rules
  icons.jsx                 # shared icon set
  data/mockInterns.js       # demo data + full module list (from the module sheet)
  components/
    Login.jsx
    Sidebar.jsx              # renders every module from the module sheet
    Topbar.jsx
    Dashboard.jsx
    LeaveManagement.jsx      # full leave/attendance workflow
    CertificateManagement.jsx# eligibility + certificate generation
    GenericModule.jsx        # placeholder for not-yet-built modules
    Modals.jsx
```

## Notes

- Certificate eligibility rule (from the module doc): attendance ≥ 80%, all tasks
  completed, all assignments submitted.
- Only **Dashboard**, **Leave Management**, and **Certificate Management** are fully
  built; every other module from the module sheet has a sidebar entry and a
  "coming soon" placeholder in the same shell, ready to wire up the same way.
=======
# Attendance Management Backend

Flask API for the simplified Internship Academy Attendance Management System.

## Features

- JWT login at `POST /api/login`
- Intern roster at `GET /api/interns`
- Attendance CRUD at `/api/attendance`
- Attendance history and monthly summaries
- Attendance report preview at `GET /api/report`
- PDF export at `GET /api/report/pdf`
- Excel export at `GET /api/report/excel`

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create the MySQL database:

```bash
mysql -u root -p < schema.sql
```

4. Copy `.env.example` to `.env` and update `DATABASE_URI`, `JWT_SECRET_KEY`, and `SECRET_KEY`.
5. Start the server:

```bash
python app.py
```

The API runs on `http://localhost:5000`.

## API

All endpoints except `/api/login` and `/api/health` require:

```http
Authorization: Bearer <access_token>
```

### Authentication

- `POST /api/login`

Body:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

### Attendance

- `GET /api/interns`
- `GET /api/attendance`
- `POST /api/attendance`
- `PUT /api/attendance/<id>`
- `DELETE /api/attendance/<id>`
- `GET /api/attendance/history`
- `GET /api/attendance/monthly?month=7&year=2026`

Attendance body:

```json
{
  "user_id": 1,
  "date": "2026-07-07",
  "status": "present",
  "check_in": "09:30",
  "check_out": "17:30"
}
```

Use `"status": "absent"` for absent records. Leave, task, performance, certificate, and notification modules are intentionally removed.

### Reports

Report filters:

- `department`
- `batch`
- `intern`
- `month`
- `year`

Endpoints:

- `GET /api/report?department=Engineering&batch=A&month=7&year=2026`
- `GET /api/report/pdf?month=7&year=2026`
- `GET /api/report/excel?month=7&year=2026`
>>>>>>> 86787bb (Attendence and Report generation)
