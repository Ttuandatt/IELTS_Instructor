'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Navbar } from './Navbar';
import { IconSidebar } from './IconSidebar';

const PUBLIC_PATHS = new Set(['/', '/login', '/register']);

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
      </div>
    );
  }

  // Public pages — no shell
  if (isPublic) {
    return <>{children}</>;
  }

  // Authenticated layout — hybrid navbar + icon sidebar
  if (!user) return null;

  return (
    <div className="app-layout-hybrid">
      <Navbar />
      <IconSidebar />
      <main className="app-content-hybrid">{children}</main>
    </div>
  );
}
