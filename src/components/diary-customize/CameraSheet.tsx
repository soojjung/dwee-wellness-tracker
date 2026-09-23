'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { cn } from '@/lib/cn';
import { grabFrame } from '@/lib/image/videoFrame';
import { setDarkStatusBar, setLightStatusBar } from '@/lib/native/statusBar';
import { AlbumIcon } from '@/components/ui/icons/AlbumIcon';
import { CameraFlipIcon } from '@/components/ui/icons/CameraFlipIcon';
import { CloseIcon24 } from '@/components/ui/icons/CloseIcon24';

export type CameraMode = 'photo' | 'sticker';

export interface CameraCapture {
  /** JPEG of exactly what the viewfinder showed. No ratio yet — the photo
   *  path picks one on the next screen, the sticker path infers it. */
  blob: Blob;
  mode: CameraMode;
}

interface CameraSheetProps {
  onClose: () => void;
  onOpenAlbum: () => void;
  onCapture: (capture: CameraCapture) => void;
}

type Facing = 'user' | 'environment';
type FatalError = 'permission' | 'unavailable';

const MODE_ORDER: readonly CameraMode[] = ['photo', 'sticker'];

/**
 * In-app camera (013_2, Figma 256:17898 / 256:17943). Full-bleed live
 * MediaDevices preview with the controls floating over it. The bottom pill
 * toggles capture MODE (photo vs sticker) and the parent branches on it:
 * 'photo' goes on to the ratio screen (013_5/6), 'sticker' runs through the
 * sticker-cutout edge function (remove.bg). There is deliberately no ratio
 * control here — a ratio only means something for a photo used as-is, so it
 * is asked after the shot and never for a cutout.
 *
 * Rendered as an overlay above DiaryCustomizeScreen — no route change, so
 * the sticker draft state stays intact if the user backs out.
 *
 * The same MediaDevices preview is used inside the Capacitor shell (WKWebView
 * supports getUserMedia since iOS 14.3) rather than the OS camera, so the
 * mode pill stays over the viewfinder. Only the permission-denied copy
 * differs there: the switch lives in the iOS Settings app, not the browser.
 */
export function CameraSheet({ onClose, onOpenAlbum, onCapture }: CameraSheetProps) {
  const t = useT();
  const c = t.report.diary.camera;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing>('environment');
  const [mode, setMode] = useState<CameraMode>('sticker');
  const [error, setError] = useState<FatalError | null>(null);
  const [starting, setStarting] = useState(true);

  useBodyScrollLock();
  useEscToClose(onClose);

  // Dark viewfinder → light status-bar glyphs while open; the rest of the app is light.
  useEffect(() => {
    void setDarkStatusBar();
    return () => void setLightStatusBar();
  }, []);

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
    grabFrame(video)
      .then((blob) => {
        stopStream();
        onCapture({ blob, mode });
      })
      .catch(() => undefined);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-brand-gray900 text-brand-white"
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 pb-40 text-center">
          <p className="text-base leading-[1.5] text-brand-gray200">
            {error === 'permission'
              ? Capacitor.isNativePlatform()
                ? c.permissionDeniedNative
                : c.permissionDenied
              : c.unavailable}
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
        // 뷰파인더가 화면 전체다. 셔터는 여기 보이는 영역 그대로를 담는다.
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            starting && 'opacity-0',
            facing === 'user' && 'scale-x-[-1]',
          )}
        />
      )}

      <button
        type="button"
        onClick={() => {
          stopStream();
          onClose();
        }}
        aria-label={c.close}
        className="absolute right-4 top-[calc(0.5rem+env(safe-area-inset-top,0px))] grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white"
      >
        <CloseIcon24 className="h-5 w-5" />
      </button>

      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-md flex-col items-center gap-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex w-full items-center justify-between px-[60px]">
          <button
            type="button"
            onClick={onOpenAlbum}
            aria-label={c.openAlbum}
            className={SIDE_BUTTON_CLASS}
          >
            <AlbumIcon className="size-[27px]" />
          </button>

          <button
            type="button"
            onClick={handleShutter}
            disabled={!!error || starting}
            aria-label={c.shutter}
            className="size-[68px] rounded-full border-[5px] border-brand-gray50 p-1 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200 active:scale-95 disabled:opacity-50"
          >
            <span className="block size-full rounded-full bg-brand-pink50" />
          </button>

          <button
            type="button"
            onClick={handleFlip}
            disabled={!!error || starting}
            aria-label={c.flip}
            className={SIDE_BUTTON_CLASS}
          >
            <CameraFlipIcon className="h-[25px] w-[23.4px]" />
          </button>
        </div>

        {/* Mode toggle (spec 7) */}
        <SlidingPill<CameraMode>
          options={MODE_ORDER}
          value={mode}
          onChange={setMode}
          renderLabel={(v) => (v === 'photo' ? c.modePhoto : c.modeSticker)}
        />
      </div>
    </div>
  );
}

const SIDE_BUTTON_CLASS =
  'grid size-[45px] place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white disabled:opacity-50';

interface SlidingPillProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderLabel: (v: T) => string;
}

function SlidingPill<T extends string>({
  options,
  value,
  onChange,
  renderLabel,
}: SlidingPillProps<T>) {
  const idx = Math.max(0, options.indexOf(value));
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // The labels aren't the same width ("사진" vs "스티커"), and the buttons size
  // to their own content, so an even split of the track lands the highlight
  // off its button — which shows up as lopsided padding around the label.
  // Measure the active button instead.
  const [highlight, setHighlight] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const el = btnRefs.current[idx];
    if (!el) return;
    const measure = () => setHighlight({ left: el.offsetLeft, width: el.offsetWidth });
    measure();
    // Re-measure when the webfont swaps in or the label's weight changes.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [idx, options]);
  return (
    // 시안의 알약은 테두리뿐이지만 실제 뷰파인더는 어두울 수 있다. 비활성 라벨(gray600)이
    // 묻히지 않도록 밝은 반투명 바탕을 깐다.
    <div className="relative inline-flex items-center rounded-full border border-brand-gray200 bg-brand-gray50/75 px-[3px] text-base backdrop-blur-sm">
      <span
        aria-hidden
        className="absolute inset-y-0 rounded-full bg-brand-pink50 transition-[left,width] duration-200 ease-out"
        style={highlight ? { left: highlight.left, width: highlight.width } : { opacity: 0 }}
      />
      {options.map((opt, i) => (
        <button
          key={opt}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'relative z-10 min-w-[78px] whitespace-nowrap rounded-full px-[18px] py-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800',
            value === opt ? 'font-semibold text-brand-gray900' : 'text-brand-gray600',
          )}
        >
          {renderLabel(opt)}
        </button>
      ))}
    </div>
  );
}
