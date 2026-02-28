'use client';

import { useState } from 'react';
import ScoreBar from './ScoreBar';

interface Scores {
    TR: number;
    CC: number;
    LR: number;
    GRA: number;
    overall: number;
}

interface Feedback {
    summary: string;
    strengths: string[];
    improvements: string[];
    suggestions: string;
}

interface FeedbackPanelProps {
    scores: Scores;
    feedback: Feedback;
}

type TabId = 'summary' | 'strengths' | 'improvements' | 'suggestions';

const TABS: { id: TabId; label: string; emoji: string }[] = [
    { id: 'summary', label: 'Summary', emoji: '📝' },
    { id: 'strengths', label: 'Strengths', emoji: '✅' },
    { id: 'improvements', label: 'Improvements', emoji: '⚠️' },
    { id: 'suggestions', label: 'Suggestions', emoji: '💡' },
];

export default function FeedbackPanel({ scores, feedback }: FeedbackPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('summary');

    return (
        <div className="feedback-panel">
            {/* Overall Score */}
            <div className="feedback-overall">
                <div className="feedback-overall-score" style={{
                    color: scores.overall >= 7 ? '#22c55e' : scores.overall >= 5 ? '#f59e0b' : '#ef4444'
                }}>
                    {scores.overall.toFixed(1)}
                </div>
                <div className="feedback-overall-label">Overall Band</div>
            </div>

            {/* 4-Criteria Score Bars */}
            <div className="feedback-scores">
                <ScoreBar label="Task Response" score={scores.TR} />
                <ScoreBar label="Coherence & Cohesion" score={scores.CC} />
                <ScoreBar label="Lexical Resource" score={scores.LR} />
                <ScoreBar label="Grammar Range & Accuracy" score={scores.GRA} />
            </div>

            {/* Tabs */}
            <div className="feedback-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        className={`feedback-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.emoji}</span>
                        <span className="feedback-tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="feedback-tab-content">
                {activeTab === 'summary' && (
                    <p className="feedback-summary">{feedback.summary}</p>
                )}

                {activeTab === 'strengths' && (
                    <ul className="feedback-list feedback-list-strengths">
                        {feedback.strengths.map((s, i) => (
                            <li key={i}>
                                <span className="feedback-list-icon">✅</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'improvements' && (
                    <ul className="feedback-list feedback-list-improvements">
                        {feedback.improvements.map((s, i) => (
                            <li key={i}>
                                <span className="feedback-list-icon">⚠️</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ul>
                )}

                {activeTab === 'suggestions' && (
                    <div className="feedback-suggestions">
                        <p>{feedback.suggestions}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
