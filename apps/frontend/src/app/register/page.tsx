'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('learner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      await register(email, password, displayName, role);
    } catch (err: any) {
      setError(err.response?.data?.message || t.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">T</div>
          <span className="auth-brand-text">{t.app_name}</span>
        </div>
        <h1 className="auth-heading">Create account</h1>
        <p className="auth-subtitle">{t.auth.register_subtitle || 'Start your IELTS journey today'}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label className="form-label">{t.auth.display_name}</label>
            <input
              type="text"
              className="form-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t.auth.display_name}
              required
              minLength={2}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label className="form-label">{t.auth.role}</label>
            <select
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="learner">{t.auth.role_learner}</option>
              <option value="instructor">{t.auth.role_instructor}</option>
              <option value="admin">{t.auth.role_admin}</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">{t.auth.email}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">{t.auth.password}</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{t.auth.confirm_password}</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : t.auth.register}
          </button>
        </form>

        <p className="auth-footer-link">
          {t.auth.has_account}{' '}
          <Link href="/login">{t.auth.login}</Link>
        </p>
      </div>

      <p className="auth-page-footer">&copy; 2026 Teachy</p>
    </div>
  );
}
