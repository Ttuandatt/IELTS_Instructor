'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const PUBLIC_PATHS = new Set(['/login', '/register']);

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublic) {
      router.replace('/login');
    }

    if (user && isPublic) {
      router.replace('/dashboard');
    }
  }, [user, loading, isPublic, router]);

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
      </div>
    );
  }

  // Public pages (login, register) — no shell
  if (isPublic) {
    return <>{children}</>;
  }

  // Authenticated layout
  if (!user) return null;

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="app-main">
        <Header>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </Header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
