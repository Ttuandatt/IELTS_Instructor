'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Breadcrumb placeholder */}
      </div>

      <div className="header-right">
        {/* Language toggle */}
        <button
          className="header-btn"
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          title={lang === 'vi' ? 'English' : 'Tiếng Việt'}
        >
          {lang === 'vi' ? '🇻🇳' : '🇬🇧'}
        </button>

        {/* Theme toggle */}
        <button
          className="header-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* User menu */}
        {user && (
          <button className="header-btn header-btn--logout" onClick={logout}>
            🚪
          </button>
        )}
      </div>
    </header>
  );
}
