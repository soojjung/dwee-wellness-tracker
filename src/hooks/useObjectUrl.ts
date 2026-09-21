'use client';
import { useEffect, useState } from 'react';

/**
 * Turns a Blob (a captured/picked photo, a cutout PNG, ...) into an object
 * URL for <img src>. The URL is created inside an effect (rather than
 * useMemo) so React's StrictMode double-mount can't leave the rendered
 * <img> pointing at a URL that was already revoked by the simulated
 * cleanup.
 */
export function useObjectUrl(blob: Blob | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [blob]);

  return url;
}
