import { moduleList } from '../data/mockInterns.js';

export default function GenericModule({ viewId }) {
  const mod = moduleList.find((m) => m.id === viewId);
  const label = mod ? mod.label : 'Module';

  return (
    <section className="view active">
      <div className="soon-wrap">
        <div className="ic-box">🛠️</div>
        <h2>{label}</h2>
        <p>
          The {label} module is part of the full Internship Management System roadmap and will
          plug into this same portal shell and API layer next.
        </p>
        <div className="team-tag">Coming soon</div>
      </div>
    </section>
  );
}
