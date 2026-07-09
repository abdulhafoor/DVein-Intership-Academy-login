import { useMemo } from 'react';
import { initials, attPct, isEligible, eligReason, performanceScore, internshipProgressPct } from '../utils.js';

export default function AnalyticsInsights({ interns, tasks }) {
  const totalActive = interns.length;

  const avgAttendance = useMemo(
    () => Math.round((interns.reduce((s, i) => s + attPct(i), 0) / (interns.length || 1)) * 10) / 10,
    [interns]
  );

  const deptAttendance = useMemo(() => {
    const groups = {};
    interns.forEach((i) => {
      if (!groups[i.dept]) groups[i.dept] = { dept: i.dept, total: 0, sum: 0 };
      groups[i.dept].total += 1;
      groups[i.dept].sum += attPct(i);
    });
    return Object.values(groups).map((g) => ({ dept: g.dept, avg: Math.round((g.sum / g.total) * 10) / 10 }));
  }, [interns]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, pct };
  }, [tasks]);

  const avgProgress = useMemo(
    () => Math.round(interns.reduce((s, i) => s + internshipProgressPct(i), 0) / (interns.length || 1)),
    [interns]
  );

  const eligible = interns.filter(isEligible);
  const ineligible = interns.filter((i) => !isEligible(i));
  const eligiblePct = interns.length ? Math.round((eligible.length / interns.length) * 100) : 0;

  const ranked = useMemo(
    () => interns.map((i) => ({ ...i, score: performanceScore(i) })).sort((a, b) => b.score - a.score),
    [interns]
  );

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Analytics &amp; Insights</h1>
          <p>A live snapshot of attendance, task completion, progress and certificate readiness across all interns.</p>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>👥</div></div>
          <div className="val">{totalActive}</div>
          <div className="lbl">Total Active Internships</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>📅</div></div>
          <div className="val">{avgAttendance}%</div>
          <div className="lbl">Avg. Attendance</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>✅</div></div>
          <div className="val">{taskStats.pct}%</div>
          <div className="lbl">Task Completion Rate</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🎓</div></div>
          <div className="val">{eligible.length}</div>
          <div className="lbl">Certificate Eligible</div>
        </div>
      </div>

      {/* STUDENT ATTENDANCE OVERVIEW */}
      <div className="panel">
        <div className="panel-head"><h3>Student Attendance Overview</h3></div>
        <div className="bar-list">
          {deptAttendance.map((g) => (
            <div className="bar-row" key={g.dept}>
              <div className="bar-row-label">{g.dept}</div>
              <div className="mini-bar" style={{ width: '100%', flex: 1, margin: '0 12px' }}>
                <div style={{ width: `${Math.min(g.avg, 100)}%`, background: g.avg >= 80 ? 'var(--green)' : 'var(--red)' }}></div>
              </div>
              <div className="bar-row-value">{g.avg}%</div>
            </div>
          ))}
          {deptAttendance.length === 0 && <div className="empty-note">No attendance data yet.</div>}
        </div>
      </div>

      <div className="split-grid">
        {/* TASK COMPLETION SUMMARY */}
        <div className="panel">
          <div className="panel-head"><h3>Task Completion Summary</h3></div>
          <div className="donut-row">
            <div className="donut" style={{ background: `conic-gradient(var(--green) ${taskStats.pct}%, var(--border) 0)` }}>
              <div className="donut-hole"><strong>{taskStats.pct}%</strong><span>done</span></div>
            </div>
            <div className="donut-legend">
              <div><span className="dot" style={{ background: 'var(--green)' }}></span>Completed — {taskStats.completed}</div>
              <div><span className="dot" style={{ background: 'var(--orange)' }}></span>In Progress — {taskStats.inProgress}</div>
              <div><span className="dot" style={{ background: 'var(--red)' }}></span>Pending — {taskStats.pending}</div>
              <div className="isub" style={{ marginTop: 6 }}>{taskStats.total} tasks tracked in total</div>
            </div>
          </div>
        </div>

        {/* CERTIFICATE ELIGIBILITY SUMMARY */}
        <div className="panel">
          <div className="panel-head"><h3>Certificate Eligibility Summary</h3></div>
          <div className="donut-row">
            <div className="donut" style={{ background: `conic-gradient(var(--purple) ${eligiblePct}%, var(--border) 0)` }}>
              <div className="donut-hole"><strong>{eligiblePct}%</strong><span>eligible</span></div>
            </div>
            <div className="donut-legend">
              <div><span className="dot" style={{ background: 'var(--purple)' }}></span>Eligible — {eligible.length}</div>
              <div><span className="dot" style={{ background: 'var(--border)' }}></span>Not Eligible — {ineligible.length}</div>
            </div>
          </div>
          {ineligible.length > 0 && (
            <div className="ineligible-list">
              {ineligible.slice(0, 4).map((i) => (
                <div className="ineligible-row" key={i.id}>
                  <span className="iname">{i.name}</span>
                  <span className="reason-note" style={{ marginTop: 0 }}>{eligReason(i)}</span>
                </div>
              ))}
              {ineligible.length > 4 && <div className="isub">+{ineligible.length - 4} more not yet eligible</div>}
            </div>
          )}
        </div>
      </div>

      {/* INTERNSHIP PROGRESS SUMMARY */}
      <div className="panel">
        <div className="panel-head"><h3>Internship Progress Summary</h3></div>
        <p className="isub" style={{ marginBottom: 14 }}>Average program completion across all active interns: <strong style={{ color: 'var(--text)' }}>{avgProgress}%</strong></p>
        <div className="bar-list">
          {interns.map((i) => {
            const pct = internshipProgressPct(i);
            return (
              <div className="bar-row" key={i.id}>
                <div className="bar-row-label">
                  <div className="intern-ava" style={{ width: 26, height: 26, fontSize: 10.5 }}>{initials(i.name)}</div>
                  <span style={{ marginLeft: 8 }}>{i.name}</span>
                </div>
                <div className="mini-bar" style={{ width: '100%', flex: 1, margin: '0 12px' }}>
                  <div style={{ width: `${pct}%`, background: 'var(--primary)' }}></div>
                </div>
                <div className="bar-row-value">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OVERALL STUDENT PERFORMANCE */}
      <div className="panel">
        <div className="panel-head"><h3>Overall Student Performance</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Rank</th><th>Intern</th><th>Department</th><th>Attendance</th><th>Tasks</th><th>Performance Score</th></tr>
            </thead>
            <tbody>
              {ranked.map((i, idx) => (
                <tr key={i.id}>
                  <td>#{idx + 1}</td>
                  <td>
                    <div className="intern-cell">
                      <div className="intern-ava">{initials(i.name)}</div>
                      <div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div>
                    </div>
                  </td>
                  <td>{i.dept}</td>
                  <td>{attPct(i)}%</td>
                  <td>{i.tasksDone}/{i.tasksTotal}</td>
                  <td>
                    <span className="mini-bar" style={{ width: 70 }}>
                      <div style={{ width: `${i.score}%`, background: i.score >= 80 ? 'var(--green)' : i.score >= 60 ? 'var(--orange)' : 'var(--red)' }}></div>
                    </span>
                    {i.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
