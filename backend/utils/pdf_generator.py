import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def create_report_pdf(company_name, rows, month_label, report_type='attendance'):
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    pdf.setTitle('Attendance Report' if report_type == 'attendance' else 'Batch Summary Report')

    pdf.setFont('Helvetica-Bold', 16)
    pdf.drawString(40, height - 45, company_name)
    pdf.setFont('Helvetica-Bold', 13)
    title = 'Attendance Report' if report_type == 'attendance' else 'Batch Summary Report'
    pdf.drawString(40, height - 68, title)
    pdf.setFont('Helvetica', 10)
    pdf.drawString(40, height - 88, f'Month: {month_label}')
    pdf.drawString(40, height - 104, f'Generated Date: {datetime.utcnow().date().isoformat()}')

    if report_type == 'batch-summary':
        headers = ['Department', 'Batch', 'Interns', 'Avg. Attendance %', 'Certificate Eligible']
        widths = [120, 80, 70, 90, 110]
    else:
        headers = [
            'Intern Name',
            'Department',
            'Batch',
            'Working Days',
            'Present',
            'Absent',
            'Attendance %',
        ]
        widths = [110, 90, 70, 80, 55, 55, 85]

    y = height - 135

    if not rows:
        pdf.drawString(40, y, 'No data available')
    else:
        pdf.setFillColor(colors.lightgrey)
        pdf.rect(40, y - 4, sum(widths), 18, fill=1, stroke=0)
        pdf.setFillColor(colors.black)
        pdf.setFont('Helvetica-Bold', 8)
        x = 44
        for index, header in enumerate(headers):
            pdf.drawString(x, y, header)
            x += widths[index]
        y -= 22

        pdf.setFont('Helvetica', 8)
        for row in rows:
            if y < 60:
                pdf.showPage()
                y = height - 45
                pdf.setFont('Helvetica', 8)

            if report_type == 'batch-summary':
                values = [
                    row['department'] or '',
                    row['batch'] or '',
                    str(row['total']),
                    str(row['avg_attendance']),
                    str(row['eligible']),
                ]
            else:
                values = [
                    row['intern_name'],
                    row['department'] or '',
                    row['batch'] or '',
                    str(row['working_days']),
                    str(row['present']),
                    str(row['absent']),
                    f"{row['attendance_percentage']}%",
                ]

            x = 44
            for index, value in enumerate(values):
                pdf.drawString(x, y, value[:22])
                x += widths[index]
            y -= 16

    pdf.save()
    buffer.seek(0)
    return buffer
