'use client';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import type { StickerRatio } from '@/types';

interface PhotoImportModalProps {
  file: File;
  onClose: () => void;
  onSaved: (blob: Blob, ratio: StickerRatio) => Promise<void> | void;
}

export function PhotoImportModal({ file, onClose, onSaved }: PhotoImportModalProps) {
  const t = useT();
  const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const [ratio, setRatio] = useState<StickerRatio>('1:1');
  const [submitting, setSubmitting] = useState(false);

  useBodyScrollLock();
  useEscToClose(onClose);

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const cropped = await cropToRatio(file, ratio);
      if (!cropped) return;
      await onSaved(cropped, ratio);
    } finally {
      setSubmitting(false);
    }
  }

  const aspectRatio = ratio === '1:1' ? '1 / 1' : '4 / 3';

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
        <div
          className="w-full max-w-xs overflow-hidden rounded-lg bg-brand-gray200"
          style={{ aspectRatio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>

        <RatioToggle value={ratio} onChange={setRatio} />

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={t.report.diary.photoImport.retake}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
              <path
                d="M3 9a6 6 0 1010-4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M13 1v3.5H9.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            aria-label={t.report.diary.photoImport.confirm}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink300 text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                d="M3 9l4 4 8-10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
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
    <div className="relative flex items-center gap-2 rounded-full bg-brand-gray200 p-1">
      <span
        aria-hidden
        className="absolute top-1 h-8 w-16 rounded-full bg-brand-pink50 transition-transform duration-200 ease-out"
        style={{ transform: is1x1 ? 'translateX(0)' : 'translateX(64px)' }}
      />
      <button
        type="button"
        onClick={() => onChange('1:1')}
        aria-pressed={is1x1}
        className={
          'relative z-10 h-8 w-16 rounded-full text-sm font-medium ' +
          (is1x1 ? 'text-brand-pink800' : 'text-brand-gray700')
        }
      >
        {t.report.diary.photoImport.ratio1x1}
      </button>
      <button
        type="button"
        onClick={() => onChange('4:3')}
        aria-pressed={!is1x1}
        className={
          'relative z-10 h-8 w-16 rounded-full text-sm font-medium ' +
          (!is1x1 ? 'text-brand-pink800' : 'text-brand-gray700')
        }
      >
        {t.report.diary.photoImport.ratio4x3}
      </button>
    </div>
  );
}

async function cropToRatio(file: File, ratio: StickerRatio): Promise<Blob | null> {
  const bitmap = await loadImage(file);
  const targetAspect = ratio === '1:1' ? 1 : 4 / 3;
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
