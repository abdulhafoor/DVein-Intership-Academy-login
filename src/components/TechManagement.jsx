import { useMemo, useState } from 'react';

const inventoryItems = [
  { name: 'Jira', category: 'Software', owner: 'Engineering', status: 'Active', renewal: '2026-09-18' },
  { name: 'MacBook Pro 14', category: 'Hardware', owner: 'Rahul K', status: 'In Use', renewal: '2026-11-02' },
  { name: 'Adobe Creative Cloud', category: 'Software', owner: 'Design Team', status: 'Pending Renewal', renewal: '2026-07-14' },
  { name: 'Zoom Rooms Kit', category: 'Hardware', owner: 'Operations', status: 'Maintenance', renewal: '2026-10-20' }
];

const assetItems = [
  { device: 'Dell Latitude 7420', owner: 'Priya S', status: 'Assigned', health: '95%' },
  { device: 'iPad Air', owner: 'Karthik R', status: 'Repair', health: '68%' },
  { device: 'Surface Pro 9', owner: 'Divya N', status: 'Available', health: '91%' }
];

const maintenanceItems = [
  { task: 'Security patch deployment', due: 'Today', owner: 'IT Ops' },
  { task: 'Laptop firmware update', due: 'Tomorrow', owner: 'Hardware Team' },
  { task: 'License audit review', due: 'Friday', owner: 'Admin' }
];

const analyticsItems = [
  { label: 'Software utilization', value: '84%', color: 'var(--primary)' },
  { label: 'Asset uptime', value: '92%', color: 'var(--green)' },
  { label: 'Renewal risk', value: '18%', color: 'var(--orange)' }
];

export default function TechManagement() {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredInventory = useMemo(() => {
    const q = filter.toLowerCase();
    return inventoryItems.filter((item) => {
      const matchSearch = !q || [item.name, item.category, item.owner].join(' ').toLowerCase().includes(q);
      const matchStatus = !statusFilter || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [filter, statusFilter]);

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Tech Management</h1>
          <p>Track inventory, assets, licenses, updates, and usage insights in one place.</p>
        </div>
        <div className="head-actions">
          <button className="btn blue">+ Add Asset</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>💻</div></div>
          <div className="val">128</div>
          <div className="lbl">Registered Tools</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>📦</div></div>
          <div className="val">94</div>
          <div className="lbl">Active Assets</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>📝</div></div>
          <div className="val">7</div>
          <div className="lbl">Expiring Licenses</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>⚙️</div></div>
          <div className="val">3</div>
          <div className="lbl">Maintenance Tasks</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Technology Inventory</h3>
        </div>
        <div className="filters-row">
          <input type="text" placeholder="Search tools, owners, or category" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="In Use">In Use</option>
            <option value="Pending Renewal">Pending Renewal</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Renewal</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.owner}</td>
                  <td><span className={`pill ${item.status === 'Active' || item.status === 'In Use' ? 'eligible' : 'noteligible'}`}>{item.status}</span></td>
                  <td>{item.renewal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Asset Tracking & License Health</h3>
        </div>
        <div className="quick-grid">
          <div className="quick-card">
            <h3>Current Devices</h3>
            <div style={{ marginTop: 10 }}>
              {assetItems.map((item) => (
                <div key={item.device} className="activity-row" style={{ padding: '8px 0' }}>
                  <div className="aicon">🖥️</div>
                  <div className="atext">
                    <div style={{ fontWeight: 700 }}>{item.device}</div>
                    <div className="isub">{item.owner} • {item.status}</div>
                  </div>
                  <span className="pill eligible">{item.health}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="quick-card">
            <h3>License Management</h3>
            <div style={{ marginTop: 10 }}>
              {['Jira', 'Adobe Creative Cloud', 'Slack'].map((license, index) => (
                <div key={license} className="activity-row" style={{ padding: '8px 0' }}>
                  <div className="aicon">🔐</div>
                  <div className="atext">
                    <div style={{ fontWeight: 700 }}>{license}</div>
                    <div className="isub">{index === 0 ? 'Renewal by Sep 18' : index === 1 ? 'Renewal by Jul 14' : 'Renewal by Aug 02'}</div>
                  </div>
                  <span className={`pill ${index === 1 ? 'noteligible' : 'eligible'}`}>{index === 1 ? 'Risk' : 'On Track'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Maintenance & Updates</h3>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {maintenanceItems.map((item) => (
            <div key={item.task} className="activity-row">
              <div className="aicon">🛠️</div>
              <div className="atext">
                <div style={{ fontWeight: 700 }}>{item.task}</div>
                <div className="isub">Assigned to {item.owner}</div>
              </div>
              <span className="pill eligible">{item.due}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Reports & Analytics</h3>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {analyticsItems.map((item) => (
            <div key={item.label}>
              <div className="row-between" style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{item.label}</span>
                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.value}</span>
              </div>
              <div className="mini-bar" style={{ width: '100%' }}>
                <div style={{ width: item.value, background: item.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
