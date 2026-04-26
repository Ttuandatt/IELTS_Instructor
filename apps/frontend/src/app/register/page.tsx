'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

const FEATURES: [string, string][] = [
  ['A passage, a timer, a quiet desk.', 'Reading tests that feel like the real thing — split view, flagging, review.'],
  ['AI feedback on four bands.', 'Task Response · Coherence · Lexical Resource · Grammatical Range.'],
  ['A classroom, a teacher, a grade.', 'Instructors review, override scores, and leave margin notes.'],
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <aside className="auth-shell-left">
        <div className="cd-row" style={{ gap: 10 }}>
          <div className="sidebar-logo-mark">T</div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 500 }}>
            IELTS <em style={{ fontStyle: 'italic', color: 'var(--primary)' }}>Instructor</em>
          </div>
        </div>

        <div style={{ maxWidth: 420 }}>
          <div className="eyebrow">— A study companion</div>
          <h1 className="auth-hero-title">
            Practice, like the <em>test room</em> is open.
          </h1>
          <p className="auth-hero-copy">
            Thoughtful Reading &amp; Writing practice with AI feedback in minutes — not days.
            Made with the rhythms of real IELTS test conditions in mind.
          </p>

          <div style={{ marginTop: 40, display: 'grid', gap: 14 }}>
            {FEATURES.map(([h, s], i) => (
              <div key={i} className="auth-feature">
                <div className="auth-feature-num">0{i + 1}</div>
                <div>
                  <div className="auth-feature-head">{h}</div>
                  <div className="auth-feature-sub">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="italic-serif" style={{ fontSize: 12, color: 'var(--ink-4)' }}>
          © 2026 · Built for learners in Hanoi &amp; Saigon
        </div>
      </aside>

      <section className="auth-shell-right">
        <div>
          <div className="eyebrow">— New learner</div>
          <h2 className="auth-form-title">
            Open your <em>study desk.</em>
          </h2>

          <form onSubmit={handleSubmit} className="stack" style={{ gap: 14 }}>
            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            <div className="cd-field">
              <label className="cd-field-label">{t.auth.display_name}</label>
              <input
                type="text"
                className="cd-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your full name"
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="cd-field">
              <label className="cd-field-label">{t.auth.email}</label>
              <input
                type="email"
                className="cd-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="cd-field">
              <label className="cd-field-label">{t.auth.password}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="cd-input"
                  style={{ width: '100%', paddingRight: 36 }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 0, cursor: 'pointer',
                    padding: 4, color: 'var(--ink-3)', display: 'grid', placeItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="cd-field-hint">— at least 8 characters.</div>
            </div>

            <div className="cd-field">
              <label className="cd-field-label">{t.auth.confirm_password}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="cd-input"
                  style={{ width: '100%', paddingRight: 36 }}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 0, cursor: 'pointer',
                    padding: 4, color: 'var(--ink-3)', display: 'grid', placeItems: 'center',
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="cd-btn cd-btn-primary cd-btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}
              disabled={loading}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : (
                <>
                  Create account <ArrowRight size={14} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
              {t.auth.has_account}{' '}
              <Link href="/login" style={{ color: 'var(--primary)' }}>
                {t.auth.login}
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
