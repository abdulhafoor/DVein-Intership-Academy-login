import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import Dashboard from './components/Dashboard.jsx';
import LeaveManagement from './components/LeaveManagement.jsx';
import CertificateManagement from './components/CertificateManagement.jsx';
import GenericModule from './components/GenericModule.jsx';
import { fetchInterns, logout as apiLogout } from './api.js';

const BUILT_VIEWS = ['dashboard', 'leave', 'certificate'];

export default function App() {
  const [user, setUser] = useState(null);
  const [live, setLive] = useState(false);
  const [view, setView] = useState('dashboard');
  const [interns, setInterns] = useState([]);
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
          {!BUILT_VIEWS.includes(view) && <GenericModule viewId={view} />}
        </div>
      </div>
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </div>
  );
}
