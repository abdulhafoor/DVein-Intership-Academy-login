// Lightweight, dependency-free SVG bar chart. Pure vector output so the same
// geometry can be redrawn 1:1 inside the exported PDF (see src/pdfExport.js).
export default function BarChart({ data, color = 'var(--primary)', height = 240, valueSuffix = '', title }) {
  const W = 640;
  const H = height;
  const padTop = 26;
  const padBottom = 54;
  const padLeft = 10;
  const padRight = 10;
  const chartH = H - padTop - padBottom;
  const chartW = W - padLeft - padRight;

  const maxValue = Math.max(1, ...data.map((d) => d.value));
  const barGap = 14;
  const barW = data.length ? Math.min(56, (chartW - barGap * (data.length - 1)) / data.length) : 0;
  const usedW = data.length * barW + (data.length - 1) * barGap;
  const startX = padLeft + (chartW - usedW) / 2;

  return (
    <div>
      {title && <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>{title}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* baseline */}
        <line x1={padLeft} y1={padTop + chartH} x2={W - padRight} y2={padTop + chartH} stroke="var(--border)" strokeWidth="1.5" />
        {data.map((d, idx) => {
          const barH = maxValue > 0 ? (d.value / maxValue) * chartH : 0;
          const x = startX + idx * (barW + barGap);
          const y = padTop + chartH - barH;
          const label = d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label;
          return (
            <g key={idx}>
              <rect x={x} y={y} width={barW} height={Math.max(barH, 2)} rx="5" fill={d.color || color} />
              <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
                {d.value}{valueSuffix}
              </text>
              <text
                x={x + barW / 2}
                y={padTop + chartH + 18}
                textAnchor="middle"
                fontSize="10.5"
                fill="var(--muted)"
              >
                {label}
              </text>
            </g>
          );
        })}
        {data.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="var(--muted)">No data to display</text>
        )}
      </svg>
    </div>
  );
}
