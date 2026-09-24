'use client';
import { useEffect, useState } from 'react';
import { splashRemainingMs } from '@/lib/splashClock';

/**
 * False until the splash has been on screen for `minMs` in this document
 * (see `lib/splashClock`). A later client-side navigation is already past the
 * mark and never waits.
 */
export function useBootDelay(minMs: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const remaining = splashRemainingMs(minMs, performance.now());
    if (remaining <= 0) {
      setElapsed(true);
      return;
    }
    const id = setTimeout(() => setElapsed(true), remaining);
    return () => clearTimeout(id);
  }, [minMs]);

  return elapsed;
}
