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
