# Internship Academy — Mentor / HR Portal (React frontend)

React (Vite) frontend for the Mentor/HR-only Internship Management System, wired to call
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
| POST   | `/api/auth/forgot-password`       | `{ email }` — sends a password reset link |
| POST   | `/api/auth/change-password`       | `{ currentPassword, newPassword }` |
| GET    | `/api/mentors/me`                 | Returns the signed-in mentor's profile |
| PUT    | `/api/mentors/:id`                | Updates a mentor's profile fields |
| GET    | `/api/interns`                    | Returns the intern list (attendance, tasks, assignments) |
| POST   | `/api/interns`                    | `{ name, dept, batch, mentor }` — add a student to a batch |
| PATCH  | `/api/interns/:internId`          | `{ dept, batch }` — move a student to another domain/batch |
| DELETE | `/api/interns/:internId`          | Removes a student from the roster |
| PATCH  | `/api/attendance/:internId`       | `{ date, status }` — update today's attendance |
| POST   | `/api/leave`                      | `{ internId, date, type, reason, remarks }` |
| POST   | `/api/certificates/:internId/generate` | Marks/generates a certificate |
| GET    | `/api/reports/:type?format=csv\|pdf\|excel` | Downloads a report (`:type` = `attendance`, `time`, `task`, `performance`, `batch-summary`, `leave`, `certificates`) |
| GET    | `/api/attendance/history?domain=&batch=&internId=` | Returns the historical leave/absence log |
| GET    | `/api/tasks`                       | Returns all assigned tasks |
| POST   | `/api/tasks`                       | `{ title, description, internId, startDate, dueDate, priority, status }` — create a task |
| PATCH  | `/api/tasks/:taskId`               | `{ status }` — update a task's status |
| GET    | `/api/assessments`                 | Returns uploaded Assessment_Records |
| POST   | `/api/assessments/upload`          | Multipart upload of an Excel file (field `file`) + parsed `records` |
| DELETE | `/api/assessments/:id`             | Deletes an assessment record |
| GET    | `/api/notifications`               | Returns sent notifications |
| POST   | `/api/notifications`               | `{ message, recipient }` — send a notification |
| GET    | `/api/reminders`                   | Returns deadline reminders |

Session Scheduler and AI Mentor are currently self-contained (in-memory state
only) and aren't wired to the backend yet — they're good candidates for the
next API pass.

This matches the **Users** and **Attendance** tables from the project's proposed
database schema. Auth uses a Bearer token (JWT), stored in `localStorage` as
`ims_token` and attached automatically to every request.

## Project structure

```
src/
  api.js                    # backend calls + demo-mode fallback
  pdfExport.js               # client-side PDF report builder (jspdf)
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
    AttendanceManagement.jsx # domain/batch/intern attendance + history
    BatchManagement.jsx      # add/move/remove students — shared roster source
    AuthMentorProfile.jsx    # mentor profile, password change, assigned interns
    ReportGeneration.jsx     # report type selection, preview, export/print
    charts/BarChart.jsx      # dependency-free SVG bar chart
    charts/PieChart.jsx      # dependency-free SVG pie chart + legend
    TaskManagement.jsx       # create/assign/track student tasks
    AnalyticsInsights.jsx    # attendance/eligibility/performance analytics
    SessionScheduler.jsx     # mentoring session calendar & booking
    AIMentor.jsx             # AI mentor chat & learning progress
    AssessmentManagement.jsx # Excel assessment upload & review
    Notification.jsx         # send notifications & view reminders
<<<<<<< HEAD
    TechManagement.jsx       # inventory, assets & license tracking
    Announcements.jsx        # announcements, messaging & reminders
    PerformanceTracking.jsx  # per-mentor performance dashboard
=======
>>>>>>> 2bed59f0a2e1a836182c496e47b4c8ad49cacfe9
    GenericModule.jsx        # placeholder for not-yet-built modules
    Modals.jsx
```

## Notes

- Certificate eligibility rule (from the module doc): attendance ≥ 80%, all tasks
  completed, all assignments submitted.
- **Dashboard**, **Leave Management**, **Certificate Management**, **Attendance
  Management**, **Batch Management**, **Auth & Mentor Profile**, **Report
  Generation**, **Task Assignment**, **Analytics & Insights**, **Session
<<<<<<< HEAD
  Scheduler**, **AI Mentor**, **Assessment Management**, **Notification &
  Reminder**, **Tech Management**, **Announcements & Communication**, and
  **Performance Tracking** are fully built (merged from parallel teammate
  branches). Every other module from the module sheet still has a sidebar
  entry and a "coming soon" placeholder in the same shell.
=======
  Scheduler**, **AI Mentor**, **Assessment Management**, and **Notification &
  Reminder** are fully built (merged from parallel teammate branches). Every
  other module from the module sheet still has a sidebar entry and a
  "coming soon" placeholder in the same shell.
>>>>>>> 2bed59f0a2e1a836182c496e47b4c8ad49cacfe9

### Batch Management (single source of truth for the roster)

Add, move, or remove students by Domain and Batch. Every module — Leave,
Certificate, Attendance, Report, Task, Analytics — reads from the *same*
`interns` array held in `App.jsx`, so a student added here appears
immediately in Attendance Management's Domain/Batch/Intern dropdowns and
tables, with no separate sync step. New students start with 0 days present,
0 tasks and 0 assignments (workingDays defaults to 60), ready to be marked
from Attendance Management or Task Assignment.

### Auth & Mentor Profile

My Profile (view/edit name, contact info, bio, skills, avatar), Security
(change password), and — for accounts signed in with the "Mentor" role —
Assigned Interns (a live roster pulled from the same shared `interns` state,
matched by mentor name). The login screen now also supports a Mentor role
and a working Forgot Password flow.

<<<<<<< HEAD
### Tech Management, Announcements & Communication, Performance Tracking

Three more self-contained modules:
- **Tech Management** — technology inventory, asset tracking, license
  health, and maintenance tasks (currently demo data only, no backend calls
  yet — a good next module to wire up).
- **Announcements & Communication** — announcements feed, direct messaging
  preview, and upcoming reminders (also demo data only for now).
- **Performance Tracking** — per-mentor dashboard (task summary, internship
  progress, activity score, a monthly performance chart, and a written
  monthly overview), computed live from the shared `interns` and `tasks`
  state via `mentorSummaries()` in `utils.js`.

=======
>>>>>>> 2bed59f0a2e1a836182c496e47b4c8ad49cacfe9
### Attendance Management (mentor domain)

Matches the workflow: *Select Domain → Select Batch → Select Individual Intern →
Mark/Edit Attendance → Save*. Tabs cover Daily marking, Weekly/Monthly views,
Batch-wise Summary, and Attendance History (a log of past leave/absence entries).

### Report Generation (mentor domain)

Matches the workflow: *Select Domain → Select Batch → Select Individual Intern →
Choose Report Type → Generate → Export/Print*. Report types: Attendance Report,
Internship Time Report, Task Progress Report, Performance Report, and
Batch-wise Summary. Each generated report includes a plain-language text
summary, a bar chart, and a pie chart (both dependency-free inline SVG,
reused 1:1 inside the export). **Export PDF** builds a real, downloadable PDF
client-side (via `jspdf`) containing the title, filters, text summary, a
vector bar chart, a vector pie chart with legend, and the full data table —
it works even with no backend connected. Export Excel still calls
`GET /api/reports/:type?format=excel` on your backend; Print uses the
browser's native print dialog.
