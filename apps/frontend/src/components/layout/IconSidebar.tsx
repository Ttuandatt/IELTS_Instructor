'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useI18n } from '@/providers/I18nProvider';
import {
  LayoutDashboard, BookOpen, PenLine, School, Users,
  FileText, ClipboardList, type LucideIcon,
} from 'lucide-react';

interface SidebarItem {
  href: string;
  Icon: LucideIcon;
  label: string;
}

function getSidebarItems(role: string | undefined, t: any): SidebarItem[] {
  switch (role) {
    case 'admin':
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
        { href: '/admin/passages', Icon: BookOpen, label: t.nav.passages },
        { href: '/admin/prompts', Icon: FileText, label: t.nav.prompts },
        { href: '/admin/users', Icon: Users, label: t.nav.users },
      ];
    case 'instructor':
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
        { href: '/instructor/passages', Icon: BookOpen, label: t.nav.passages },
        { href: '/instructor/prompts', Icon: FileText, label: t.nav.prompts },
        { href: '/instructor/learners', Icon: Users, label: t.nav.learners },
        { href: '/instructor/submissions', Icon: ClipboardList, label: t.nav.submissions },
      ];
    default: // learner
      return [
        { href: '/dashboard', Icon: LayoutDashboard, label: t.nav.dashboard },
        { href: '/reading', Icon: BookOpen, label: t.nav.reading },
        { href: '/writing', Icon: PenLine, label: t.nav.writing },
        { href: '/classrooms', Icon: School, label: t.nav.classrooms },
      ];
  }
}

export function IconSidebar() {
  const { user } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const items = getSidebarItems(user?.role, t);

  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      setIsTouchDevice(true);
    } else {
      setExpanded(true);
    }
  }, []);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') {
      setExpanded(false);
    }
  }, []);

  const handleClick = useCallback(() => {
    if (isTouchDevice) {
      setExpanded(prev => !prev);
    }
  }, [isTouchDevice]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  const initial = user?.display_name?.charAt(0).toUpperCase() || '?';

  return (
    <aside
      className={`icon-sidebar ${expanded ? 'icon-sidebar--expanded' : ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <nav className="icon-sidebar-nav">
        {items.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`icon-sidebar-link ${active ? 'icon-sidebar-link--active' : ''}`}
              title={!expanded ? item.label : undefined}
            >
              <item.Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {expanded && <span className="icon-sidebar-label">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="icon-sidebar-footer">
        <div className="icon-sidebar-avatar">{initial}</div>
        {expanded && (
          <div className="icon-sidebar-user-info">
            <span className="icon-sidebar-user-name">{user?.display_name}</span>
            <span className="icon-sidebar-user-role">{user?.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
