from flask import Blueprint, current_app, jsonify, request, send_file
from flask_jwt_extended import jwt_required

from services.report_service import (
    build_excel_rows,
    calculate_attendance_summary,
    calculate_batch_summary,
    get_filtered_interns,
    get_month_attendance,
    parse_report_filters,
)
from utils.excel_generator import create_report_excel
from utils.pdf_generator import create_report_pdf

report_bp = Blueprint('report', __name__)


def build_report_payload():
    filters = parse_report_filters(request.args)
    interns = get_filtered_interns(filters)
    attendance_rows = get_month_attendance(
        [intern.id for intern in interns],
        filters['month'],
        filters['year'],
    )
    if filters['report_type'] == 'batch-summary':
        summary = calculate_batch_summary(
            interns,
            attendance_rows,
            filters['month'],
            filters['year'],
        )
    else:
        summary = calculate_attendance_summary(
            interns,
            attendance_rows,
            filters['month'],
            filters['year'],
        )
    return filters, attendance_rows, summary


@report_bp.route('', methods=['GET'])
@jwt_required()
def report_preview():
    try:
        filters, _, summary = build_report_payload()
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400
    return jsonify({'filters': filters, 'rows': summary})


@report_bp.route('/pdf', methods=['GET'])
@jwt_required()
def report_pdf():
    try:
        filters, _, summary = build_report_payload()
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400

    month_label = f"{filters['year']}-{filters['month']:02d}"
    company_name = current_app.config.get('COMPANY_NAME', 'Internship Academy')
    pdf_bytes = create_report_pdf(company_name, summary, month_label, filters['report_type'])
    download_name = 'attendance-report.pdf' if filters['report_type'] == 'attendance' else 'batch-summary-report.pdf'
    return send_file(
        pdf_bytes,
        download_name=download_name,
        mimetype='application/pdf',
    )


@report_bp.route('/excel', methods=['GET'])
@jwt_required()
def report_excel():
    try:
        filters, attendance_rows, summary = build_report_payload()
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400

    excel_rows = build_excel_rows(attendance_rows, summary, filters['report_type'])
    download_name = 'attendance-report.xlsx' if filters['report_type'] == 'attendance' else 'batch-summary-report.xlsx'
    excel_bytes = create_report_excel(excel_rows, filters['report_type'])
    return send_file(
        excel_bytes,
        download_name=download_name,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
