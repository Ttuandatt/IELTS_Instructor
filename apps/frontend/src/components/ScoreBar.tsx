'use client';

interface ScoreBarProps {
    label: string;
    score: number | null | undefined;
    maxScore?: number;
}

function getScoreColor(score: number): string {
    if (score >= 7) return '#22c55e';   // green
    if (score >= 5) return '#f59e0b';   // amber
    return '#ef4444';                   // red
}

function getBandLabel(score: number): string {
    if (score >= 8.5) return 'Expert';
    if (score >= 7.5) return 'Very Good';
    if (score >= 6.5) return 'Competent';
    if (score >= 5.5) return 'Modest';
    if (score >= 4.5) return 'Limited';
    return 'Beginner';
}

export default function ScoreBar({ label, score, maxScore = 9 }: ScoreBarProps) {
    const pct = score != null ? (score / maxScore) * 100 : 0;
    const color = score != null ? getScoreColor(score) : '#6b7280';

    return (
        <div className="score-bar-item">
            <div className="score-bar-header">
                <span className="score-bar-label">{label}</span>
                <div className="score-bar-right">
                    {score != null && (
                        <span className="score-bar-band">{getBandLabel(score)}</span>
                    )}
                    <span className="score-bar-value" style={{ color }}>
                        {score != null ? score.toFixed(1) : '—'}
                    </span>
                </div>
            </div>
            <div className="score-bar-track">
                <div
                    className="score-bar-fill"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        transition: 'width 0.8s ease-out',
                    }}
                />
            </div>
        </div>
    );
}
