'use client';
import { useEffect } from 'react';
import { stripIndexHtml } from '@/lib/navigation/staticPage';

/**
 * After a tab is reopened as `/<tab>/index.html` (BottomTabNav's fallback),
 * drop the suffix from the address. The `null` state matters: Next only syncs
 * `usePathname` with a replaceState that doesn't carry its own history state.
 */
export function StaticPageUrlCleanup() {
  useEffect(() => {
    const clean = stripIndexHtml(window.location.pathname);
    if (clean === null) return;
    window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
  }, []);

  return null;
}
