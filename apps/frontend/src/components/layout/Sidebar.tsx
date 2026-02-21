'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { href: '/dashboard', icon: '📊', labelKey: 'dashboard' as const },
  { href: '/reading', icon: '📖', labelKey: 'reading' as const },
  { href: '/writing', icon: '✍️', labelKey: 'writing' as const },
  { href: '/settings', icon: '⚙️', labelKey: 'settings' as const },
];

const ADMIN_ITEM = { href: '/admin', icon: '🛡️', labelKey: 'admin' as const };

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();

  const items = user?.role === 'admin' ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

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
