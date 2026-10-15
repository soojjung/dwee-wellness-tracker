'use client';
import { useCallback, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { captureMessage, flushSentry } from '@/lib/monitoring/sentry';
import { staticPagePath } from '@/lib/navigation/staticPage';

// Local files load in well under this; only a navigation that never settles hits it.
const STUCK_MS = 2000;
const SENTRY_FLUSH_MS = 800;

/**
 * TestFlight R7-8: in the iOS app a tab tap sometimes never navigates until the
 * app is restarted — likely a page-data request iOS dropped while the app was
 * suspended, which Next's router keeps waiting on. If the address hasn't changed
 * `STUCK_MS` after a tap, report it and reopen the tab as a full page load.
 * Web is left alone: a slow network there is just slow, not stuck.
 */
export function useTabNavWatchdog(pathname: string): (href: string) => void {
  const timerRef = useRef<number | null>(null);

  function clear() {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  // Any address change means the navigation landed.
  useEffect(clear, [pathname]);
  useEffect(() => clear, []);

  return useCallback(
    (href: string) => {
      if (!Capacitor.isNativePlatform()) return;
      clear();
      const from = pathname;
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        captureMessage('Tab navigation stuck', {
          level: 'warning',
          tags: { nav_from: from, nav_to: href },
        });
        void flushSentry(SENTRY_FLUSH_MS).finally(() => {
          window.location.assign(staticPagePath(href));
        });
      }, STUCK_MS);
    },
    [pathname],
  );
}
