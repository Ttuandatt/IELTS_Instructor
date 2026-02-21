'use client';

import { ThemeProvider } from '@/providers/ThemeProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>{children}</I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
