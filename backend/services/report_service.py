from calendar import monthrange
from datetime import date

from sqlalchemy import extract

from models.attendance import Attendance
from models.user import User

SUPPORTED_REPORT_TYPES = {'attendance', 'batch-summary'}


def parse_report_filters(args):
    month = args.get('month', type=int) or date.today().month
    year = args.get('year', type=int) or date.today().year
    if month < 1 or month > 12:
        raise ValueError('month must be between 1 and 12')
    if year < 1900:
        raise ValueError('year is invalid')

    report_type = args.get('type') or args.get('reportType') or 'attendance'
    if report_type not in SUPPORTED_REPORT_TYPES:
        raise ValueError(f"report type must be one of {', '.join(sorted(SUPPORTED_REPORT_TYPES))}")

    intern_id = args.get('intern') or args.get('internId') or args.get('user_id')
    try:
        intern_id = int(intern_id) if intern_id else None
    except ValueError as exc:
        raise ValueError('intern must be a valid user id') from exc

    return {
        'department': args.get('department') or args.get('domain'),
        'batch': args.get('batch'),
        'intern_id': intern_id,
        'month': month,
        'year': year,
        'report_type': report_type,
    }


def get_filtered_interns(filters):
    query = User.query.filter_by(role='intern')
    if filters['department']:
        query = query.filter(User.department == filters['department'])
    if filters['batch']:
        query = query.filter(User.batch == filters['batch'])
    if filters['intern_id']:
        query = query.filter(User.id == filters['intern_id'])
    return query.order_by(User.name.asc()).all()


def get_month_attendance(intern_ids, month, year):
    if not intern_ids:
        return []
    return Attendance.query.filter(
        Attendance.user_id.in_(intern_ids),
        extract('month', Attendance.date) == month,
        extract('year', Attendance.date) == year,
    ).order_by(Attendance.date.asc()).all()


def calculate_attendance_summary(interns, attendance_rows, month, year):
    attendance_map = {}

    for row in attendance_rows:
        key = row.user_id
        if key not in attendance_map:
            attendance_map[key] = {'present': 0, 'absent': 0}
        attendance_map[key][row.status] = attendance_map[key].get(row.status, 0) + 1

    working_days = monthrange(year, month)[1]
    summary = []
    for intern in interns:
        stats = attendance_map.get(intern.id, {'present': 0, 'absent': 0})
        attendance_pct = round((stats['present'] / working_days) * 100, 2)
        summary.append({
            'intern_id': intern.id,
            'intern_name': intern.name,
            'department': intern.department,
            'batch': intern.batch,
            'month': month,
            'year': year,
            'working_days': working_days,
            'present': stats['present'],
            'absent': stats['absent'],
            'attendance_percentage': attendance_pct,
        })

    return summary


def calculate_batch_summary(interns, attendance_rows, month, year):
    attendance_map = {}

    for row in attendance_rows:
        key = row.user_id
        if key not in attendance_map:
            attendance_map[key] = {'present': 0, 'absent': 0}
        attendance_map[key][row.status] = attendance_map[key].get(row.status, 0) + 1

    working_days = monthrange(year, month)[1]
    groups = {}

    for intern in interns:
        stats = attendance_map.get(intern.id, {'present': 0, 'absent': 0})
        attendance_pct = round((stats['present'] / working_days) * 100, 2) if working_days else 0
        key = f"{intern.department or 'Unknown'} · {intern.batch or 'Unknown'}"
        if key not in groups:
            groups[key] = {
                'department': intern.department,
                'batch': intern.batch,
                'total': 0,
                'attendance_sum': 0.0,
                'eligible': 0,
            }
        groups[key]['total'] += 1
        groups[key]['attendance_sum'] += attendance_pct
        groups[key]['eligible'] += 1 if attendance_pct >= 75 else 0

    summary = []
    for group in groups.values():
        avg_attendance = round((group['attendance_sum'] / group['total']) * 100) / 100 if group['total'] else 0
        summary.append({
            'department': group['department'],
            'batch': group['batch'],
            'total': group['total'],
            'avg_attendance': avg_attendance,
            'eligible': group['eligible'],
        })

    return summary


def build_excel_rows(attendance_rows, summary, report_type='attendance'):
    if report_type == 'batch-summary':
        return [
            {
                'department': row['department'] or '',
                'batch': row['batch'] or '',
                'total': row['total'],
                'avg_attendance': row['avg_attendance'],
                'eligible': row['eligible'],
            }
            for row in summary
        ]

    percentages = {row['intern_id']: row['attendance_percentage'] for row in summary}
    rows = []
    for attendance in attendance_rows:
        user = attendance.user
        rows.append({
            'date': attendance.date.isoformat(),
            'intern_id': user.id,
            'intern_name': user.name,
            'department': user.department,
            'batch': user.batch,
            'status': attendance.status.title(),
            'check_in': attendance.check_in.isoformat(timespec='minutes') if attendance.check_in else '',
            'check_out': attendance.check_out.isoformat(timespec='minutes') if attendance.check_out else '',
            'attendance_percentage': percentages.get(user.id, 0),
        })
    return rows
