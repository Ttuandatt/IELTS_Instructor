'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useTheme } from '@/providers/ThemeProvider';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName === user?.display_name) return;
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled by API client
    } finally {
      setSaving(false);
    }
  };

  const handleLangChange = async (newLang: 'vi' | 'en') => {
    setLang(newLang);
    try {
      await updateProfile({ language: newLang });
    } catch {
      // noop
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      await updateProfile({ theme: newTheme });
    } catch {
      // noop
    }
  };

  return (
    <div className="settings-page">
      <h1 className="page-title">{t.nav.settings}</h1>

      {/* Profile */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>

        <div className="settings-row">
          <span className="settings-label">{t.auth.email}</span>
          <span className="settings-value">{user?.email}</span>
        </div>

        <div className="settings-row">
          <span className="settings-label">Role</span>
          <span className="settings-value" style={{ textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </div>

        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
          <label className="form-label">{t.auth.display_name}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              minLength={2}
              maxLength={100}
            />
            <button
              className="settings-btn"
              onClick={handleSaveName}
              disabled={saving}
            >
              {saved ? '✓' : (saving ? '...' : t.common.save)}
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h2 className="settings-section-title">Preferences</h2>

        <div className="settings-row">
          <span className="settings-label">Language</span>
          <select
            className="settings-select"
            value={lang}
            onChange={(e) => handleLangChange(e.target.value as 'vi' | 'en')}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="settings-row">
          <span className="settings-label">Theme</span>
          <select
            className="settings-select"
            value={theme}
            onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
    </div>
  );
}
