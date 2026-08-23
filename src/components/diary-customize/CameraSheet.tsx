'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { cn } from '@/lib/cn';
import type { StickerRatio } from '@/types';

export type CameraMode = 'photo' | 'sticker';

export interface CameraCapture {
  /** Cropped, oriented JPEG blob at the selected aspect ratio. */
  blob: Blob;
  ratio: StickerRatio;
  mode: CameraMode;
}

interface CameraSheetProps {
  onClose: () => void;
  onOpenAlbum: () => void;
  onCapture: (capture: CameraCapture) => void;
}

type Facing = 'user' | 'environment';
type FatalError = 'permission' | 'unavailable';

const RATIO_ORDER: readonly StickerRatio[] = ['1:1', '4:3'];
const MODE_ORDER: readonly CameraMode[] = ['photo', 'sticker'];

/**
 * In-app camera (013_2). Live MediaDevices preview + shutter + flip.
 * Bottom pill toggles capture MODE (photo vs sticker) — the parent
 * branches: 'photo' saves the raw JPEG directly, 'sticker' runs it
 * through the sticker-cutout edge function (remove.bg). Top pill toggles
 * the aspect RATIO (1:1 / 4:3) which clips the captured frame before
 * returning to the parent.
 *
 * Rendered as an overlay above DiaryCustomizeScreen — no route change, so
 * the sticker draft state stays intact if the user backs out.
 */
export function CameraSheet({ onClose, onOpenAlbum, onCapture }: CameraSheetProps) {
  const t = useT();
  const c = t.report.diary.camera;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [mode, setMode] = useState<CameraMode>('sticker');
  const [ratio, setRatio] = useState<StickerRatio>('1:1');
  const [error, setError] = useState<FatalError | null>(null);
  const [starting, setStarting] = useState(true);

  useBodyScrollLock();
  useEscToClose(onClose);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const start = useCallback(
    async (nextFacing: Facing) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setError('unavailable');
        setStarting(false);
        return;
      }
      setStarting(true);
      setError(null);
      stopStream();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: nextFacing } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch (e) {
        const name = (e as { name?: string }).name;
        setError(name === 'NotAllowedError' ? 'permission' : 'unavailable');
      } finally {
        setStarting(false);
      }
    },
    [stopStream],
  );

  useEffect(() => {
    void start(facing);
    return () => stopStream();
    // Facing changes go through `handleFlip` (which calls `start`) so we
    // deliberately exclude it here — otherwise every state update rerun.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFlip() {
    const next: Facing = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    void start(next);
  }

  function handleShutter() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const capture = grabFrame(video, ratio);
    if (!capture) return;
    capture
      .then((blob) => {
        stopStream();
        onCapture({ blob, ratio, mode });
      })
      .catch(() => undefined);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-brand-gray900 text-brand-white"
    >
      {/* Live preview area — the video fills the space and is aspect-cropped
          on capture. The visible preview intentionally isn't clipped so the
          user can compose within the framing marks below. */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <p className="text-base leading-[1.5] text-brand-gray200">
              {error === 'permission' ? c.permissionDenied : c.unavailable}
            </p>
            <button
              type="button"
              onClick={onOpenAlbum}
              className="rounded-full bg-brand-pink200 px-5 py-2 text-sm font-semibold text-brand-white"
            >
              {c.openAlbumFallback}
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={cn(
              'h-full w-full object-cover',
              starting && 'opacity-0',
              facing === 'user' && 'scale-x-[-1]',
            )}
          />
        )}

        {/* Close (top-right) */}
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          aria-label={c.close}
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-brand-gray900/60 text-brand-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white"
        >
          <CloseIcon />
        </button>

        {/* Ratio pill (top-left) — spec 13 */}
        {!error ? (
          <div className="absolute left-4 top-4">
            <SlidingPill<StickerRatio>
              options={RATIO_ORDER}
              value={ratio}
              onChange={setRatio}
              renderLabel={(v) => (v === '1:1' ? c.ratio1x1 : c.ratio4x3)}
              variant="light"
            />
          </div>
        ) : null}
      </div>

      {/* Control bar */}
      <div className="flex flex-col items-center gap-5 bg-brand-gray900 pb-safe pt-6">
        <div className="flex w-full items-center justify-around px-6">
          <button
            type="button"
            onClick={onOpenAlbum}
            aria-label={c.openAlbum}
            className="grid size-10 place-items-center rounded-full bg-brand-gray800 text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white"
          >
            <AlbumIcon />
          </button>

          <button
            type="button"
            onClick={handleShutter}
            disabled={!!error || starting}
            aria-label={c.shutter}
            className="grid size-16 place-items-center rounded-full bg-brand-pink200 shadow-[0_0_0_4px_rgba(255,255,255,0.85)] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white active:scale-95 disabled:opacity-50"
          >
            <span className="size-12 rounded-full bg-brand-pink100" />
          </button>

          <button
            type="button"
            onClick={handleFlip}
            disabled={!!error || starting}
            aria-label={c.flip}
            className="grid size-10 place-items-center rounded-full bg-brand-gray800 text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white disabled:opacity-50"
          >
            <FlipIcon />
          </button>
        </div>

        {/* Mode toggle (spec 7) */}
        <SlidingPill<CameraMode>
          options={MODE_ORDER}
          value={mode}
          onChange={setMode}
          renderLabel={(v) => (v === 'photo' ? c.modePhoto : c.modeSticker)}
          variant="dark"
        />
      </div>
    </div>
  );
}

