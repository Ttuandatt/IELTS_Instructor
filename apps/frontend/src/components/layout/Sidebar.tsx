'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import {
  LayoutDashboard, BookOpen, PenLine, School, Users, FileText, ClipboardList,
  Library, Settings, X, type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  badge?: string | number;
}

function getWorkspaceItems(role: string | undefined, t: any): NavItem[] {
  switch (role) {
    case 'admin':
      return [
        { href: '/dashboard', label: t.nav.dashboard, Icon: LayoutDashboard },
        { href: '/admin/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/admin/prompts', label: t.nav.prompts, Icon: FileText },
        { href: '/admin/users', label: t.nav.users, Icon: Users },
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
      ];
    case 'instructor':
      return [
        { href: '/dashboard', label: t.nav.dashboard, Icon: LayoutDashboard },
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
        { href: '/instructor/submissions', label: t.nav.submissions, Icon: ClipboardList },
        { href: '/instructor/learners', label: t.nav.learners, Icon: Users },
        { href: '/instructor/passages', label: t.nav.passages, Icon: BookOpen },
        { href: '/instructor/prompts', label: t.nav.prompts, Icon: FileText },
      ];
    default: // learner
      return [
        { href: '/dashboard', label: t.nav.dashboard, Icon: LayoutDashboard },
        { href: '/library', label: t.nav.library, Icon: Library },
        { href: '/reading', label: t.nav.reading, Icon: BookOpen },
        { href: '/writing', label: t.nav.writing, Icon: PenLine },
        { href: '/classrooms', label: t.nav.classrooms, Icon: School },
      ];
  }
}

interface Props {
  drawerOpen: boolean;
  onCloseDrawer: () => void;
}

export function Sidebar({ drawerOpen, onCloseDrawer }: Props) {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();

  const items = getWorkspaceItems(user?.role, t);
  const initial = user?.display_name?.charAt(0).toUpperCase() || '?';

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const roleLabel = user?.role === 'admin'
    ? t.auth.role_admin
    : user?.role === 'instructor'
      ? t.auth.role_instructor
      : t.auth.role_learner;

  return (
    <aside className={`sidebar ${drawerOpen ? 'is-drawer-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">T</div>
        <div className="sidebar-logo-text">{t.app_name}</div>
        <button
          type="button"
          className="icon-btn sidebar-drawer-close"
          onClick={onCloseDrawer}
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      <div className="sidebar-section-label">{t.nav.workspace}</div>
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-link ${isActive(item.href) ? 'is-active' : ''}`}
          onClick={onCloseDrawer}
        >
          <item.Icon size={16} strokeWidth={1.6} />
          <span className="nav-link-label">{item.label}</span>
          {item.badge != null && <span className="badge">{item.badge}</span>}
        </Link>
      ))}

      <div className="sidebar-section-label" style={{ marginTop: 16 }}>{t.nav.account}</div>
      <Link
        href="/settings"
        className={`nav-link ${isActive('/settings') ? 'is-active' : ''}`}
        onClick={onCloseDrawer}
      >
        <Settings size={16} strokeWidth={1.6} />
        <span className="nav-link-label">{t.nav.settings}</span>
      </Link>

      <div className="sidebar-user">
        <div className="avatar">{initial}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name truncate">{user?.display_name}</div>
          <div className="sidebar-user-role">{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}