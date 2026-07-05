import { useState, useMemo } from 'react';
import { exportReport } from '../api.js';
import { attPct, isEligible, initials } from '../utils.js';

const REPORT_TYPES = [
  { id: 'attendance', label: 'Attendance Report' },
  { id: 'time', label: 'Internship Time Report' },
  { id: 'task', label: 'Task Progress Report' },
  { id: 'performance', label: 'Performance Report' },
  { id: 'batch-summary', label: 'Batch-wise Summary' }
];

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

  function handleGenerate() {
    setGenerated(true);
    showToast(`${REPORT_TYPES.find((r) => r.id === reportType).label} generated`);
  }

  async function handleExport(format) {
    if (!generated) {
      showToast('Generate the report first');
      return;
    }
    await exportReport(reportType, format);
    showToast(`${REPORT_TYPES.find((r) => r.id === reportType).label} exported as ${format}`);
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
          <button className="btn" onClick={() => handleExport('PDF')}>Export PDF</button>
          <button className="btn" onClick={() => handleExport('Excel')}>Export Excel</button>
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
        <div className="panel">
          <div className="panel-head">
            <h3>{REPORT_TYPES.find((r) => r.id === reportType).label} Preview</h3>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{filtered.length} intern(s) included</span>
          </div>

          {reportType === 'attendance' && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Intern</th><th>Department</th><th>Batch</th><th>Working Days</th><th>Days Present</th><th>Attendance %</th></tr></thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id}>
                      <td><div className="intern-cell"><div className="intern-ava">{initials(i.name)}</div><div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div></div></td>
                      <td>{i.dept}</td><td>{i.batch}</td><td>{i.workingDays}</td><td>{i.present}</td>
                      <td>{attPct(i)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'time' && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Intern</th><th>Department</th><th>Batch</th><th>Days Present</th><th>Est. Hours Logged</th></tr></thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id}>
                      <td><div className="intern-cell"><div className="intern-ava">{initials(i.name)}</div><div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div></div></td>
                      <td>{i.dept}</td><td>{i.batch}</td><td>{i.present}</td><td>{i.present * 8} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'task' && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Intern</th><th>Department</th><th>Batch</th><th>Tasks Completed</th><th>Remaining</th></tr></thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id}>
                      <td><div className="intern-cell"><div className="intern-ava">{initials(i.name)}</div><div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div></div></td>
                      <td>{i.dept}</td><td>{i.batch}</td>
                      <td>
                        <span className="mini-bar"><div style={{ width: `${(i.tasksDone / i.tasksTotal) * 100}%`, background: i.tasksDone === i.tasksTotal ? 'var(--green)' : 'var(--orange)' }}></div></span>
                        {i.tasksDone}/{i.tasksTotal}
                      </td>
                      <td>{i.tasksTotal - i.tasksDone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'performance' && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead><tr><th>Intern</th><th>Department</th><th>Attendance</th><th>Tasks</th><th>Assignments</th><th>Overall Score</th></tr></thead>
                <tbody>
                  {filtered.map((i) => {
                    const score = Math.round(
                      (attPct(i) * 0.4 + (i.tasksDone / i.tasksTotal) * 100 * 0.3 + (i.assignDone / i.assignTotal) * 100 * 0.3) * 10
                    ) / 10;
                    return (
                      <tr key={i.id}>
                        <td><div className="intern-cell"><div className="intern-ava">{initials(i.name)}</div><div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div></div></td>
                        <td>{i.dept}</td>
                        <td>{attPct(i)}%</td>
                        <td>{i.tasksDone}/{i.tasksTotal}</td>
                        <td>{i.assignDone}/{i.assignTotal}</td>
                        <td><span className="pill neutral" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{score}%</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'batch-summary' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {batchGroups.map((g) => (
                <div key={`${g.dept}-${g.batch}`} className="stat-card">
                  <div className="lbl" style={{ marginBottom: 6 }}>{g.dept}</div>
                  <div className="val" style={{ fontSize: 17 }}>{g.batch}</div>
                  <div style={{ marginTop: 10, fontSize: 12.5 }}>Interns: <strong>{g.total}</strong></div>
                  <div style={{ fontSize: 12.5 }}>Avg. attendance: <strong>{g.avgAttendance}%</strong></div>
                  <div style={{ fontSize: 12.5 }}>Tasks completed: <strong>{g.tasksDone}/{g.tasksTotal}</strong></div>
                  <div style={{ fontSize: 12.5 }}>Certificate-eligible: <strong>{g.eligible}/{g.total}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
