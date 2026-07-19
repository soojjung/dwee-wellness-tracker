'use client';
import { useEffect, type ReactNode } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { BottomTabNav } from './BottomTabNav';

export function AppShell({ children }: { children: ReactNode }) {
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const hydrateBookmarks = useBookmarkStore((s) => s.hydrate);
  const bookmarksHydrated = useBookmarkStore((s) => s.hydrated);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
    if (!authHydrated) hydrateAuth();
    if (!bookmarksHydrated) hydrateBookmarks();
  }, [hydrateSettings, settingsHydrated, hydrateAuth, authHydrated, hydrateBookmarks, bookmarksHydrated]);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <main className="mx-auto w-full max-w-md flex-1 pb-32">{children}</main>
      <BottomTabNav />
    </div>
  );
}
