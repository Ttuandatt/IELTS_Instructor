'use client';

interface Props {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}

export default function Sparkline({
  values, color = 'var(--primary)', width = 120, height = 32,
}: Props) {
  if (!values.length) {
    return (
      <svg width={width} height={height} className="spark" aria-hidden>
        <line
          x1="0" y1={height / 2} x2={width} y2={height / 2}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3"
        />
      </svg>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="spark" aria-hidden>
      <path d={area} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}