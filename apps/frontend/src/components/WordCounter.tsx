'use client';

interface WordCounterProps {
    text: string;
    minWords: number;
}

export default function WordCounter({ text, minWords }: WordCounterProps) {
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const isEnough = wordCount >= minWords;
    const pct = Math.min((wordCount / minWords) * 100, 100);

    return (
        <div className="word-counter">
            <div className="word-counter-header">
                <span
                    className={`word-counter-count ${isEnough ? 'sufficient' : 'insufficient'}`}
                >
                    {wordCount} words
                </span>
                <span className="word-counter-min">min {minWords}</span>
            </div>
            <div className="word-counter-track">
                <div
                    className="word-counter-fill"
                    style={{
                        width: `${pct}%`,
                        backgroundColor: isEnough ? '#22c55e' : '#f59e0b',
                        transition: 'width 0.3s ease-out, background-color 0.3s',
                    }}
                />
            </div>
        </div>
    );
}
