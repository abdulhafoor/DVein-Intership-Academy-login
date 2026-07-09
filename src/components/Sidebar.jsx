import Icon from '../icons.jsx';
import { moduleList } from '../data/mockInterns.js';

export default function Sidebar({ activeView, onNavigate, onBulkExport }) {
  let lastSection = null;
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="logo-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="lg-title">IMS</div>
          <div className="lg-sub">Mentor / HR Portal</div>
        </div>
      </div>

      <nav className="sb-nav">
        {moduleList.map((m) => {
          const showLabel = m.section !== lastSection;
          lastSection = m.section;
          return (
            <div key={m.id}>
              {showLabel && <div className="sb-section-label">{m.section}</div>}
              <button
                className={`nav-item ${activeView === m.id ? 'active' : ''}`}
                onClick={() => onNavigate(m.id)}
              >
                <span className="ic"><Icon name={m.icon} /></span>
                {m.label}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="sb-upgrade">
        <h4>Need bulk certificate export?</h4>
        <p>Export all eligible certificates as a ZIP for this batch in one click.</p>
        <button onClick={onBulkExport}>Export Batch</button>
      </div>
    </aside>
  );
}
