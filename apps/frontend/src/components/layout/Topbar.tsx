'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';
import { Search, Bell, Moon, Sun, Globe, Menu } from 'lucide-react';
import { AvatarDropdown } from './AvatarDropdown';
import { SearchOverlay } from './SearchOverlay';

interface Props {
  onOpenDrawer: () => void;
  right?: ReactNode;
}

function buildBreadcrumb(pathname: string, t: any): string[] {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length === 0) return [t.nav.dashboard];
  const map: Record<string, string> = {
    dashboard: t.nav.dashboard,
    reading: t.nav.reading,
    writing: t.nav.writing,
    library: t.nav.library,
    classrooms: t.nav.classrooms,
    settings: t.nav.settings,
    admin: t.nav.admin,
    instructor: t.instructor?.title || 'Instructor',
    passages: t.nav.passages,
    prompts: t.nav.prompts,
    users: t.nav.users,
    learners: t.nav.learners,
    submissions: t.nav.submissions,
    history: t.test?.review || 'History',
    attempts: t.test?.review || 'Attempts',
  };
  const out = segs.slice(0, 3).map(s => {
    if (map[s]) return map[s];
    if (s.length > 16) return s.slice(0, 8) + '…';
    return s;
  });
  return [t.nav.workspace, ...out];
}

export function Topbar({ onOpenDrawer, right }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  const crumbs = buildBreadcrumb(pathname, t);

  return (
    <>
      <div className="topbar">
        <button
          type="button"
          className="icon-btn topbar-hamburger"
          onClick={onOpenDrawer}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="breadcrumb">
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', gap: 8 }}>
              {i > 0 && <span className="sep">/</span>}
              <span className={i === crumbs.length - 1 ? 'current' : ''}>{c}</span>
            </span>
          ))}
        </div>

        <button
          type="button"
          className="topbar-search"
          style={{ marginLeft: 20 }}
          onClick={() => setSearchOpen(true)}
        >
          <Search size={14} />
          <span style={{ flex: 1, textAlign: 'left' }}>{t.common.search}…</span>
          <kbd>⌘K</kbd>
        </button>

        <div className="topbar-actions">
          {right}
          <button
            className="icon-btn"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            title={lang === 'vi' ? 'English' : 'Tiếng Việt'}
            aria-label="Toggle language"
          >
            <Globe size={15} />
          </button>
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          <button className="icon-btn" title="Notifications" aria-label="Notifications">
            <Bell size={15} />
            <span className="dot" />
          </button>
          <AvatarDropdown />
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}