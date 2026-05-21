'use client';
import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { BottomTabNav } from './BottomTabNav';

export function AppShell({ children }: { children: ReactNode }) {
  const hydrate = useSettingsStore((s) => s.hydrate);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <main className="flex-1 pb-32">{children}</main>
      <BottomTabNav />
    </div>
  );
}
