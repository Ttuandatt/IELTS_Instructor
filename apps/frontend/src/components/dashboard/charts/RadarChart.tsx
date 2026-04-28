'use client';

interface Props {
  scores: number[]; // 4 values: TR, CC, LR, GRA — scale 0-9
  size?: number;
  labels?: string[];
}

export default function RadarChart({
  scores, size = 180, labels = ['TR', 'CC', 'LR', 'GRA'],
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 26;
  const angle = (i: number) => (Math.PI * 2 * i) / labels.length - Math.PI / 2;
  const point = (val: number, i: number): [number, number] => [
    cx + Math.cos(angle(i)) * (r * val / 9),
    cy + Math.sin(angle(i)) * (r * val / 9),
  ];
  const safe = scores.length === labels.length ? scores : labels.map(() => 0);
  const poly = safe.map((v, i) => point(v, i).join(',')).join(' ');
  return (
    <svg width={size} height={size}>
      {[0.33, 0.66, 1].map(t => (
        <polygon
          key={t}
          points={labels
            .map((_, i) => [cx + Math.cos(angle(i)) * r * t, cy + Math.sin(angle(i)) * r * t].join(','))
            .join(' ')}
          fill="none"
          stroke="var(--border)"
        />
      ))}
      <polygon points={poly} fill="var(--primary)" fillOpacity="0.15" stroke="var(--primary)" strokeWidth="1.5" />
      {safe.map((v, i) => {
        const [x, y] = point(v, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--primary)" />;
      })}
      {labels.map((lab, i) => {
        const [x, y] = [cx + Math.cos(angle(i)) * (r + 16), cy + Math.sin(angle(i)) * (r + 16)];
        return (
          <g key={lab}>
            <text
              x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              className="axis-label" style={{ fontWeight: 600, fill: 'var(--ink-2)' }}
            >
              {lab}
            </text>
            <text
              x={x} y={y + 12} textAnchor="middle" dominantBaseline="middle"
              className="axis-label"
            >
              {(safe[i] ?? 0).toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}