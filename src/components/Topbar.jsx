import Icon from '../icons.jsx';
import { initials } from '../utils.js';

export default function Topbar({ user, live, onLogout }) {
  const name = user?.name || 'Mentor User';
  const formatted = name.replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="topbar">
      <div className="search-box">
        <Icon name="search" size={15} />
        <input type="text" placeholder="Search interns, modules, reports..." />
      </div>
      <div className="spacer"></div>

      <span className={`conn-pill ${live ? 'live' : 'demo'}`}>
        {live ? '● Backend connected' : '● Demo mode (backend offline)'}
      </span>

      <button className="icon-btn" title="Notifications">
        <Icon name="bell" size={17} />
        <span className="badge-dot"></span>
      </button>

      <div className="profile">
        <div className="avatar">{initials(formatted)}</div>
        <div>
          <div className="pname">{formatted}</div>
          <div className="prole">{user?.role || 'Mentor'}</div>
        </div>
      </div>

      <button className="logout-btn" onClick={onLogout}>Log out</button>
    </div>
  );
}
