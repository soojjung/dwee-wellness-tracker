'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import { CheckIcon24, CloseIcon24 } from '@/components/ui/icons';

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
  const url = useObjectUrl(blob);

  useBodyScrollLock();
  useEscToClose(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-brand-white"
    >
      {/* Mobile shell (max-w-md) so the header, preview, and CTA row all
          share the same column width on desktop viewports. */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-end px-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <button
            type="button"
            onClick={onClose}
            aria-label={c.close}
            className="grid size-10 place-items-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <CloseIcon24 className="h-5 w-5" />
          </button>
        </div>

        <div
          className="mx-4 mt-2 flex flex-1 items-center justify-center rounded-2xl"
          style={{ backgroundImage: CHECKER_BG, backgroundSize: '18px 18px' }}
        >
          {url ? (
            <img src={url} alt="" aria-hidden className="max-h-full max-w-full object-contain" />
          ) : null}
        </div>

        <div className="flex items-center justify-center gap-10 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6">
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
            <CheckIcon24 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Soft gray/white checker to visualize transparency (real cutout will have
// alpha; mock uses opaque photo, but the pattern still signals intent).
const CHECKER_BG =
  'linear-gradient(45deg, #F0EEEF 25%, transparent 25%), linear-gradient(-45deg, #F0EEEF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F0EEEF 75%), linear-gradient(-45deg, transparent 75%, #F0EEEF 75%)';

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
