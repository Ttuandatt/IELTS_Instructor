'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subtitle">{t.auth.login_subtitle || 'Sign in to continue learning'}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label className="form-label">{t.auth.email}</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoFocus
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

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : t.auth.login}
          </button>
        </form>

        <p className="auth-footer-link">
          {t.auth.no_account}{' '}
          <Link href="/register">{t.auth.register}</Link>
        </p>
      </div>

      <p className="auth-page-footer">&copy; 2026 Teachy</p>
    </div>
  );
}
