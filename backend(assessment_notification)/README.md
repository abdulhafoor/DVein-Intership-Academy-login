# Notification & Assessment Records Backend (Flask)

This backend is built to match your existing React components exactly:
`AssessmentManagement.jsx` (Excel upload of assessment records) and
`Notification.jsx` (send/list notifications by recipient group).

## Project structure

```
backend/
├── app/
│   ├── __init__.py                 # App factory
│   ├── config.py                   # Config (env-driven)
│   ├── extensions.py               # db instance
│   ├── models/
│   │   ├── assessment_record.py    # AssessmentRecord model
│   │   └── notification.py         # Notification model
│   └── routes/
│       ├── assessment_routes.py    # /api/assessment-records/*
│       └── notification_routes.py  # /api/notifications/*
├── frontend_integration/
│   └── api.js                      # Drop-in api.js matching your imports
├── instance/                       # SQLite DB lives here
├── uploads/                        # Uploaded Excel files (audit trail)
├── requirements.txt
├── .env.example
└── run.py
```

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env

python run.py
```

Server starts on `http://localhost:5000`. SQLite DB auto-creates at
`instance/app.db` on first run.

Health check: `GET /api/health`

## Wiring up your frontend

Copy `frontend_integration/api.js` over your existing `src/api.js` (or merge
the two functions in — `uploadAssessmentRecords`, `deleteAssessmentRecord`,
`sendNotification` — since those are the exact names your components already
import). Set `VITE_API_BASE_URL` in your frontend's `.env` if the backend
isn't on `http://localhost:5000`.

No other changes to `AssessmentManagement.jsx` or `Notification.jsx` are
needed — the API's JSON response shapes (`studentName`, `assessmentName`,
`marks`, `submittedDate` / `message`, `recipient`, `status`, `createdAt`)
match what those components already expect.

## API Reference

### Assessment Records — `/api/assessment-records`

| Method | Route | Description |
|---|---|---|
| POST | `/upload` | Bulk upload — multipart form with `file` + `records` (JSON array) |
| GET | `` | List records (`?search=&page=&per_page=`) |
| GET | `/stats` | `{ total, passCount, avgMarks }` for the stat cards |
| GET | `/<id>` | Get one record |
| PUT | `/<id>` | Update a record |
| DELETE | `/<id>` | Delete a record |

**Upload body** (multipart/form-data):
- `file`: the raw `.xlsx`/`.xls` file (stored under `uploads/` for audit purposes)
- `records`: JSON string, e.g.
  ```json
  [
    { "studentName": "Asha Rao", "assessmentName": "Week 6 Quiz", "marks": 78, "submittedDate": "2026-07-08" }
  ]
  ```

If you call `/upload` without a `records` field (e.g. via curl/Postman), the
server will try to parse the `.xlsx` file itself using `openpyxl`, looking
for headers like `student_name`, `assessment_name`, `marks`, `submitted_date`
(case-insensitive, with common variants). `.xls` files are only supported
via the client-side-parsed `records` path, since legacy `.xls` parsing
libraries are unreliable server-side.

### Notifications — `/api/notifications`

| Method | Route | Description |
|---|---|---|
| POST | `` | Send: `{ "message": "...", "recipient": "Batch A" }` |
| GET | `` | List (`?status=unread\|read&recipient=&page=&per_page=`) |
| GET | `/unread-count` | `{ unreadCount }` |
| PATCH | `/<id>/read` | Mark one as read |
| PATCH | `/read-all` | Mark all unread as read |
| DELETE | `/<id>` | Delete a notification |

`recipient` must be one of: `All Interns`, `Batch A`, `Batch B`, `Batch C`.

## Examples

**Send a notification:**
```bash
curl -X POST http://localhost:5000/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"message": "Week 6 scores are up.", "recipient": "Batch A"}'
```

**Upload assessment records:**
```bash
curl -X POST http://localhost:5000/api/assessment-records/upload \
  -F "file=@marks.xlsx" \
  -F 'records=[{"studentName":"Asha Rao","assessmentName":"Week 6 Quiz","marks":78,"submittedDate":"2026-07-08"}]'
```

**Delete a record:**
```bash
curl -X DELETE http://localhost:5000/api/assessment-records/1
```

## Notes / assumptions

- No auth is enforced yet — plug in your existing login/session system by
  gating these blueprints, or add `flask-jwt-extended` if you want token
  checks on top.
- The "Deadline Reminders" table in `Notification.jsx` is currently derived
  client-side from an `interns` prop (task/assignment completion counts)
  that isn't part of this module — that data would come from whatever
  intern-management module owns `tasksDone/tasksTotal/assignDone/assignTotal`.
  Happy to wire up an endpoint for that too if you share that model.
