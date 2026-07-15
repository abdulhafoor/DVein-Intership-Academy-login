import { jsPDF } from 'jspdf';

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function setFill(doc, hex) {
  const { r, g, b } = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setDraw(doc, hex) {
  const { r, g, b } = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

function setText(doc, hex) {
  const { r, g, b } = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

const COLORS = {
  text: '#1C2233',
  muted: '#7A8299',
  border: '#E7EAF3',
  primary: '#3B6FF3'
};

function drawBarChart(doc, { data, x, y, width, height, valueSuffix = '' }) {
  const chartH = height - 40;
  const baseline = y + chartH;
  setDraw(doc, COLORS.border);
  doc.setLineWidth(1);
  doc.line(x, baseline, x + width, baseline);

  if (!data.length) {
    setText(doc, COLORS.muted);
    doc.setFontSize(9);
    doc.text('No data to display', x + width / 2, y + chartH / 2, { align: 'center' });
    return;
  }

  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const gap = 10;
  const barW = Math.min(34, (width - gap * (data.length - 1)) / data.length);
  const usedW = data.length * barW + (data.length - 1) * gap;
  const startX = x + (width - usedW) / 2;

  data.forEach((d, idx) => {
    const barH = (d.value / maxValue) * chartH;
    const bx = startX + idx * (barW + gap);
    const by = baseline - barH;
    setFill(doc, d.colorHex || COLORS.primary);
    doc.roundedRect(bx, by, barW, Math.max(barH, 2), 2, 2, 'F');

    setText(doc, COLORS.text);
    doc.setFontSize(7.5);
    doc.text(`${d.value}${valueSuffix}`, bx + barW / 2, by - 4, { align: 'center' });

    setText(doc, COLORS.muted);
    doc.setFontSize(7);
    const label = d.label.length > 9 ? `${d.label.slice(0, 8)}…` : d.label;
    doc.text(label, bx + barW / 2, baseline + 10, { align: 'center' });
  });
}

function drawPieChart(doc, { data, cx, cy, r, legendX, legendY }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    setDraw(doc, COLORS.border);
    setFill(doc, '#F3F5FB');
    doc.circle(cx, cy, r, 'FD');
    setText(doc, COLORS.muted);
    doc.setFontSize(9);
    doc.text('No data to display', cx, cy, { align: 'center' });
    return;
  }

  let startAngle = -90;
  data.forEach((d) => {
    const sweep = (d.value / total) * 360;
    setFill(doc, d.colorHex || COLORS.primary);
    // jsPDF doesn't have a native pie-slice primitive, so approximate each
    // slice with small triangular wedges from the center.
    const steps = Math.max(2, Math.round(sweep / 4));
    const stepAngle = sweep / steps;
    for (let i = 0; i < steps; i++) {
      const a1 = ((startAngle + i * stepAngle) * Math.PI) / 180;
      const a2 = ((startAngle + (i + 1) * stepAngle) * Math.PI) / 180;
      const x1 = cx + r * Math.cos(a1);
      const y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2);
      const y2 = cy + r * Math.sin(a2);
      doc.triangle(cx, cy, x1, y1, x2, y2, 'F');
    }
    startAngle += sweep;
  });

  let ly = legendY;
  data.forEach((d) => {
    const pct = Math.round((d.value / total) * 1000) / 10;
    setFill(doc, d.colorHex || COLORS.primary);
    doc.roundedRect(legendX, ly - 6, 8, 8, 1.5, 1.5, 'F');
    setText(doc, COLORS.text);
    doc.setFontSize(8.5);
    doc.text(`${d.label} — ${d.value} (${pct}%)`, legendX + 13, ly);
    ly += 14;
  });
}

/**
 * Generates and downloads a PDF report with a title, filter summary, a
 * plain-language text summary, a vector bar chart, a vector pie chart with
 * legend, and the underlying data table.
 */
export function generateReportPdf({
  reportTitle,
  filtersText,
  summaryLines = [],
  barData = [],
  barTitle = '',
  barValueSuffix = '',
  pieData = [],
  pieTitle = '',
  tableHeaders = [],
  tableRows = []
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  // Header
  setText(doc, COLORS.text);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Internship Academy — Mentor / HR Portal', margin, y);
  y += 22;
  doc.setFontSize(14);
  doc.text(reportTitle, margin, y);
  y += 16;

  doc.setFont(undefined, 'normal');
  setText(doc, COLORS.muted);
  doc.setFontSize(9.5);
  doc.text(`Generated ${new Date().toLocaleString()}`, margin, y);
  y += 14;
  if (filtersText) {
    doc.text(filtersText, margin, y);
    y += 14;
  }

  // Text summary
  if (summaryLines.length) {
    y += 6;
    setText(doc, COLORS.text);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', margin, y);
    y += 14;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    summaryLines.forEach((line) => {
      doc.text(`•  ${line}`, margin, y);
      y += 14;
    });
  }

  // Charts (bar left, pie right)
  y += 14;
  const chartTop = y;
  const chartHeight = 150;
  const barWidth = (pageW - margin * 2) * 0.55;
  const pieAreaX = margin + barWidth + 30;

  setText(doc, COLORS.text);
  doc.setFontSize(10.5);
  doc.setFont(undefined, 'bold');
  if (barTitle) doc.text(barTitle, margin, chartTop);
  if (pieTitle) doc.text(pieTitle, pieAreaX, chartTop);
  doc.setFont(undefined, 'normal');

  drawBarChart(doc, {
    data: barData,
    x: margin,
    y: chartTop + 14,
    width: barWidth,
    height: chartHeight,
    valueSuffix: barValueSuffix
  });

  drawPieChart(doc, {
    data: pieData,
    cx: pieAreaX + 45,
    cy: chartTop + 14 + 55,
    r: 45,
    legendX: pieAreaX + 100,
    legendY: chartTop + 14 + 20
  });

  y = chartTop + chartHeight + 30;

  // Data table (simple text table, wraps to new page if needed)
  if (tableHeaders.length && tableRows.length) {
    setText(doc, COLORS.text);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Data', margin, y);
    y += 12;

    const colW = (pageW - margin * 2) / tableHeaders.length;
    const rowH = 16;
    const pageBottom = doc.internal.pageSize.getHeight() - 40;

    function drawRow(cells, isHeader) {
      if (y > pageBottom) {
        doc.addPage();
        y = 50;
      }
      doc.setFont(undefined, isHeader ? 'bold' : 'normal');
      setText(doc, isHeader ? COLORS.text : COLORS.text);
      doc.setFontSize(8.5);
      cells.forEach((cell, idx) => {
        const text = String(cell ?? '');
        doc.text(text.length > 22 ? `${text.slice(0, 21)}…` : text, margin + idx * colW, y);
      });
      y += rowH;
      if (isHeader) {
        setDraw(doc, COLORS.border);
        doc.line(margin, y - 10, pageW - margin, y - 10);
      }
    }

    drawRow(tableHeaders, true);
    tableRows.forEach((row) => drawRow(row, false));
  }

  const filename = `${reportTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
  doc.save(filename);
}
