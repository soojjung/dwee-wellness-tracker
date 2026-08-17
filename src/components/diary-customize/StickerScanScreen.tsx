'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface StickerScanScreenProps {
  /** Captured photo (JPEG) to preview underneath the sweep bar. */
  blob: Blob;
  /** Fires once the mock scan finishes so the parent can advance to
   * confirm. Kept configurable so a real background-removal API can
   * replace the timeout later without touching this screen. */
  onDone: () => void;
  /** How long the animation runs before `onDone` fires. */
  durationMs?: number;
}

/**
 * 013_3 sticker "scan in progress" screen. Overlays a top→bottom pink
 * sweep on the captured photo + a hint copy. Currently a visual mock —
 * spec 8/9 UI is honored, but no server-side background removal runs.
 */
export function StickerScanScreen({
  blob,
  onDone,
  durationMs = 1400,
}: StickerScanScreenProps) {
  const t = useT();
  useBodyScrollLock();
  // Create the blob URL inside an effect (rather than useMemo) so React's
  // StrictMode double-mount can't leave the rendered <img> pointing at a
  // URL that was already revoked by the simulated cleanup. Rendering is
  // gated on `url` being non-null — no img mounts until the effect has
  // committed with a live URL.
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [blob]);

  useEffect(() => {
    const id = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col bg-brand-white"
    >
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-md overflow-hidden">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              aria-hidden
              className="block h-auto w-full object-contain"
            />
          ) : null}
          {/* Pink sweep bar — the outer div clips the animated child so the
              bar looks like it's traveling inside the photo's bounds. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <span
              className="absolute inset-x-0 top-0 h-1/3 animate-stickerScan bg-gradient-to-b from-transparent via-brand-pink100/70 to-transparent"
            />
          </span>
        </div>
      </div>
      <p className="pb-safe pb-8 pt-6 text-center text-sm text-brand-gray800">
        {t.report.diary.scan.progress}
      </p>
    </div>
  );
}
