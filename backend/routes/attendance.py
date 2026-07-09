from calendar import monthrange
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import extract, or_

from database.db import db
from models.attendance import Attendance
from models.user import User

attendance_bp = Blueprint('attendance', __name__)

VALID_STATUSES = {'present', 'absent'}


def parse_date(value, default_today=False):
    if not value and default_today:
        return datetime.utcnow().date()
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None


def parse_time(value):
    if not value:
        return None
    for fmt in ('%H:%M', '%H:%M:%S'):
        try:
            return datetime.strptime(value, fmt).time()
        except ValueError:
            continue
    return None


def normalize_status(value):
    status = (value or '').strip().lower()
    return status if status in VALID_STATUSES else None


def intern_query():
    return User.query.filter_by(role='intern')


def find_intern(user_id):
    try:
        return intern_query().filter_by(id=int(user_id)).first()
    except (TypeError, ValueError):
        return None


def apply_attendance_filters(query):
    department = request.args.get('department') or request.args.get('domain')
    batch = request.args.get('batch')
    intern_id = request.args.get('intern') or request.args.get('internId') or request.args.get('user_id')
    date_value = parse_date(request.args.get('date'))
    search = request.args.get('search')

    if department:
        query = query.filter(User.department == department)
    if batch:
        query = query.filter(User.batch == batch)
    if intern_id:
        try:
            query = query.filter(User.id == int(intern_id))
        except ValueError:
            query = query.filter(False)
    if date_value:
        query = query.filter(Attendance.date == date_value)
    if search:
        term = f'%{search.strip()}%'
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term)))

    return query


def set_attendance_fields(attendance, payload):
    status = normalize_status(payload.get('status'))
    if not status:
        return 'Status must be Present or Absent'

    attendance.status = status
    if status == 'present':
        check_in = parse_time(payload.get('check_in') or payload.get('checkIn'))
        check_out = parse_time(payload.get('check_out') or payload.get('checkOut'))
        if (payload.get('check_in') or payload.get('checkIn')) and check_in is None:
            return 'check_in must use HH:MM format'
        if (payload.get('check_out') or payload.get('checkOut')) and check_out is None:
            return 'check_out must use HH:MM format'
        attendance.check_in = check_in
        attendance.check_out = check_out
    else:
        attendance.check_in = None
        attendance.check_out = None

    return None


@attendance_bp.route('', methods=['GET'])
@jwt_required()
def list_attendance():
    query = Attendance.query.join(User)
    rows = apply_attendance_filters(query).order_by(Attendance.date.desc(), User.name.asc()).all()
    return jsonify([row.to_dict() for row in rows])


@attendance_bp.route('', methods=['POST'])
@jwt_required()
def create_attendance():
    payload = request.get_json() or {}
    user_id = payload.get('user_id') or payload.get('intern_id') or payload.get('internId')
    date_value = parse_date(payload.get('date'), default_today=True)
    intern = find_intern(user_id)

    if not intern:
        return jsonify({'message': 'Valid intern is required'}), 400
    if not date_value:
        return jsonify({'message': 'date must use YYYY-MM-DD format'}), 400

    attendance = Attendance.query.filter_by(user_id=intern.id, date=date_value).first()
    if attendance:
        return jsonify({'message': 'Attendance already exists for this intern and date'}), 409

    attendance = Attendance(user_id=intern.id, date=date_value)
    error = set_attendance_fields(attendance, payload)
    if error:
        return jsonify({'message': error}), 400

    db.session.add(attendance)
    db.session.commit()
    return jsonify(attendance.to_dict()), 201


@attendance_bp.route('/<int:attendance_id>', methods=['PUT'])
@jwt_required()
def update_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    payload = request.get_json() or {}

    if payload.get('date'):
        date_value = parse_date(payload.get('date'))
        if not date_value:
            return jsonify({'message': 'date must use YYYY-MM-DD format'}), 400
        attendance.date = date_value

    error = set_attendance_fields(attendance, payload)
    if error:
        return jsonify({'message': error}), 400

    db.session.commit()
    return jsonify(attendance.to_dict())


@attendance_bp.route('/<int:attendance_id>', methods=['DELETE'])
@jwt_required()
def delete_attendance(attendance_id):
    attendance = Attendance.query.get_or_404(attendance_id)
    db.session.delete(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance deleted'})


@attendance_bp.route('/history', methods=['GET'])
@jwt_required()
def attendance_history():
    query = Attendance.query.join(User)
    rows = apply_attendance_filters(query).order_by(Attendance.date.desc()).all()
    return jsonify([row.to_dict() for row in rows])


@attendance_bp.route('/monthly', methods=['GET'])
@jwt_required()
def monthly_attendance():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)

    if not month or not year or month < 1 or month > 12:
        return jsonify({'message': 'Valid month and year are required'}), 400

    working_days = monthrange(year, month)[1]
    query = Attendance.query.join(User).filter(
        extract('month', Attendance.date) == month,
        extract('year', Attendance.date) == year,
    )
    rows = apply_attendance_filters(query).all()

    grouped = {}
    for row in rows:
        stats = grouped.setdefault(
            row.user_id,
            {
                'intern_id': row.user_id,
                'intern_name': row.user.name,
                'department': row.user.department,
                'batch': row.user.batch,
                'working_days': working_days,
                'present': 0,
                'absent': 0,
            },
        )
        stats[row.status] += 1

    for stats in grouped.values():
        stats['attendance_percentage'] = round(
            (stats['present'] / stats['working_days']) * 100,
            2,
        )

    return jsonify(list(grouped.values()))
