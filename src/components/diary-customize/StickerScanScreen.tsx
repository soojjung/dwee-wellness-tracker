'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { removeStickerBackground } from '@/data/services/stickerCutoutService';
import type { StickerCutoutError, SupportedImageMediaType } from '@/types';

interface StickerScanScreenProps {
  /** Captured photo (JPEG/PNG/WebP) sent to the cutout API. */
  blob: Blob;
  /** MIME type reported to the edge function. */
  mediaType: SupportedImageMediaType;
  /** Fires with the transparent PNG once the API responds successfully. */
  onCutoutReady: (png: Blob) => void;
  /** Escape hatch when the API fails — save the raw photo as a
   * source: 'photo' sticker instead. */
  onSaveAsPhoto: () => Promise<void> | void;
  /** Aborts the flow entirely (back to library). */
  onCancel: () => void;
  /** Minimum time the pink sweep stays visible so the screen doesn't
   * flash if the API returns fast. */
  minDisplayMs?: number;
}

/**
 * 013_3 sticker "scan in progress" screen. Overlays a top→bottom pink
 * sweep on the captured photo, kicks off the sticker-cutout edge
 * function, and hands the resulting transparent PNG up to the parent.
 * If the call fails, shows an inline error card with retry /
 * save-as-photo / cancel affordances.
 */
export function StickerScanScreen({
  blob,
  mediaType,
  onCutoutReady,
  onSaveAsPhoto,
  onCancel,
  minDisplayMs = 900,
}: StickerScanScreenProps) {
  const t = useT();
  useBodyScrollLock();

  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => {
      URL.revokeObjectURL(u);
      setUrl(null);
    };
  }, [blob]);

  const [error, setError] = useState<StickerCutoutError | null>(null);
  const [attempt, setAttempt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    const startedAt = performance.now();
    let cancelled = false;

    (async () => {
      const result = await removeStickerBackground({
        blob,
        mediaType,
        signal: controller.signal,
      });
      if (cancelled) return;
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, minDisplayMs - elapsed);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (cancelled) return;
      if (result.ok) {
        onCutoutReady(result.data.blob);
      } else if (result.error !== 'aborted') {
        setError(result.error);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [blob, mediaType, onCutoutReady, minDisplayMs, attempt]);

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
          {!error ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <span className="absolute inset-x-0 top-0 h-1/3 animate-stickerScan bg-gradient-to-b from-transparent via-brand-pink100/70 to-transparent" />
            </span>
          ) : null}
        </div>
      </div>

      {error ? (
        <ScanErrorCard
          error={error}
          onRetry={() => {
            setError(null);
            setAttempt((n) => n + 1);
          }}
          onSaveAsPhoto={onSaveAsPhoto}
          onCancel={onCancel}
        />
      ) : (
        <div className="flex items-center justify-between gap-4 px-6 pb-safe pb-8 pt-6">
          <span aria-hidden className="h-10 w-16" />
          <p className="flex-1 text-center text-sm text-brand-gray800">
            {t.report.diary.scan.progress}
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 w-16 rounded-full text-sm font-medium text-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            {t.report.diary.scan.cancel}
          </button>
        </div>
      )}
    </div>
  );
}

interface ScanErrorCardProps {
  error: StickerCutoutError;
  onRetry: () => void;
  onSaveAsPhoto: () => Promise<void> | void;
  onCancel: () => void;
}

function ScanErrorCard({ error, onRetry, onSaveAsPhoto, onCancel }: ScanErrorCardProps) {
  const t = useT();
  const c = t.report.diary.cutout;
  const [saving, setSaving] = useState(false);

  const body = messageFor(error, c);
  const retryable = error !== 'quota_exceeded' && error !== 'rate_limit_exceeded';

  return (
    <div className="mx-4 mb-safe mb-6 mt-4 rounded-2xl bg-brand-gray50 p-5 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
      <p className="text-sm font-semibold text-brand-gray900">{c.errorTitle}</p>
      <p className="mt-1 text-sm text-brand-gray800">{body}</p>
      <div className="mt-4 flex flex-col gap-2">
        {retryable ? (
          <button
            type="button"
            onClick={onRetry}
            className="h-11 rounded-full bg-brand-pink200 text-sm font-semibold text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800"
          >
            {c.errorRetry}
          </button>
        ) : null}
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSaveAsPhoto();
            } finally {
              setSaving(false);
            }
          }}
          className="h-11 rounded-full bg-brand-gray200 text-sm font-semibold text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
        >
          {c.errorSaveAsPhoto}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 text-sm font-medium text-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          {c.errorCancel}
        </button>
      </div>
    </div>
  );
}

function messageFor(
  error: StickerCutoutError,
  copy: {
    errorNetwork: string;
    errorQuota: string;
    errorRefused: string;
    errorTooLarge: string;
    errorUnknown: string;
  },
): string {
  switch (error) {
    case 'remove_bg_unreachable':
      return copy.errorNetwork;
    case 'quota_exceeded':
    case 'rate_limit_exceeded':
      return copy.errorQuota;
    case 'image_refused':
      return copy.errorRefused;
    case 'image_too_large':
      return copy.errorTooLarge;
    default:
      return copy.errorUnknown;
  }
}
