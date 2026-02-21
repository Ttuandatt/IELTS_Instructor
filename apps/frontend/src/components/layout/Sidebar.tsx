'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { clsx } from 'clsx';

type NavKey = 'dashboard' | 'reading' | 'writing' | 'settings' | 'admin' | 'passages' | 'prompts' | 'users' | 'learners' | 'submissions';

interface NavItem {
  href: string;
  icon: string;
  labelKey: NavKey;
}

const LEARNER_NAV: NavItem[] = [
  { href: '/dashboard', icon: '📊', labelKey: 'dashboard' },
  { href: '/reading', icon: '📖', labelKey: 'reading' },
  { href: '/writing', icon: '✍️', labelKey: 'writing' },
  { href: '/settings', icon: '⚙️', labelKey: 'settings' },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { href: '/dashboard', icon: '📊', labelKey: 'dashboard' },
  { href: '/instructor/learners', icon: '👥', labelKey: 'learners' },
  { href: '/instructor/submissions', icon: '📝', labelKey: 'submissions' },
  { href: '/settings', icon: '⚙️', labelKey: 'settings' },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/dashboard', icon: '📊', labelKey: 'dashboard' },
  { href: '/admin/passages', icon: '📖', labelKey: 'passages' },
  { href: '/admin/prompts', icon: '✍️', labelKey: 'prompts' },
  { href: '/admin/users', icon: '👥', labelKey: 'users' },
  { href: '/settings', icon: '⚙️', labelKey: 'settings' },
];

function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'admin': return ADMIN_NAV;
    case 'instructor': return INSTRUCTOR_NAV;
    default: return LEARNER_NAV;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();

  const items = getNavItems(user?.role);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/dashboard" className="sidebar-logo-link">
          <span className="sidebar-logo-icon">🎓</span>
          <span className="sidebar-logo-text">{t.app_name}</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx('sidebar-link', isActive && 'sidebar-link--active')}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{t.nav[item.labelKey]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.display_name}</span>
            <span className="sidebar-user-role">{user?.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
