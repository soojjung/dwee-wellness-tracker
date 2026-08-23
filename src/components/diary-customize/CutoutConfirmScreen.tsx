'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

interface CutoutConfirmScreenProps {
  /** Transparent PNG returned by the sticker-cutout edge function. */
  blob: Blob;
  onClose: () => void;
  onRetake: () => void;
  onConfirm: () => void;
}

/**
 * 013_4 — final preview before saving to the sticker library. Shows the
 * cutout PNG on a soft checker background so the transparent areas read
 * as removed.
 */
export function CutoutConfirmScreen({
  blob,
  onClose,
  onRetake,
  onConfirm,
}: CutoutConfirmScreenProps) {
  const t = useT();
  const c = t.report.diary.cutout;
  // Create the blob URL inside an effect (rather than useMemo) so React's
  // StrictMode double-mount can't leave the rendered <img> pointing at a
  // URL that was already revoked by the simulated cleanup.
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [blob]);

  useBodyScrollLock();
  useEscToClose(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-brand-white"
    >
      <div className="flex items-center justify-end px-4 pt-safe pt-4">
        <button
          type="button"
          onClick={onClose}
          aria-label={c.close}
          className="grid size-10 place-items-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <CloseIcon />
        </button>
      </div>

      <div
        className="mx-4 mt-2 flex flex-1 items-center justify-center rounded-2xl"
        style={{ backgroundImage: CHECKER_BG, backgroundSize: '18px 18px' }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            aria-hidden
            className="max-h-full max-w-full object-contain"
          />
        ) : null}
      </div>

      <div className="flex items-center justify-center gap-10 pb-safe pb-8 pt-6">
        <button
          type="button"
          onClick={onRetake}
          aria-label={c.retake}
          className="grid size-12 place-items-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <RetryIcon />
        </button>
        <button
          type="button"
          onClick={onConfirm}
          aria-label={c.confirm}
          className="grid size-12 place-items-center rounded-full bg-brand-pink200 text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800"
        >
          <CheckIcon />
        </button>
      </div>
    </div>
  );
}

// Soft gray/white checker to visualize transparency (real cutout will have
// alpha; mock uses opaque photo, but the pattern still signals intent).
const CHECKER_BG =
  'linear-gradient(45deg, #F0EEEF 25%, transparent 25%), linear-gradient(-45deg, #F0EEEF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F0EEEF 75%), linear-gradient(-45deg, transparent 75%, #F0EEEF 75%)';

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {/* Lucide `rotate-ccw` — full CCW loop with the tail arrow anchored
          in the upper-left. Matches Figma 013_4 retry icon. */}
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
