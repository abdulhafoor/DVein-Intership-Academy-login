import { useState, useMemo } from 'react';
import { exportReport } from '../api.js';
import { generateReportPdf } from '../pdfExport.js';
import { attPct, isEligible, initials } from '../utils.js';
import BarChart from './charts/BarChart.jsx';
import PieChart from './charts/PieChart.jsx';

const REPORT_TYPES = [
  { id: 'attendance', label: 'Attendance Report' },
  { id: 'time', label: 'Internship Time Report' },
  { id: 'task', label: 'Task Progress Report' },
  { id: 'performance', label: 'Performance Report' },
  { id: 'batch-summary', label: 'Batch-wise Summary' }
];

const C = {
  primary: '#3B6FF3',
  purple: '#8B5CF6',
  green: '#16B981',
  orange: '#F5A623',
  red: '#EF4A5F'
};
const ROTATION = [C.primary, C.purple, C.green, C.orange, C.red];

export default function ReportGeneration({ interns, showToast }) {
  const [domain, setDomain] = useState('');
  const [batch, setBatch] = useState('');
  const [internId, setInternId] = useState('');
  const [reportType, setReportType] = useState('attendance');
  const [generated, setGenerated] = useState(false);

  const domains = useMemo(() => [...new Set(interns.map((i) => i.dept))], [interns]);
  const batches = useMemo(
    () => [...new Set(interns.filter((i) => !domain || i.dept === domain).map((i) => i.batch))],
    [interns, domain]
  );
  const internOptions = interns.filter((i) => (!domain || i.dept === domain) && (!batch || i.batch === batch));

  const filtered = interns.filter((i) => {
    const matchDomain = !domain || i.dept === domain;
    const matchBatch = !batch || i.batch === batch;
    const matchIntern = !internId || i.id === internId;
    return matchDomain && matchBatch && matchIntern;
  });

  const batchGroups = useMemo(() => {
    const groups = {};
    filtered.forEach((i) => {
      const key = `${i.dept} · ${i.batch}`;
      if (!groups[key]) groups[key] = { dept: i.dept, batch: i.batch, total: 0, avgAttendance: 0, tasksDone: 0, tasksTotal: 0, eligible: 0 };
      groups[key].total += 1;
      groups[key].avgAttendance += attPct(i);
      groups[key].tasksDone += i.tasksDone;
      groups[key].tasksTotal += i.tasksTotal;
      groups[key].eligible += isEligible(i) ? 1 : 0;
    });
    return Object.values(groups).map((g) => ({ ...g, avgAttendance: Math.round((g.avgAttendance / g.total) * 10) / 10 }));
  }, [filtered]);

  // Chart data + plain-language text summary for whichever report type is
  // selected. Feeds both the on-screen preview and the exported PDF, so the
  // two always stay in sync.
  const report = useMemo(() => {
    const n = filtered.length || 1;
    const filterBits = [];
    if (domain) filterBits.push(`Domain: ${domain}`);
    if (batch) filterBits.push(`Batch: ${batch}`);
    if (internId) {
      const one = interns.find((i) => i.id === internId);
      if (one) filterBits.push(`Intern: ${one.name} (${one.id})`);
    }
    const filtersText = filterBits.length ? filterBits.join('  ·  ') : 'All domains, batches and interns';

    if (reportType === 'attendance') {
      const avg = Math.round((filtered.reduce((s, i) => s + attPct(i), 0) / n) * 10) / 10;
      const above80 = filtered.filter((i) => attPct(i) >= 80).length;
      const present = filtered.filter((i) => i.status === 'present').length;
      const absent = filtered.filter((i) => i.status === 'absent').length;
      const onLeave = filtered.filter((i) => i.status === 'leave').length;
      return {
        filtersText,
        barTitle: 'Attendance % by Intern',
        barValueSuffix: '%',
        barData: filtered.map((i) => ({ label: i.name, value: attPct(i), color: attPct(i) >= 80 ? C.green : C.red })),
        pieTitle: "Today's Status Breakdown",
        pieData: [
          { label: 'Present', value: present, color: C.green },
          { label: 'Absent', value: absent, color: C.red },
          { label: 'Leave', value: onLeave, color: C.orange }
        ],
        summaryLines: [
          `Average attendance across ${filtered.length} intern(s) is ${isNaN(avg) ? 0 : avg}%.`,
          `${above80} of ${filtered.length} intern(s) meet the 80% attendance threshold.`,
          `Today: ${present} present, ${absent} absent, ${onLeave} on leave.`
        ],
        tableHeaders: ['Intern', 'Department', 'Batch', 'Working Days', 'Days Present', 'Attendance %'],
        tableRows: filtered.map((i) => [i.name, i.dept, i.batch, i.workingDays, i.present, `${attPct(i)}%`])
      };
    }

    if (reportType === 'time') {
      const hours = filtered.map((i) => i.present * 8);
      const totalHours = hours.reduce((a, b) => a + b, 0);
      const avgHours = Math.round((totalHours / n) * 10) / 10;
      const byDept = {};
      filtered.forEach((i) => { byDept[i.dept] = (byDept[i.dept] || 0) + i.present * 8; });
      return {
        filtersText,
        barTitle: 'Hours Logged by Intern',
        barValueSuffix: 'h',
        barData: filtered.map((i) => ({ label: i.name, value: i.present * 8, color: C.primary })),
        pieTitle: 'Hours Logged by Department',
        pieData: Object.entries(byDept).map(([label, value], idx) => ({ label, value, color: ROTATION[idx % ROTATION.length] })),
        summaryLines: [
          `Total hours logged across ${filtered.length} intern(s): ${totalHours} hrs.`,
          `Average hours logged per intern: ${isNaN(avgHours) ? 0 : avgHours} hrs.`
        ],
        tableHeaders: ['Intern', 'Department', 'Batch', 'Days Present', 'Est. Hours Logged'],
        tableRows: filtered.map((i) => [i.name, i.dept, i.batch, i.present, `${i.present * 8} hrs`])
      };
    }

    if (reportType === 'task') {
      const doneSum = filtered.reduce((s, i) => s + i.tasksDone, 0);
      const totalSum = filtered.reduce((s, i) => s + i.tasksTotal, 0);
      const remSum = totalSum - doneSum;
      const fullyDone = filtered.filter((i) => i.tasksDone === i.tasksTotal).length;
      const overallPct = totalSum ? Math.round((doneSum / totalSum) * 100) : 0;
      return {
        filtersText,
        barTitle: 'Task Completion % by Intern',
        barValueSuffix: '%',
        barData: filtered.map((i) => {
          const pct = i.tasksTotal ? Math.round((i.tasksDone / i.tasksTotal) * 100) : 0;
          return { label: i.name, value: pct, color: pct === 100 ? C.green : C.orange };
        }),
        pieTitle: 'Tasks Completed vs Remaining',
        pieData: [
          { label: 'Completed', value: doneSum, color: C.green },
          { label: 'Remaining', value: remSum, color: C.orange }
        ],
        summaryLines: [
          `Overall task completion across the group is ${overallPct}% (${doneSum}/${totalSum} tasks).`,
          `${fullyDone} of ${filtered.length} intern(s) have completed all assigned tasks.`
        ],
        tableHeaders: ['Intern', 'Department', 'Batch', 'Tasks Completed', 'Remaining'],
        tableRows: filtered.map((i) => [i.name, i.dept, i.batch, `${i.tasksDone}/${i.tasksTotal}`, i.tasksTotal - i.tasksDone])
      };
    }

    if (reportType === 'performance') {
      const scored = filtered.map((i) => ({
        i,
        score: Math.round((attPct(i) * 0.4 + (i.tasksDone / i.tasksTotal) * 100 * 0.3 + (i.assignDone / i.assignTotal) * 100 * 0.3) * 10) / 10
      }));
      const avgScore = Math.round((scored.reduce((s, x) => s + x.score, 0) / n) * 10) / 10;
      const top = scored.slice().sort((a, b) => b.score - a.score)[0];
      const bands = { Excellent: 0, Good: 0, Average: 0, 'Needs Improvement': 0 };
      scored.forEach(({ score }) => {
        if (score >= 90) bands.Excellent += 1;
        else if (score >= 75) bands.Good += 1;
        else if (score >= 60) bands.Average += 1;
        else bands['Needs Improvement'] += 1;
      });
      return {
        filtersText,
        barTitle: 'Overall Score by Intern',
        barValueSuffix: '%',
        barData: scored.map(({ i, score }) => ({ label: i.name, value: score, color: score >= 80 ? C.green : score >= 60 ? C.orange : C.red })),
        pieTitle: 'Performance Band Distribution',
        pieData: [
          { label: 'Excellent (90+)', value: bands.Excellent, color: C.green },
          { label: 'Good (75-89)', value: bands.Good, color: C.primary },
          { label: 'Average (60-74)', value: bands.Average, color: C.orange },
          { label: 'Needs Improvement (<60)', value: bands['Needs Improvement'], color: C.red }
        ],
        summaryLines: [
          `Average overall score across ${filtered.length} intern(s) is ${isNaN(avgScore) ? 0 : avgScore}%.`,
          top ? `Top performer: ${top.i.name} (${top.score}%).` : 'No interns in the selected group.'
        ],
        tableHeaders: ['Intern', 'Department', 'Attendance', 'Tasks', 'Assignments', 'Overall Score'],
        tableRows: scored.map(({ i, score }) => [i.name, i.dept, `${attPct(i)}%`, `${i.tasksDone}/${i.tasksTotal}`, `${i.assignDone}/${i.assignTotal}`, `${score}%`])
      };
    }

    // batch-summary
    const groups = batchGroups.filter((g) => (!domain || g.dept === domain) && (!batch || g.batch === batch));
    const totalInterns = groups.reduce((s, g) => s + g.total, 0);
    const best = groups.slice().sort((a, b) => b.avgAttendance - a.avgAttendance)[0];
    return {
      filtersText,
      barTitle: 'Average Attendance % by Batch',
      barValueSuffix: '%',
      barData: groups.map((g, idx) => ({ label: g.batch, value: g.avgAttendance, color: ROTATION[idx % ROTATION.length] })),
      pieTitle: 'Interns per Batch',
      pieData: groups.map((g, idx) => ({ label: g.batch, value: g.total, color: ROTATION[idx % ROTATION.length] })),
      summaryLines: [
        `${groups.length} batch(es) covering ${totalInterns} intern(s) in total.`,
        best ? `Highest average attendance: ${best.batch} (${best.avgAttendance}%).` : 'No batches in the selected group.'
      ],
      tableHeaders: ['Domain', 'Batch', 'Interns', 'Avg Attendance %', 'Tasks Completed', 'Certificate Eligible'],
      tableRows: groups.map((g) => [g.dept, g.batch, g.total, `${g.avgAttendance}%`, `${g.tasksDone}/${g.tasksTotal}`, `${g.eligible}/${g.total}`])
    };
  }, [reportType, filtered, batchGroups, domain, batch, internId, interns]);

  function handleGenerate() {
    setGenerated(true);
    showToast(`${REPORT_TYPES.find((r) => r.id === reportType).label} generated`);
  }

  async function handleExportExcel() {
    if (!generated) {
      showToast('Generate the report first');
      return;
    }
    await exportReport(reportType, 'Excel');
    showToast(`${REPORT_TYPES.find((r) => r.id === reportType).label} exported as Excel`);
  }

  async function handleExportPdf() {
    if (!generated) {
      showToast('Generate the report first');
      return;
    }
    const reportLabel = REPORT_TYPES.find((r) => r.id === reportType).label;
    // Log the export with the backend (falls back silently in demo mode)...
    exportReport(reportType, 'PDF');
    // ...and always produce a real downloadable PDF client-side, complete
    // with the bar chart, pie chart and text summary shown on screen.
    generateReportPdf({
      reportTitle: reportLabel,
      filtersText: report.filtersText,
      summaryLines: report.summaryLines,
      barData: report.barData.map((d) => ({ label: d.label, value: d.value, colorHex: d.color })),
      barTitle: report.barTitle,
      barValueSuffix: report.barValueSuffix,
      pieData: report.pieData.map((d) => ({ label: d.label, value: d.value, colorHex: d.color })),
      pieTitle: report.pieTitle,
      tableHeaders: report.tableHeaders,
      tableRows: report.tableRows
    });
    showToast(`${reportLabel} downloaded as PDF`);
  }

  function handlePrint() {
    if (!generated) {
      showToast('Generate the report first');
      return;
    }
    window.print();
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Report Generation</h1>
          <p>Generate internship reports for individual interns and batches within a selected domain.</p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={handleExportPdf}>Export PDF</button>
          <button className="btn" onClick={handleExportExcel}>Export Excel</button>
          <button className="btn" onClick={handlePrint}>Print Report</button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Report Filters</h3></div>
        <div className="filters-row">
          <select value={domain} onChange={(e) => { setDomain(e.target.value); setInternId(''); setGenerated(false); }}>
            <option value="">Select Domain — All</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={batch} onChange={(e) => { setBatch(e.target.value); setInternId(''); setGenerated(false); }}>
            <option value="">Select Batch — All</option>
            {batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={internId} onChange={(e) => { setInternId(e.target.value); setGenerated(false); }}>
            <option value="">Select Individual Intern — All</option>
            {internOptions.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
          </select>
        </div>

        <div className="filters-row" style={{ marginBottom: 6 }}>
          {REPORT_TYPES.map((r) => (
            <label
              key={r.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 9,
                border: `1.5px solid ${reportType === r.id ? 'var(--primary)' : 'var(--border)'}`,
                background: reportType === r.id ? 'var(--primary-light)' : 'var(--bg)',
                color: reportType === r.id ? 'var(--primary)' : 'var(--text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <input
                type="radio"
                name="reportType"
                value={r.id}
                checked={reportType === r.id}
                onChange={() => { setReportType(r.id); setGenerated(false); }}
                style={{ width: 'auto' }}
              />
              {r.label}
            </label>
          ))}
        </div>

        <button className="btn blue" onClick={handleGenerate} style={{ marginTop: 8 }}>Generate Report</button>
      </div>

      {generated && (
        <>
          <div className="panel">
            <div className="panel-head">
              <h3>{REPORT_TYPES.find((r) => r.id === reportType).label} Preview</h3>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} intern(s) included</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>{report.filtersText}</div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>Summary</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
                {report.summaryLines.map((line, idx) => <li key={idx}>{line}</li>)}
              </ul>
            </div>

            <div className="split-grid" style={{ marginBottom: 8 }}>
              <BarChart data={report.barData} title={report.barTitle} valueSuffix={report.barValueSuffix} />
              <PieChart data={report.pieData} title={report.pieTitle} />
            </div>
          </div>

          <div className="panel">
            <div className="panel-head"><h3>Data</h3></div>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {report.tableHeaders.map((h) => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {report.tableRows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx}>
                          {cIdx === 0 && reportType !== 'batch-summary'
                            ? <div className="intern-cell"><div className="intern-ava">{initials(String(cell))}</div><div className="iname">{cell}</div></div>
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.tableRows.length === 0 && <div className="empty-note">No data for the selected filters.</div>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
