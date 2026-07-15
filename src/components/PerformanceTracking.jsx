import { useState, useMemo } from 'react';
import { mockMentorMonthly, monthLabels } from '../data/mockInterns.js';
import { mentorSummaries, reviewTone } from '../utils.js';

// Module 3: Mentor Performance Tracking
// Monitors mentor activity, task handling, and internship coordination
// using a dashboard built from Dashboard Cards, a Task Summary Card,
// Progress Bar, Activity Status Card, Performance Chart and Monthly
// Report Card per mentor.
export default function PerformanceTracking({ interns, tasks }) {
  const [mentorFilter, setMentorFilter] = useState('');

  const summaries = useMemo(() => mentorSummaries(interns, tasks, mockMentorMonthly), [interns, tasks]);
  const mentors = summaries.map((s) => s.mentor);
  const filtered = mentorFilter ? summaries.filter((s) => s.mentor === mentorFilter) : summaries;

  // ---- Dashboard Summary (top-level Dashboard Cards) ----
  const totals = useMemo(() => ({
    mentors: summaries.length,
    totalTasks: summaries.reduce((s, m) => s + m.totalTasks, 0),
    pending: summaries.reduce((s, m) => s + m.pendingTasks, 0),
    completed: summaries.reduce((s, m) => s + m.completedTasks, 0)
  }), [summaries]);

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Mentor Performance Tracking</h1>
          <p>Monitor mentor activity, task handling and internship coordination using a live dashboard.</p>
        </div>
        <div className="head-actions">
          <select value={mentorFilter} onChange={(e) => setMentorFilter(e.target.value)}>
            <option value="">Select Mentor — All</option>
            {mentors.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* DASHBOARD CARDS / DASHBOARD SUMMARY */}
      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>🧑‍🏫</div></div>
          <div className="val">{totals.mentors}</div>
          <div className="lbl">Active Mentors</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>📋</div></div>
          <div className="val">{totals.totalTasks}</div>
          <div className="lbl">Total Tasks Created</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>⏳</div></div>
          <div className="val">{totals.pending}</div>
          <div className="lbl">Pending Tasks</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>✅</div></div>
          <div className="val">{totals.completed}</div>
          <div className="lbl">Completed Tasks</div>
        </div>
      </div>

      {/* PER-MENTOR DASHBOARD */}
      <div className="mentor-grid">
        {filtered.map((m) => {
          const trend = m.trend.length ? m.trend : [0, 0, 0, 0];
          const maxTrend = Math.max(...trend, 1);
          const latest = trend[trend.length - 1];
          const prev = trend.length > 1 ? trend[trend.length - 2] : latest;
          const delta = latest - prev;

          return (
            <div className="panel mentor-card" key={m.mentor}>
              <div className="panel-head">
                <div>
                  <h3>{m.mentor}</h3>
                  <p className="isub">{m.domain} · mentoring {m.internCount} intern{m.internCount !== 1 ? 's' : ''}</p>
                </div>
                <span className={`pill ${reviewTone(m.reviewStatus)}`}>{m.reviewStatus}</span>
              </div>

              {/* TASK SUMMARY CARD */}
              <div className="task-summary-row">
                <div className="task-summary-cell">
                  <div className="val" style={{ fontSize: 18 }}>{m.totalTasks}</div>
                  <div className="lbl">Total Tasks</div>
                </div>
                <div className="task-summary-cell">
                  <div className="val" style={{ fontSize: 18, color: 'var(--red)' }}>{m.pendingTasks}</div>
                  <div className="lbl">Pending</div>
                </div>
                <div className="task-summary-cell">
                  <div className="val" style={{ fontSize: 18, color: 'var(--orange)' }}>{m.inProgressTasks}</div>
                  <div className="lbl">In Progress</div>
                </div>
                <div className="task-summary-cell">
                  <div className="val" style={{ fontSize: 18, color: 'var(--green)' }}>{m.completedTasks}</div>
                  <div className="lbl">Completed</div>
                </div>
              </div>

              {/* INTERNSHIP PROGRESS MONITORING — PROGRESS BAR */}
              <div className="perf-block">
                <div className="perf-block-head"><span>Internship Progress Monitoring</span><strong>{m.avgProgress}%</strong></div>
                <span className="mini-bar" style={{ width: '100%' }}>
                  <div style={{ width: `${m.avgProgress}%`, background: 'var(--primary)' }}></div>
                </span>
              </div>

              {/* ACTIVITY ANALYTICS / ACTIVITY STATUS CARD */}
              <div className="perf-block">
                <div className="perf-block-head"><span>Activity Analytics</span><strong>{m.activityScore} / 100</strong></div>
                <span className="mini-bar" style={{ width: '100%' }}>
                  <div style={{ width: `${m.activityScore}%`, background: m.activityScore >= 75 ? 'var(--green)' : m.activityScore >= 55 ? 'var(--orange)' : 'var(--red)' }}></div>
                </span>
                <p className="isub" style={{ marginTop: 6 }}>
                  Avg. intern attendance {m.avgAttendance}% · task completion rate {m.completionRate}%
                </p>
              </div>

              {/* PERFORMANCE CHART */}
              <div className="perf-block">
                <div className="perf-block-head"><span>Performance Chart</span></div>
                <div className="mini-chart">
                  {trend.map((v, idx) => (
                    <div className="mini-chart-col" key={idx}>
                      <div className="mini-chart-bar" style={{ height: `${(v / maxTrend) * 100}%` }} title={`${monthLabels[idx]}: ${v}`}></div>
                      <span>{monthLabels[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MONTHLY REPORT CARD / MONTHLY PERFORMANCE OVERVIEW */}
              <div className="month-report">
                <strong>Monthly Performance Overview:</strong> {monthLabels[monthLabels.length - 1]} activity score is{' '}
                <strong style={{ color: delta >= 0 ? 'var(--green)' : 'var(--red)' }}>{latest}</strong>{' '}
                ({delta >= 0 ? '+' : ''}{delta} vs. {monthLabels[monthLabels.length - 2] || 'last period'}) — review status{' '}
                <strong>{m.reviewStatus}</strong>.
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
