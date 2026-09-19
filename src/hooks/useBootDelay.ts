'use client';
import { useEffect, useState } from 'react';

/**
 * False until `minMs` have passed since the document started loading.
 * `performance.now()` already counts from that moment, so a later client-side
 * navigation is past the mark and never waits.
 */
export function useBootDelay(minMs: number): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    const remaining = minMs - performance.now();
    if (remaining <= 0) {
      setElapsed(true);
      return;
    }
    const id = setTimeout(() => setElapsed(true), remaining);
    return () => clearTimeout(id);
  }, [minMs]);

  return elapsed;
}
