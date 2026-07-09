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
