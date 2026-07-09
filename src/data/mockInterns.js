// Each intern also carries a short attendance history (used by Attendance
// Management's Daily/Weekly/Monthly view and by Report Generation), plus
// logged hours (used by the Internship Time Report).
function buildHistory(pattern) {
  const dates = ['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05'];
  return dates.map((date, idx) => ({ date, status: pattern[idx] || 'present' }));
}

export const mockInterns = [
  { id: 'IA001', name: 'John Doe', dept: 'Web Development', batch: 'Batch A', mentor: 'Yuvashree', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 55, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 412, history: buildHistory(['present','present','present','absent','present','present','present']) },
  { id: 'IA002', name: 'Priya S', dept: 'UI/UX Design', batch: 'Batch A', mentor: 'Kaviya', status: 'leave', leaveType: 'Sick Leave', leaveDate: '2026-07-03', reason: 'Fever', workingDays: 60, present: 45, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 338, history: buildHistory(['present','present','leave','leave','leave','present','leave']) },
  { id: 'IA003', name: 'Rahul K', dept: 'Data Science', batch: 'Batch B', mentor: 'Sridevi', status: 'absent', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 54, tasksTotal: 15, tasksDone: 12, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 401, history: buildHistory(['present','absent','present','present','present','absent','absent']) },
  { id: 'IA004', name: 'Sarah M', dept: 'Cloud Computing', batch: 'Batch B', mentor: 'Dilliraja', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 53, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 396, history: buildHistory(['present','present','present','present','absent','present','present']) },
  { id: 'IA005', name: 'Karthik R', dept: 'Web Development', batch: 'Batch A', mentor: 'Yuvashree', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 58, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 7, certGenerated: false, hoursLogged: 431, history: buildHistory(['present','present','present','present','present','present','present']) },
  { id: 'IA006', name: 'Divya N', dept: 'UI/UX Design', batch: 'Batch A', mentor: 'Kaviya', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 59, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: true, hoursLogged: 440, history: buildHistory(['present','present','present','present','present','present','present']) },
  { id: 'IA007', name: 'Mohammed A', dept: 'Data Science', batch: 'Batch B', mentor: 'Sridevi', status: 'leave', leaveType: 'Casual Leave', leaveDate: '2026-07-04', reason: 'Family function', workingDays: 60, present: 49, tasksTotal: 15, tasksDone: 14, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 365, history: buildHistory(['present','present','present','present','present','present','leave']) },
  { id: 'IA008', name: 'Anjali P', dept: 'Cloud Computing', batch: 'Batch C', mentor: 'Dilliraja', status: 'absent', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 38, tasksTotal: 15, tasksDone: 10, assignTotal: 8, assignDone: 6, certGenerated: false, hoursLogged: 289, history: buildHistory(['absent','present','absent','present','absent','absent','absent']) },
  { id: 'IA009', name: 'Vikram T', dept: 'Web Development', batch: 'Batch C', mentor: 'Yuvashree', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 57, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 425, history: buildHistory(['present','present','present','present','present','present','present']) },
  { id: 'IA010', name: 'Fathima Z', dept: 'Data Science', batch: 'Batch C', mentor: 'Sridevi', status: 'present', leaveType: '-', leaveDate: '', reason: '', workingDays: 60, present: 56, tasksTotal: 15, tasksDone: 15, assignTotal: 8, assignDone: 8, certGenerated: false, hoursLogged: 418, history: buildHistory(['present','present','present','present','present','present','present']) }
];

