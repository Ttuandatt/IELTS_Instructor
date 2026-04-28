'use client';

export type WeekRow = {
  week_start: string;
  reading_avg_score: number | null;
  writing_avg_overall: number | null;
  submission_count: number;
};

interface Props {
  data: WeekRow[];
  height?: number;
  emptyLabel?: string;
}

export default function BarChart({ data, height = 200, emptyLabel = 'No data yet' }: Props) {
  const width = 560;
  if (!data.length) {
    return (
      <div className="ph" style={{ height: height + 30 }}>{emptyLabel}</div>
    );
  }
  const readingVals = data.map(d => d.reading_avg_score ?? 0);
  // Writing band 0-9 → multiply ×10 to share scale with reading 0-100
  const writingVals = data.map(d => (d.writing_avg_overall ?? 0) * 10);
  const max = Math.max(100, ...readingVals, ...writingVals);
  const step = width / data.length;
  const barW = step * 0.3;
  const gap = step * 0.1;
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height + 30}`} preserveAspectRatio="xMidYMid meet">
      {[0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1="0" x2={width} y1={height - height * t} y2={height - height * t}
          stroke="var(--border)" strokeDasharray="2 3" />
      ))}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <text key={'l' + t} x="0" y={height - height * t - 4} className="axis-label">
          {Math.round(max * t)}
        </text>
      ))}
      {data.map((d, i) => {
        const x = i * step + step / 2;
        const rh = ((d.reading_avg_score ?? 0) / max) * (height - 10);
        const wh = (((d.writing_avg_overall ?? 0) * 10) / max) * (height - 10);
        const label = new Date(d.week_start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        return (
          <g key={i}>
            <rect x={x - barW - gap / 2} y={height - rh} width={barW} height={rh} fill="var(--primary)" rx="2" />
            <rect x={x + gap / 2} y={height - wh} width={barW} height={wh} fill="var(--primary)" opacity="0.35" rx="2" />
            <text x={x} y={height + 14} textAnchor="middle" className="axis-label">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}