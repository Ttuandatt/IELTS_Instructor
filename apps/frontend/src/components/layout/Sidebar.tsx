'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/providers/I18nProvider';
import { useAuth } from '@/providers/AuthProvider';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  School,
  Settings,
  Users,
  FileText,
  ClipboardList,
  type LucideIcon,
  GraduationCap,
} from 'lucide-react';

type NavKey = 'dashboard' | 'reading' | 'writing' | 'settings' | 'admin' | 'passages' | 'prompts' | 'users' | 'learners' | 'submissions' | 'classrooms';

interface NavItem {
  href: string;
  Icon: LucideIcon;
  labelKey: NavKey;
}

const LEARNER_NAV: NavItem[] = [
  { href: '/dashboard', Icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/reading', Icon: BookOpen, labelKey: 'reading' },
  { href: '/writing', Icon: PenLine, labelKey: 'writing' },
  { href: '/classrooms', Icon: School, labelKey: 'classrooms' },
  { href: '/settings', Icon: Settings, labelKey: 'settings' },
];

const INSTRUCTOR_NAV: NavItem[] = [
  { href: '/dashboard', Icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/classrooms', Icon: School, labelKey: 'classrooms' },
  { href: '/instructor/passages', Icon: BookOpen, labelKey: 'passages' },
  { href: '/instructor/prompts', Icon: FileText, labelKey: 'prompts' },
  { href: '/instructor/learners', Icon: Users, labelKey: 'learners' },
  { href: '/instructor/submissions', Icon: ClipboardList, labelKey: 'submissions' },
  { href: '/settings', Icon: Settings, labelKey: 'settings' },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/dashboard', Icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/classrooms', Icon: School, labelKey: 'classrooms' },
  { href: '/admin/passages', Icon: BookOpen, labelKey: 'passages' },
  { href: '/admin/prompts', Icon: FileText, labelKey: 'prompts' },
  { href: '/admin/users', Icon: Users, labelKey: 'users' },
  { href: '/settings', Icon: Settings, labelKey: 'settings' },
];

function getNavItems(role?: string): NavItem[] {
  switch (role) {
    case 'admin': return ADMIN_NAV;
    case 'instructor': return INSTRUCTOR_NAV;
    default: return LEARNER_NAV;
  }
}

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();

  const items = getNavItems(user?.role);

  return (
    <aside className={clsx('sidebar', collapsed && 'sidebar--collapsed')}>
      <div className="sidebar-logo">
        <Link href="/dashboard" className="sidebar-logo-link">
          <GraduationCap size={28} strokeWidth={2.5} />
          {!collapsed && <span className="sidebar-logo-text">{t.app_name}</span>}
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
              title={collapsed ? t.nav[item.labelKey] : undefined}
            >
              <item.Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              {!collapsed && <span className="sidebar-link-label">{t.nav[item.labelKey]}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.display_name}</span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
