'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useI18n } from '@/providers/I18nProvider';
import { AvatarDropdown } from './AvatarDropdown';
import { SearchOverlay } from './SearchOverlay';
import {
  Search, Globe, Moon, Sun, Bell, Menu, X,
  BookOpen, PenLine, School, Users, FileText, ClipboardList,
  type LucideIcon,
} from 'lucide-react';

interface NavTab {
  href: string;
  label: string;
  Icon: LucideIcon;
}

function getNavTabs(role: string | undefined, t: any): NavTab[] {
  switch (role) {
    case 'admin':
      return [
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
        { href: '/admin/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/admin/prompts', label: t.nav.prompts, Icon: FileText },
        { href: '/admin/users', label: t.nav.users, Icon: Users },
      ];
    case 'instructor':
      return [
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
        { href: '/instructor/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/instructor/prompts', label: t.nav.prompts, Icon: FileText },
        { href: '/instructor/learners', label: t.nav.learners, Icon: Users },
        { href: '/instructor/submissions', label: t.nav.submissions, Icon: ClipboardList },
      ];
    default: // learner
      return [
        { href: '/reading', label: t.nav.reading, Icon: BookOpen },
        { href: '/writing', label: t.nav.writing, Icon: PenLine },
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
      ];
  }
}

export function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = getNavTabs(user?.role, t);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      <nav className="teachy-navbar">
        {/* Left — Brand */}
        <div className="navbar-left">
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link href="/dashboard" className="navbar-brand">
            <div className="navbar-logo">T</div>
            <span className="navbar-brand-text">{t.app_name}</span>
          </Link>
        </div>

        {/* Center — Navigation Tabs */}
        <div className="navbar-center">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`navbar-tab ${isActive(tab.href) ? 'navbar-tab--active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="navbar-right">
          <button className="navbar-action-btn" onClick={() => setSearchOpen(true)} title="Search (Ctrl+K)">
            <Search size={18} />
          </button>
          <button
            className="navbar-action-btn"
            onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
            title={lang === 'vi' ? 'English' : 'Tieng Viet'}
          >
            <Globe size={18} />
          </button>
          <button className="navbar-action-btn" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="navbar-action-btn" title="Notifications">
            <Bell size={18} />
          </button>
          <AvatarDropdown />
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="navbar-mobile-menu" onClick={e => e.stopPropagation()}>
            {tabs.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`navbar-mobile-link ${isActive(tab.href) ? 'navbar-mobile-link--active' : ''}`}
              >
                <tab.Icon size={20} />
                <span>{tab.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
