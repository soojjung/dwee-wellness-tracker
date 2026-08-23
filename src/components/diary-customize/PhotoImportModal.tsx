'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import type { StickerRatio } from '@/types';
import type { CameraMode } from './CameraSheet';

interface PhotoImportModalProps {
  file: File;
  onClose: () => void;
  /**
   * Fires with the cropped blob + user-chosen ratio + mode. `mode: 'photo'`
   * means "save as-is"; `mode: 'sticker'` means "run the background
   * removal cutout flow" — the parent decides where to route next.
   */
  onSaved: (blob: Blob, ratio: StickerRatio, mode: CameraMode) => Promise<void> | void;
}

export function PhotoImportModal({ file, onClose, onSaved }: PhotoImportModalProps) {
  const t = useT();
  // Create the blob URL inside an effect (rather than useMemo) so React's
  // StrictMode double-mount can't leave the rendered <img> pointing at a
  // URL that was already revoked by the simulated cleanup. Rendering is
  // gated on `previewUrl` being non-null.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setPreviewUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setPreviewUrl(null);
    };
  }, [file]);

  const [ratio, setRatio] = useState<StickerRatio>('1:1');
  const [mode, setMode] = useState<CameraMode>('photo');
  const [submitting, setSubmitting] = useState(false);

  useBodyScrollLock();
  useEscToClose(onClose);

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const cropped = await cropToRatio(file, ratio);
      if (!cropped) return;
      await onSaved(cropped, ratio, mode);
    } finally {
      setSubmitting(false);
    }
  }

  // "4:3" label maps to portrait 3:4 (Figma preview shows taller frames).
  const aspectRatio = ratio === '1:1' ? '1 / 1' : '3 / 4';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.photoImport.title}
      className="fixed inset-0 z-50 flex flex-col bg-brand-white"
    >
      <header className="flex items-center justify-between px-4 pb-2 pt-safe">
        <span aria-hidden className="h-8 w-8" />
        <h2 className="text-base font-semibold text-brand-gray900">
          {t.report.diary.photoImport.title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.report.diary.photoImport.close}
          disabled={submitting}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        {/* Reserve the tallest ratio's footprint (portrait 3:4) so that
            switching between 1:1 and 4:3 doesn't push the toggle and CTA
            row up/down. The actual preview centers within this box. */}
        <div
          className="flex w-full max-w-xs items-center justify-center"
          style={{ aspectRatio: '3 / 4' }}
        >
          <div
            className="w-full overflow-hidden rounded-lg bg-brand-gray200"
            style={{ aspectRatio }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <RatioToggle value={ratio} onChange={setRatio} />
          <ModeToggle value={mode} onChange={setMode} />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t.report.diary.photoImport.retake}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
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
              {/* Lucide rotate-ccw — full CCW loop, tail in upper-left. */}
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            aria-label={t.report.diary.photoImport.confirm}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink200 text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

interface RatioToggleProps {
  value: StickerRatio;
  onChange: (v: StickerRatio) => void;
}

function RatioToggle({ value, onChange }: RatioToggleProps) {
  const t = useT();
  const is1x1 = value === '1:1';
  return (
    <div className="relative flex items-center gap-2 rounded-full border border-brand-gray200 bg-brand-white p-1">
      <span
        aria-hidden
        className="absolute left-1 top-1 h-8 w-16 rounded-full bg-brand-pink50 transition-transform duration-200 ease-out"
        style={{ transform: is1x1 ? 'translateX(0)' : 'translateX(calc(100% + 0.5rem))' }}
      />
      {/* Both labels always render as semibold gray900 so the button
          footprints stay pixel-identical regardless of selection — only
          the sliding pink pill behind them signals the active option. */}
      <button
        type="button"
        onClick={() => onChange('1:1')}
        aria-pressed={is1x1}
        className="relative z-10 h-8 w-16 rounded-full text-sm font-semibold text-brand-gray900"
      >
        {t.report.diary.photoImport.ratio1x1}
      </button>
      <button
        type="button"
        onClick={() => onChange('4:3')}
        aria-pressed={!is1x1}
        className="relative z-10 h-8 w-16 rounded-full text-sm font-semibold text-brand-gray900"
      >
        {t.report.diary.photoImport.ratio4x3}
      </button>
    </div>
  );
}

interface ModeToggleProps {
  value: CameraMode;
  onChange: (v: CameraMode) => void;
}

function ModeToggle({ value, onChange }: ModeToggleProps) {
  const t = useT();
  const isPhoto = value === 'photo';
  return (
    <div className="relative flex items-center gap-2 rounded-full border border-brand-gray200 bg-brand-white p-1">
      <span
        aria-hidden
        className="absolute left-1 top-1 h-8 w-16 rounded-full bg-brand-pink50 transition-transform duration-200 ease-out"
        style={{ transform: isPhoto ? 'translateX(0)' : 'translateX(calc(100% + 0.5rem))' }}
      />
      <button
        type="button"
        onClick={() => onChange('photo')}
        aria-pressed={isPhoto}
        className="relative z-10 h-8 w-16 rounded-full text-sm font-semibold text-brand-gray900"
      >
        {t.report.diary.photoImport.modePhoto}
      </button>
      <button
        type="button"
        onClick={() => onChange('sticker')}
        aria-pressed={!isPhoto}
        className="relative z-10 h-8 w-16 rounded-full text-sm font-semibold text-brand-gray900"
      >
        {t.report.diary.photoImport.modeCutout}
      </button>
    </div>
  );
}

async function cropToRatio(file: File, ratio: StickerRatio): Promise<Blob | null> {
  const bitmap = await loadImage(file);
  // "4:3" label = portrait 3:4 aspect (width:height = 3:4).
  const targetAspect = ratio === '1:1' ? 1 : 3 / 4;
  const srcAspect = bitmap.width / bitmap.height;
  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;
  if (srcAspect > targetAspect) {
    sw = bitmap.height * targetAspect;
    sx = (bitmap.width - sw) / 2;
  } else {
    sh = bitmap.width / targetAspect;
    sy = (bitmap.height - sh) / 2;
  }
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  return await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92),
  );
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
