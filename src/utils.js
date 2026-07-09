export function attPct(i) {
  return Math.round((i.present / i.workingDays) * 1000) / 10;
}

export function isEligible(i) {
  return attPct(i) >= 80 && i.tasksDone === i.tasksTotal && i.assignDone === i.assignTotal;
}

export function eligReason(i) {
  const reasons = [];
  if (attPct(i) < 80) reasons.push('Attendance below required 80%');
  if (i.tasksDone < i.tasksTotal) reasons.push('Pending task completion');
  if (i.assignDone < i.assignTotal) reasons.push('Assignment not submitted');
  return reasons.join(' · ');
}

export function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function nextInternId(interns) {
  const nums = interns
    .map((i) => parseInt(String(i.id).replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `IA${String(next).padStart(3, '0')}`;
}

export function progressColor(done, total) {
  if (done === total) return 'var(--green)';
  if (done / total >= 0.6) return 'var(--orange)';
  return 'var(--red)';
}

// ---------------- TASK ASSIGNMENT MANAGEMENT ----------------

// Duration of a task in whole days, spanning Start Date -> Due Date.
export function taskDurationDays(startDate, dueDate) {
  const s = new Date(startDate);
  const d = new Date(dueDate);
  return Math.max(1, Math.round((d - s) / 86400000));
}

// Timeline progress: how far through the Start->Due window "today" falls,
// clamped to 0-100. Used to draw the task's timeline bar.
export function taskTimelinePct(startDate, dueDate, today = new Date()) {
  const s = new Date(startDate).getTime();
  const d = new Date(dueDate).getTime();
  const now = today.getTime();
  if (now <= s) return 0;
  if (now >= d) return 100;
  return Math.round(((now - s) / (d - s)) * 100);
}

// Deadline indicator shown next to each task: days left, due today, or
// overdue by N days. Completed tasks are always shown as Completed.
export function deadlineInfo(dueDate, status, today = new Date()) {
  if (status === 'Completed') return { label: 'Completed', tone: 'green' };
  const todayStr = today.toISOString().slice(0, 10);
  const diffDays = Math.round((new Date(dueDate) - new Date(todayStr)) / 86400000);
  if (diffDays < 0) return { label: `Overdue by ${Math.abs(diffDays)}d`, tone: 'red' };
  if (diffDays === 0) return { label: 'Due today', tone: 'orange' };
  if (diffDays <= 2) return { label: `${diffDays}d left`, tone: 'orange' };
  return { label: `${diffDays}d left`, tone: 'green' };
}

export function priorityTone(priority) {
  if (priority === 'High') return 'red';
  if (priority === 'Medium') return 'orange';
  return 'green';
}

export function statusTone(status) {
  if (status === 'Completed') return 'green';
  if (status === 'In Progress') return 'orange';
  return 'neutral';
}

// ---------------- ANALYTICS & INSIGHTS ----------------

// Composite 0-100 performance score blending attendance, task completion
// and assignment completion, used by the Overall Student Performance view.
export function performanceScore(i) {
  const att = attPct(i);
  const taskPct = i.tasksTotal ? (i.tasksDone / i.tasksTotal) * 100 : 0;
  const assignPct = i.assignTotal ? (i.assignDone / i.assignTotal) * 100 : 0;
  return Math.round(att * 0.4 + taskPct * 0.35 + assignPct * 0.25);
}

// Internship Progress Summary: % of the 60 working-day program elapsed,
// approximated from days attended so far.
export function internshipProgressPct(i) {
  return Math.min(100, Math.round((i.present / i.workingDays) * 100));
}