interface SlidingPillProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
  /** `light` = white pill with pink highlight (top overlay use).
   *  `dark` = translucent pill on dark bg (bottom bar use). */
  variant: 'light' | 'dark';
}

function SlidingPill<T extends string>({
  options,
  value,
  onChange,
  renderLabel,
  variant,
}: SlidingPillProps<T>) {
  const idx = Math.max(0, options.indexOf(value));
  const track =
    variant === 'light'
      ? 'bg-brand-white/85 text-brand-gray900'
      : 'bg-brand-gray800/80 text-brand-gray200';
  return (
    <div
      className={cn(
        'relative inline-flex h-9 items-center rounded-full p-1 text-sm font-medium backdrop-blur-sm',
        track,
      )}
    >
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-full bg-brand-pink200 transition-transform"
        style={{
          width: `calc((100% - 0.5rem) / ${options.length})`,
          transform: `translateX(calc(${idx * 100}% + ${idx * 0.25}rem))`,
          left: '0.25rem',
        }}
      />
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'relative z-10 flex-1 rounded-full px-4 py-1 transition-colors focus-visible:outline-none',
            value === opt && 'font-semibold text-brand-white',
          )}
        >
          {renderLabel(opt)}
        </button>
      ))}
    </div>
  );
}

/**
 * Capture the current video frame into a Blob, cropped to `ratio` from
 * the center. Uses the video's intrinsic dimensions so the output is
 * device-pixel accurate regardless of on-screen scaling.
 */
async function grabFrame(video: HTMLVideoElement, ratio: StickerRatio): Promise<Blob> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  // Label "4:3" is kept for user familiarity but the actual crop is
  // portrait 3:4 (per Figma preview) — width:height = 3:4, so height wins.
  const target = ratio === '1:1' ? 1 : 3 / 4;
  const source = vw / vh;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;
  if (source > target) {
    sw = Math.round(vh * target);
    sx = Math.round((vw - sw) / 2);
  } else if (source < target) {
    sh = Math.round(vw / target);
    sy = Math.round((vh - sh) / 2);
  }
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-context-unavailable');
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('canvas-toBlob-null'))),
      'image/jpeg',
      0.92,
    );
  });
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function AlbumIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M3 17l5-5 4 4 3-3 6 6" />
      <circle cx="9" cy="11" r="1.5" />
    </svg>
  );
}

function FlipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 4v4h-4" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 20v-4h4" />
    </svg>
  );
}