// Sample historical attendance/leave log — used by the Attendance Management
// module's "Attendance History" view. New entries are appended when staff
// mark an intern as Leave/Absent from the Attendance or Leave modules.
export const mockAttendanceHistory = [
  { internId: 'IA002', name: 'Priya S', dept: 'UI/UX Design', batch: 'Batch A', date: '2026-07-03', status: 'leave', type: 'Sick Leave', reason: 'Fever' },
  { internId: 'IA007', name: 'Mohammed A', dept: 'Data Science', batch: 'Batch B', date: '2026-07-04', status: 'leave', type: 'Casual Leave', reason: 'Family function' },
  { internId: 'IA003', name: 'Rahul K', dept: 'Data Science', batch: 'Batch B', date: '2026-07-02', status: 'absent', type: '-', reason: 'Not informed' },
  { internId: 'IA008', name: 'Anjali P', dept: 'Cloud Computing', batch: 'Batch C', date: '2026-07-01', status: 'absent', type: '-', reason: 'Not informed' },
  { internId: 'IA004', name: 'Sarah M', dept: 'Cloud Computing', batch: 'Batch B', date: '2026-06-30', status: 'leave', type: 'Emergency Leave', reason: 'Personal emergency' }
];

// Sample task data — used by the Task Assignment Management module and by
// Analytics & Insights (Task Completion Summary). Dates are set around the
// current portal date (2026-07-05) so Timeline/Deadline indicators have a
// realistic mix of on-track, due-soon and overdue tasks out of the box.
export const mockTasks = [
  { id: 'TSK-001', title: 'Build responsive landing page', description: 'Implement the marketing landing page using the shared component library and make it fully responsive.', internId: 'IA001', startDate: '2026-06-29', dueDate: '2026-07-06', priority: 'High', status: 'In Progress' },
  { id: 'TSK-002', title: 'Wireframe onboarding flow', description: 'Design low-fidelity wireframes for the new user onboarding journey.', internId: 'IA002', startDate: '2026-06-28', dueDate: '2026-07-04', priority: 'Medium', status: 'Completed' },
  { id: 'TSK-003', title: 'Clean customer churn dataset', description: 'Handle missing values and outliers in the churn dataset ahead of modelling.', internId: 'IA003', startDate: '2026-06-30', dueDate: '2026-07-05', priority: 'High', status: 'Pending' },
  { id: 'TSK-004', title: 'Set up CI/CD pipeline', description: 'Configure automated build and deploy pipeline for the staging environment.', internId: 'IA004', startDate: '2026-06-27', dueDate: '2026-07-03', priority: 'High', status: 'Completed' },
  { id: 'TSK-005', title: 'Implement auth API endpoints', description: 'Build login, logout and refresh-token endpoints with JWT.', internId: 'IA005', startDate: '2026-07-01', dueDate: '2026-07-08', priority: 'High', status: 'In Progress' },
  { id: 'TSK-006', title: 'Design component style guide', description: 'Document colours, typography and spacing tokens for the design system.', internId: 'IA006', startDate: '2026-06-25', dueDate: '2026-07-02', priority: 'Low', status: 'Completed' },
  { id: 'TSK-007', title: 'Train churn prediction model', description: 'Train and evaluate a baseline classification model on the cleaned dataset.', internId: 'IA003', startDate: '2026-07-02', dueDate: '2026-07-09', priority: 'Medium', status: 'Pending' },
  { id: 'TSK-008', title: 'Configure cloud storage buckets', description: 'Set up access-controlled storage buckets for uploaded assets.', internId: 'IA008', startDate: '2026-06-26', dueDate: '2026-07-01', priority: 'Medium', status: 'Pending' },
  { id: 'TSK-009', title: 'Write unit tests for dashboard', description: 'Add unit test coverage for the dashboard summary widgets.', internId: 'IA009', startDate: '2026-06-30', dueDate: '2026-07-07', priority: 'Low', status: 'In Progress' },
  { id: 'TSK-010', title: 'Prepare weekly mentor report', description: 'Summarise weekly progress and blockers for the mentor sync.', internId: 'IA010', startDate: '2026-07-01', dueDate: '2026-07-05', priority: 'Medium', status: 'In Progress' },
  { id: 'TSK-011', title: 'Fix navbar accessibility issues', description: 'Resolve keyboard navigation and ARIA label issues flagged in review.', internId: 'IA001', startDate: '2026-06-24', dueDate: '2026-06-30', priority: 'Low', status: 'Completed' },
  { id: 'TSK-012', title: 'User-test onboarding prototype', description: 'Run 5 usability sessions on the new onboarding prototype.', internId: 'IA002', startDate: '2026-07-03', dueDate: '2026-07-11', priority: 'Medium', status: 'Pending' }
];

