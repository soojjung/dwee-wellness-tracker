'use client';
import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { BottomTabNav } from './BottomTabNav';

export function AppShell({ children }: { children: ReactNode }) {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
    if (!authHydrated) hydrateAuth();
  }, [hydrateSettings, settingsHydrated, hydrateAuth, authHydrated]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    import('@/dev/seedForPhase').then(({ seedForPhase }) => {
      (window as unknown as { __dweeSeedPhase?: typeof seedForPhase }).__dweeSeedPhase =
        seedForPhase;
    });
    import('@/dev/seedPhotos').then(({ seedPhotos }) => {
      (window as unknown as { __dweeSeedPhotos?: typeof seedPhotos }).__dweeSeedPhotos =
        seedPhotos;
    });
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <main className="flex-1 pb-32">{children}</main>
      <BottomTabNav />
    </div>
  );
}
