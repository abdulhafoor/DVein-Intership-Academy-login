// Lightweight, dependency-free SVG pie chart with a legend. Pure vector
// output so the same slice geometry can be redrawn 1:1 inside the exported
// PDF (see src/pdfExport.js -> drawPieChart).
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function buildPieSlices(data, cx, cy, r) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let angle = 0;
  return data.map((d) => {
    const sliceAngle = (d.value / total) * 360;
    const start = polarToCartesian(cx, cy, r, angle);
    const end = polarToCartesian(cx, cy, r, angle + sliceAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path =
      sliceAngle >= 359.99
        ? `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`
        : `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    const pct = Math.round((d.value / total) * 1000) / 10;
    const slice = { ...d, path, pct };
    angle += sliceAngle;
    return slice;
  });
}

export default function PieChart({ data, title, size = 190 }) {
  const r = 80;
  const cx = 95;
  const cy = 95;
  const slices = buildPieSlices(data, cx, cy, r);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      {title && <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>{title}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, flexWrap: 'wrap' }}>
        <svg viewBox="0 0 190 190" width={size} height={size} style={{ flexShrink: 0 }}>
          {total === 0
            ? <circle cx={cx} cy={cy} r={r} fill="var(--border)" />
            : slices.map((s, idx) => <path key={idx} d={s.path} fill={s.color} stroke="var(--card)" strokeWidth="2" />)}
        </svg>
        <div className="donut-legend">
          {slices.map((s, idx) => (
            <div key={idx}>
              <span className="dot" style={{ background: s.color }}></span>
              {s.label} — <strong>{s.value}</strong> ({s.pct}%)
            </div>
          ))}
          {total === 0 && <div style={{ color: 'var(--muted)' }}>No data to display</div>}
        </div>
      </div>
    </div>
  );
}
