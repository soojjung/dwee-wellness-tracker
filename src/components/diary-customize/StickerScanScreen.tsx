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
  /** Aborts the flow from the error card (back to library). */
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
  // One full sweep of the scan band (see `stickerScan` in tailwind.config)
  // so a fast API response still shows the scan interaction once.
  minDisplayMs = 1400,
}: StickerScanScreenProps) {
  const t = useT();
  useBodyScrollLock();

  // The photo is capped to the free area's height (not just its width) so
  // the whole frame is always on screen and the scan overlay — sized to
  // the <img> box — never sweeps through a clipped-off part of the photo.
  const areaRef = useRef<HTMLDivElement>(null);
  const [areaHeight, setAreaHeight] = useState<number | undefined>(undefined);
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setAreaHeight(entry.contentRect.height);
    });
    observer.observe(el);
    setAreaHeight(el.getBoundingClientRect().height);
    return () => observer.disconnect();
  }, []);

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
      {/* Mobile shell (max-w-md) — matches the rest of the app so the
          photo, error card, and progress footer share the same column
          width on desktop viewports. */}
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        {/* 사진을 영역 바닥에 붙여 아래 문구와의 간격이 pt-6(24px) 로 고정되게
            한다. 가운데 정렬이면 짧은 사진일수록 문구와 멀어져 떠 보였다. */}
        <div
          ref={areaRef}
          className="relative flex min-h-0 flex-1 items-end justify-center overflow-hidden"
        >
          {url ? (
            // Shrink-to-fit wrapper: its box equals the rendered photo, so
            // the absolutely positioned scan overlay is bounded by the photo.
            <div className="relative min-w-0 max-w-full overflow-hidden">
              <img
                src={url}
                alt=""
                aria-hidden
                className="block h-auto w-auto max-w-full object-contain"
                style={{ maxHeight: areaHeight }}
              />
              {!error ? <ScanSweep /> : null}
            </div>
          ) : null}
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
          // No cancel affordance while scanning; the error card still offers one.
          <p className="whitespace-nowrap px-6 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6 text-center text-sm text-brand-gray800">
            {t.report.diary.scan.progress}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Pink scan band that travels down and back up the photo (013_3). The band
 * is a third of the photo's height and the keyframes move it by 200% of
 * itself, so it never leaves the photo. A crisp pink line sits in the
 * middle of a soft tint so the motion reads as a scanner pass rather than
 * a static haze.
 */
function ScanSweep() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute inset-x-0 top-0 flex h-1/3 animate-stickerScan flex-col">
        <span className="flex-1 bg-gradient-to-b from-transparent to-brand-pink100/45" />
        <span className="h-0.5 shrink-0 bg-brand-pink300 shadow-[0_0_12px_2px_rgba(241,88,160,0.55)]" />
        <span className="flex-1 bg-gradient-to-b from-brand-pink100/45 to-transparent" />
      </span>
    </span>
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
    <div className="mb-safe mx-4 mb-6 mt-4 rounded-2xl bg-brand-gray50 p-5 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
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
