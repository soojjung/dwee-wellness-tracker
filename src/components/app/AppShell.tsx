'use client';
import type { ReactNode } from 'react';
import { useCoreStoresHydration } from '@/hooks/useCoreStoresHydration';
import { useNotificationSync } from '@/hooks/useNotificationSync';
import { BottomTabNav } from './BottomTabNav';

export function AppShell({ children }: { children: ReactNode }) {
  useCoreStoresHydration();
  useNotificationSync();

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <main className="mx-auto w-full max-w-md flex-1 bg-inherit">{children}</main>
      <BottomTabNav />
    </div>
  );
}
