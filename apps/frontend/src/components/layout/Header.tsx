'use client';

import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { Moon, Sun, Bell, LogOut, Search, Globe } from 'lucide-react';

export function Header({ children }: { children?: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang } = useI18n();
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        {children}        {/* Search bar */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute', left: '0.85rem',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search courses, lessons..."
            style={{
              padding: '0.6rem 0.85rem 0.6rem 2.5rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              width: '280px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          />
        </div>
      </div>

      <div className="header-right">
        {/* Language toggle */}
        <button
          className="header-btn"
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          title={lang === 'vi' ? 'English' : 'Tiếng Việt'}
        >
          <Globe size={18} />
        </button>

        {/* Theme toggle */}
        <button
          className="header-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notification bell */}
        <button className="header-btn" title="Notifications">
          <Bell size={18} />
        </button>

        {/* User profile pill */}
        {user && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginLeft: '0.5rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            }}>
              {user.display_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const }}>
              <span style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1.2,
              }}>{user.display_name}</span>
              <span style={{
                fontSize: '0.7rem',
                color: 'var(--color-text-muted)',
                textTransform: 'capitalize' as const,
              }}>{user.role}</span>
            </div>
            <button
              className="header-btn"
              onClick={logout}
              title="Logout"
              style={{ marginLeft: '0.25rem', width: 32, height: 32 }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
