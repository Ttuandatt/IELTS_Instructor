'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { ChevronDown, Settings, LogOut } from 'lucide-react';

export function AvatarDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initial = user.display_name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="avatar-dropdown" ref={ref}>
      <button
        className="avatar-dropdown-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="avatar-circle">{initial}</div>
        <span className="avatar-name">{user.display_name}</span>
        <ChevronDown size={14} className={`avatar-chevron ${open ? 'avatar-chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="avatar-dropdown-menu">
          <Link
            href="/settings"
            className="avatar-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <Settings size={16} />
            <span>Settings</span>
          </Link>
          <button
            className="avatar-dropdown-item"
            onClick={() => { setOpen(false); logout(); }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
