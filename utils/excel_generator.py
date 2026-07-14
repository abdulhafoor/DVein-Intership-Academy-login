import io
import pandas as pd


def create_report_excel(rows, report_type='attendance'):
    if report_type == 'batch-summary':
        columns = {
            'department': 'Department',
            'batch': 'Batch',
            'total': 'Interns',
            'avg_attendance': 'Average Attendance %',
            'eligible': 'Certificate Eligible',
        }
        sheet_name = 'Batch Summary'
    else:
        columns = {
            'date': 'Date',
            'intern_id': 'Intern ID',
            'intern_name': 'Intern Name',
            'department': 'Department',
            'batch': 'Batch',
            'status': 'Status',
            'check_in': 'Check In',
            'check_out': 'Check Out',
            'attendance_percentage': 'Attendance Percentage',
        }
        sheet_name = 'Attendance Report'

    df = pd.DataFrame(rows)
    if df.empty:
        df = pd.DataFrame(columns=columns.keys())
    df = df[list(columns.keys())].rename(columns=columns)

    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        worksheet = writer.sheets[sheet_name]
        for index, column in enumerate(df.columns):
            width = max(len(column) + 2, 16)
            worksheet.set_column(index, index, width)
    buffer.seek(0)
    return buffer
