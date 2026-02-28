'use client';

import { useI18n } from '@/providers/I18nProvider';

interface ModeSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMode: (mode: 'practice' | 'simulation') => void;
}

export function ModeSelectorModal({ isOpen, onClose, onSelectMode }: ModeSelectorModalProps) {
    const { t } = useI18n();

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Choose Test Mode</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Practice Mode Card */}
                    <div
                        className="content-card"
                        style={{ cursor: 'pointer', border: '2px solid transparent' }}
                        onClick={() => onSelectMode('practice')}
                    >
                        <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>📝</div>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Practice Mode</h3>
                        <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                            <li>No time limit</li>
                            <li>Pause and resume anytime</li>
                            <li>Focus on accuracy</li>
                        </ul>
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); onSelectMode('practice'); }}>
                            Start Practice
                        </button>
                    </div>

                    {/* Simulation Mode Card */}
                    <div
                        className="content-card"
                        style={{ cursor: 'pointer', border: '2px solid transparent' }}
                        onClick={() => onSelectMode('simulation')}
                    >
                        <div style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1rem' }}>🎯</div>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Simulation Mode</h3>
                        <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                            <li>Strict 60-minute timer</li>
                            <li>Auto-submits when time is up</li>
                            <li>Simulates actual IELTS test</li>
                        </ul>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={(e) => { e.stopPropagation(); onSelectMode('simulation'); }}>
                            Start Simulation
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button className="btn btn-ghost" onClick={onClose}>
                        ✕ {t.common.cancel}
                    </button>
                </div>
            </div>
        </div>
    );
}
