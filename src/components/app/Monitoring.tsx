'use client';
import { useEffect } from 'react';
import { initSentry } from '@/lib/monitoring/sentry';

/** Boots crash reporting once per page load, above AuthGuard so the login
 *  and intro screens are covered too. No-op without NEXT_PUBLIC_SENTRY_DSN. */
export function Monitoring() {
  useEffect(() => {
    initSentry();
  }, []);
  return null;
}
