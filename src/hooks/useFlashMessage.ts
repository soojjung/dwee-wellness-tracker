'use client';
import { useCallback, useEffect, useState } from 'react';

/** A message that clears itself after `ms` — for a short toast inside a sheet. */
export function useFlashMessage(ms: number): [string | null, (message: string) => void] {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => setMessage(null), ms);
    return () => window.clearTimeout(id);
  }, [message, ms]);

  const flash = useCallback((next: string) => setMessage(next), []);
  return [message, flash];
}
