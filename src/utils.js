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

export function progressColor(done, total) {
  if (done === total) return 'var(--green)';
  if (done / total >= 0.6) return 'var(--orange)';
  return 'var(--red)';
}