// Mentor directory — backs the Auth & Mentor Profile module. Each mentor's
// `name` matches the `mentor` field on mockInterns so "Assigned Interns" can
// be derived by simple lookup. Used as demo-mode fallback data when the
// backend's /mentors endpoints aren't reachable yet.
export const mockMentors = [
  { id: 'MNT001', name: 'Yuvashree', email: 'yuvashree@imsacademy.com', phone: '+91 98765 43210', designation: 'Senior Mentor', department: 'Web Development', domain: 'Web Development', bio: 'Full-stack mentor guiding interns through modern JavaScript, React and backend fundamentals.', skills: ['React', 'Node.js', 'JavaScript', 'REST APIs'], joinDate: '2023-01-15' },
  { id: 'MNT002', name: 'Kaviya', email: 'kaviya@imsacademy.com', phone: '+91 98765 43211', designation: 'Design Mentor', department: 'UI/UX Design', domain: 'UI/UX Design', bio: 'UX researcher and product designer helping interns build user-centred design thinking skills.', skills: ['Figma', 'UI Design', 'User Research', 'Prototyping'], joinDate: '2023-03-02' },
  { id: 'MNT003', name: 'Sridevi', email: 'sridevi@imsacademy.com', phone: '+91 98765 43212', designation: 'Data Science Mentor', department: 'Data Science', domain: 'Data Science', bio: 'Data scientist mentoring interns on Python, statistics and applied machine learning.', skills: ['Python', 'Machine Learning', 'SQL', 'Pandas'], joinDate: '2022-11-20' },
  { id: 'MNT004', name: 'Dilliraja', email: 'dilliraja@imsacademy.com', phone: '+91 98765 43213', designation: 'Cloud Mentor', department: 'Cloud Computing', domain: 'Cloud Computing', bio: 'Cloud infrastructure mentor focused on AWS, DevOps practices and deployment pipelines.', skills: ['AWS', 'Docker', 'CI/CD', 'Linux'], joinDate: '2023-06-10' }
];

export const moduleList = [
  { id: 'dashboard', label: 'Dashboard', section: 'Overview', icon: 'grid' },
  { id: 'leave', label: 'Leave Management', section: 'Overview', icon: 'calendar' },
  { id: 'certificate', label: 'Certificate Management', section: 'Overview', icon: 'award' },

  { id: 'auth', label: 'Auth & Mentor Profile', section: 'Core Modules', icon: 'user' },
  { id: 'batch', label: 'Batch Management', section: 'Core Modules', icon: 'layers' },
  { id: 'tech', label: 'Tech Management', section: 'Core Modules', icon: 'cpu' },
  { id: 'session', label: 'Session Scheduler', section: 'Core Modules', icon: 'clock' },
  { id: 'attendance', label: 'Attendance Management', section: 'Core Modules', icon: 'check' },
  { id: 'task', label: 'Task Assignment', section: 'Core Modules', icon: 'list' },
  { id: 'assessment', label: 'Assessment Management', section: 'Core Modules', icon: 'edit' },
  { id: 'performance', label: 'Performance Tracking', section: 'Core Modules', icon: 'trend' },
  { id: 'project', label: 'Project Monitoring', section: 'Core Modules', icon: 'folder' },

  { id: 'resource', label: 'Resource Library', section: 'Engagement', icon: 'book' },
  { id: 'announce', label: 'Announcement & Communication', section: 'Engagement', icon: 'bell' },
  { id: 'aimentor', label: 'AI Mentor', section: 'Engagement', icon: 'spark' },
  { id: 'report', label: 'Report Generation', section: 'Engagement', icon: 'file' },
  { id: 'analytics', label: 'Analytics & Insights', section: 'Engagement', icon: 'chart' },
  { id: 'notification', label: 'Notification & Reminder', section: 'Engagement', icon: 'alert' },

  { id: 'admin', label: 'Admin & System Settings', section: 'System', icon: 'settings' }
];
