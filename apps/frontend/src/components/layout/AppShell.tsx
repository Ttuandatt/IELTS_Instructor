'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/forgot-password']);

/** Detect take-test fullscreen routes:
 *  /reading/<id>  and  /writing/<id>  — but NOT /reading/history, /reading/attempts, /writing/history, /writing/submissions, etc.
 */
function isFullscreenTest(pathname: string): boolean {
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length !== 2) return false;
  if (segs[0] !== 'reading' && segs[0] !== 'writing') return false;
  const reservedSecond = new Set(['history', 'attempts', 'submissions']);
  if (reservedSecond.has(segs[1])) return false;
  return true;
}

export function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.has(pathname);
  const isFullscreen = isFullscreenTest(pathname);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // ESC closes drawer + body scroll lock while drawer open
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) router.replace('/login');
    if (user && isPublic && pathname !== '/') router.replace('/dashboard');
  }, [user, loading, isPublic, pathname, router]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
      </div>
    );
  }

  // Public pages — no shell
  if (isPublic) return <>{children}</>;

  if (!user) return null;

  // Take-test fullscreen — bypass shell entirely; page renders its own test-fullscreen layout
  if (isFullscreen) return <>{children}</>;

  // Authenticated — sidebar + topbar shell
  return (
    <div className={`app ${drawerOpen ? 'app--drawer-open' : ''}`}>
      {drawerOpen && (
        <button
          type="button"
          className="sidebar-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        />
      )}
      <Sidebar drawerOpen={drawerOpen} onCloseDrawer={() => setDrawerOpen(false)} />
      <div className="main">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <div className="content">{children}</div>
      </div>
    </div>
  );
}