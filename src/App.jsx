import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import LeaveManagement from './components/LeaveManagement.jsx';
import CertificateManagement from './components/CertificateManagement.jsx';
import AttendanceManagement from './components/AttendanceManagement.jsx';
import BatchManagement from './components/BatchManagement.jsx';
import AuthMentorProfile from './components/AuthMentorProfile.jsx';
import ReportGeneration from './components/ReportGeneration.jsx';
import TaskManagement from './components/TaskManagement.jsx';
import AnalyticsInsights from './components/AnalyticsInsights.jsx';
import SessionScheduler from './components/SessionScheduler.jsx';
import AIMentor from './components/AIMentor.jsx';
import AssessmentManagement from './components/AssessmentManagement.jsx';
import Notification from './components/Notification.jsx';
import TechManagement from './components/TechManagement.jsx';
import Announcements from './components/Announcements.jsx';
import PerformanceTracking from './components/PerformanceTracking.jsx';
import GenericModule from './components/GenericModule.jsx';
import { fetchInterns, fetchTasks, logout as apiLogout } from './api.js';

const BUILT_VIEWS = [
  'dashboard', 'leave', 'certificate', 'attendance', 'batch', 'report',
  'task', 'analytics', 'session', 'aimentor', 'assessment', 'notification', 'auth',
  'tech', 'announce', 'performance'
];

export default function App() {
  const [user, setUser] = useState(null);
  const [live, setLive] = useState(false);
  const [view, setView] = useState('dashboard');
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    const t = setTimeout(() => setToastMsg(''), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchInterns().then(({ data, live: internsLive }) => {
      setInterns(data);
      if (!internsLive) setLive(false);
    });
    fetchTasks().then(({ data }) => setTasks(data));
  }, [user]);

  function handleLogin(loggedInUser, loginLive) {
    setUser(loggedInUser);
    setLive(loginLive);
    setView('dashboard');
  }

  function handleLogout() {
    apiLogout();
    setUser(null);
    setInterns([]);
    setTasks([]);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="shell">
      <Sidebar
        activeView={view}
        onNavigate={setView}
        onBulkExport={() => showToast('Bulk export started for eligible interns')}
      />
      <div className="main">
        <Topbar user={user} live={live} onLogout={handleLogout} />
        <div className="content">
          {view === 'dashboard' && <Dashboard interns={interns} user={user} onNavigate={setView} />}
          {view === 'leave' && <LeaveManagement interns={interns} setInterns={setInterns} showToast={showToast} />}
          {view === 'certificate' && <CertificateManagement interns={interns} setInterns={setInterns} showToast={showToast} />}
          {view === 'attendance' && <AttendanceManagement interns={interns} setInterns={setInterns} showToast={showToast} />}
          {view === 'batch' && <BatchManagement interns={interns} setInterns={setInterns} showToast={showToast} />}
          {view === 'report' && <ReportGeneration interns={interns} showToast={showToast} />}
          {view === 'task' && <TaskManagement interns={interns} tasks={tasks} setTasks={setTasks} showToast={showToast} />}
          {view === 'analytics' && <AnalyticsInsights interns={interns} tasks={tasks} />}
          {view === 'session' && <SessionScheduler user={user} onNavigate={setView} />}
          {view === 'aimentor' && <AIMentor user={user} onNavigate={setView} />}
          {view === 'assessment' && <AssessmentManagement showToast={showToast} />}
          {view === 'notification' && <Notification interns={interns} showToast={showToast} />}
          {view === 'auth' && <AuthMentorProfile user={user} setUser={setUser} interns={interns} showToast={showToast} />}
          {view === 'tech' && <TechManagement />}
          {view === 'announce' && <Announcements />}
          {view === 'performance' && <PerformanceTracking interns={interns} tasks={tasks} />}
          {!BUILT_VIEWS.includes(view) && <GenericModule viewId={view} />}
        </div>
      </div>
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}
