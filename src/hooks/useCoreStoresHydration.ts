'use client';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';

/**
 * 모든 라우트 그룹이 공통으로 필요로 하는 스토어(설정·인증·북마크)를 최초 1회
 * hydrate 한다. AppShell 과 FullscreenShell 이 함께 쓴다 — 풀스크린 라우트만
 * 빠져 있으면 새로고침·딥링크 진입 시 설정(언어·공휴일 나라)이 기본값으로 뜬다.
 */
export function useCoreStoresHydration() {
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
  }, [
    hydrateSettings,
    settingsHydrated,
    hydrateAuth,
    authHydrated,
    hydrateBookmarks,
    bookmarksHydrated,
  ]);
}
