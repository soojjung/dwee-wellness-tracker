'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { fileToBase64, supportedMediaType } from '@/lib/image/fileToBase64';
import { analyzeBodyType } from '@/data/services/bodyTypeService';
import type { BodyTypeAnalyzeError, SupportedImageMediaType } from '@/types';
import { BackIcon } from '@/components/ui/icons';
import { REPORT_SESSION_KEY } from './DiagnoseResultScreen';

type Slot = 'front' | 'side' | 'back';
const SLOT_ORDER: readonly Slot[] = ['front', 'side', 'back'] as const;

interface PhotoData {
  file: File;
  previewUrl: string;
  mediaType: SupportedImageMediaType;
}

type Photos = Partial<Record<Slot, PhotoData>>;

type Step =
  | { kind: 'select'; photos: Photos }
  | { kind: 'loading'; blurUrl: string }
  | { kind: 'error'; code: BodyTypeAnalyzeError };

const ARTICLE_HREF = '/magazine/personal-body-type';
const RESULT_HREF = '/magazine/personal-body-type/diagnose/result';

export function DiagnoseScreen() {
  const router = useRouter();
  const locale = useSettingsStore((s) => s.settings.locale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const [step, setStep] = useState<Step>({ kind: 'select', photos: {} });
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
  }, [hydrateSettings, settingsHydrated]);

  useEffect(() => {
    if (step.kind !== 'loading') return;
    const url = step.blurUrl;
    return () => URL.revokeObjectURL(url);
  }, [step]);

  function setSlot(slot: Slot, data: PhotoData | null) {
    setStep((prev) => {
      if (prev.kind !== 'select') return prev;
      const prevData = prev.photos[slot];
      if (prevData) URL.revokeObjectURL(prevData.previewUrl);
      const next: Photos = { ...prev.photos };
      if (data) next[slot] = data;
      else delete next[slot];
      return { kind: 'select', photos: next };
    });
  }

  function resetPhotos() {
    setStep((prev) => {
      if (prev.kind !== 'select') return { kind: 'select', photos: {} };
      for (const s of SLOT_ORDER) {
        const p = prev.photos[s];
        if (p) URL.revokeObjectURL(p.previewUrl);
      }
      return { kind: 'select', photos: {} };
    });
  }

  async function startAnalysis(photos: Photos) {
    const front = photos.front;
    if (!front) return;
    setStep({ kind: 'loading', blurUrl: front.previewUrl });
    let imageBase64: string;
    try {
      imageBase64 = await fileToBase64(front.file);
    } catch (err) {
      console.error('[diagnose] fileToBase64 failed', err);
      setStep({ kind: 'error', code: 'missing_image' });
      return;
    }
    const result = await analyzeBodyType({
      imageBase64,
      imageMediaType: front.mediaType,
      shotType: 'full-body',
      locale,
    });
    if (!result.ok) {
      console.error('[diagnose] analyzeBodyType failed', result.error);
      setStep({ kind: 'error', code: result.error });
      return;
    }
    setRemaining(result.data.remaining);
    if (!result.data.report.analyzable) {
      console.error('[diagnose] report not analyzable', result.data.report);
      setStep({ kind: 'error', code: 'no_body_detected' });
      return;
    }
    try {
      window.sessionStorage.setItem(
        REPORT_SESSION_KEY,
        JSON.stringify({ report: result.data.report, savedAt: new Date().toISOString() }),
      );
    } catch (err) {
      console.error('[diagnose] failed to persist report', err);
    }
    router.push(RESULT_HREF);
  }

  if (step.kind === 'select') {
    return (
      <SelectView
        photos={step.photos}
        remaining={remaining}
        onSlot={setSlot}
        onStart={(p) => startAnalysis(p)}
      />
    );
  }
  if (step.kind === 'loading') return <LoadingView blurUrl={step.blurUrl} />;
  return <ErrorView code={step.code} onRetry={resetPhotos} />;
}

interface SelectViewProps {
  photos: Photos;
  remaining: number | null;
  onSlot: (slot: Slot, data: PhotoData | null) => void;
  onStart: (photos: Photos) => void;
}

function SelectView({ photos, remaining, onSlot, onStart }: SelectViewProps) {
  const t = useT();
  const p = t.magazine.diagnose;
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);

  const hasFront = Boolean(photos.front);

  function openPickerFor(slot: Slot) {
    setPendingSlot(slot);
    inputRef.current?.click();
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !pendingSlot) return;
    const mediaType = supportedMediaType(file);
    if (!mediaType) {
      setPendingSlot(null);
      return;
    }
    onSlot(pendingSlot, { file, previewUrl: URL.createObjectURL(file), mediaType });
    setPendingSlot(null);
  }

  const slotLabel: Record<Slot, string> = {
    front: p.picker.slotFront,
    side: p.picker.slotSide,
    back: p.picker.slotBack,
  };
  const slotPrompt: Record<Slot, string> = {
    front: p.picker.slotPromptFront,
    side: p.picker.slotPromptSide,
    back: p.picker.slotPromptBack,
  };

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand-gray50 pb-[92px]">
      <TopBar backHref={ARTICLE_HREF} backAria={p.backToArticle} />

      <div className="flex flex-col gap-8 pt-6">
        <header className="flex flex-col gap-2 px-4">
          <h1 className="text-2xl font-semibold leading-[normal] text-brand-gray900">
            {p.intro.title}
          </h1>
          <p className="text-lg leading-normal text-brand-gray800">{p.intro.subtitle}</p>
        </header>

        <SlotStrip photos={photos} labels={slotLabel} onSlotTap={openPickerFor} />

        <GuideSection
          chip={p.picker.guideChip}
          title={p.picker.guideTitle}
          items={[p.picker.guideItem1, p.picker.guideItem2, p.picker.guideItem3]}
        />
        <GuideSection
          chip={p.picker.storageChip}
          title={p.picker.storageTitle}
          items={[p.picker.storageItem1, p.picker.storageItem2]}
        />

        {remaining !== null ? (
          <p className="px-4 text-xs text-brand-gray700">
            {p.picker.remainingPrefix}
            <strong className="font-semibold text-brand-gray900">{remaining}</strong>
            {p.picker.remainingSuffix}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />

      <BottomBar>
        {hasFront ? (
          <button
            type="button"
            onClick={() => onStart(photos)}
            className="flex h-[calc(76px+env(safe-area-inset-bottom,0px))] w-full items-center justify-center bg-brand-gray900 pb-[env(safe-area-inset-bottom,0px)] text-xl font-semibold leading-[normal] text-brand-pink100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {p.picker.startButton}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openPickerFor('front')}
            className="flex h-[calc(76px+env(safe-area-inset-bottom,0px))] w-full flex-col items-center justify-center bg-brand-pink50 pb-[env(safe-area-inset-bottom,0px)] text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            <span className="text-xl font-semibold leading-[normal]">{p.picker.selectButton}</span>
            <span className="mt-1 text-xs text-brand-gray700">{slotPrompt.front}</span>
          </button>
        )}
      </BottomBar>
    </div>
  );
}

function SlotStrip({
  photos,
  labels,
  onSlotTap,
}: {
  photos: Photos;
  labels: Record<Slot, string>;
  onSlotTap: (slot: Slot) => void;
}) {
  return (
    <div className="px-4">
      <div className="flex overflow-hidden rounded-2xl">
        {SLOT_ORDER.map((slot, i) => {
          const photo = photos[slot];
          const roundedClass =
            i === 0 ? 'rounded-l-2xl' : i === SLOT_ORDER.length - 1 ? 'rounded-r-2xl' : '';
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSlotTap(slot)}
              className={`relative h-[180px] flex-1 overflow-hidden bg-brand-gray200 ${roundedClass} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200`}
              aria-label={labels[slot]}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 text-brand-gray700">
                  <PlusIcon className="size-6" />
                  <span className="text-sm font-medium">{labels[slot]}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GuideSection({
  chip,
  title,
  items,
}: {
  chip: string;
  title: string;
  items: readonly string[];
}) {
  return (
    <section className="flex flex-col gap-3 px-4">
      <span className="inline-flex w-fit items-center justify-center rounded bg-brand-gray200 px-2 py-1 text-xs text-brand-gray700">
        {chip}
      </span>
      <h2 className="text-lg font-semibold leading-[normal] text-brand-gray900">{title}</h2>
      <ul className="flex flex-col gap-1 pl-6 text-base leading-normal text-brand-gray700">
        {items.map((item, i) => (
          <li key={i} className="list-disc">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function LoadingView({ blurUrl }: { blurUrl: string }) {
  const t = useT();
  const l = t.magazine.diagnose.loading;
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const target = 12_000;
    const tick = () => {
      const elapsed = performance.now() - start;
      const easedTarget = Math.min(0.95, elapsed / target);
      setPercent((prev) => {
        const jitter = 0.005 + Math.random() * 0.01;
        const next = Math.min(easedTarget, prev + jitter);
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const percentInt = Math.round(percent * 100);

  return (
    <div className="fixed inset-0 z-40 flex h-dvh w-full items-center justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={blurUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex flex-col items-center gap-8 px-6">
        <CircularProgress percent={percent} label={`${percentInt}%`} />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="whitespace-nowrap text-2xl font-semibold leading-normal text-brand-gray50">
            {l.title}
          </p>
          <p className="text-base leading-normal text-brand-gray200">{l.body}</p>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ percent, label }: { percent: number; label: string }) {
  const size = 180;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * percent;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,253,254,0.2)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#FFFDFE"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <p className="absolute inset-0 flex items-center justify-center text-2xl font-bold leading-normal text-brand-gray50">
        {label}
      </p>
    </div>
  );
}

function ErrorView({ code, onRetry }: { code: BodyTypeAnalyzeError; onRetry: () => void }) {
  const t = useT();
  const e = t.magazine.diagnose.error;
  const messageMap: Record<BodyTypeAnalyzeError, string> = {
    unauthenticated: e.unauthenticated,
    rate_limit_exceeded: e.rateLimitExceeded,
    image_too_large: e.imageTooLarge,
    invalid_media_type: e.invalidMediaType,
    missing_image: e.missingImage,
    invalid_shot_type: e.unknown,
    invalid_locale: e.unknown,
    image_refused: e.imageRefused,
    no_body_detected: e.noBodyDetected,
    openai_failed: e.openaiFailed,
    openai_unreachable: e.openaiUnreachable,
    report_parse_failed: e.openaiFailed,
    unknown: e.unknown,
  };
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-4 px-4 py-10 text-center">
      <h1 className="text-xl font-semibold text-brand-gray900">{e.title}</h1>
      <p className="text-sm text-brand-gray700">{messageMap[code]}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-2xl bg-brand-pink200 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {e.retry}
      </button>
    </div>
  );
}

function TopBar({ backHref, backAria }: { backHref: string; backAria: string }) {
  return (
    <div className="flex items-center px-4 pt-3">
      <Link
        href={backHref}
        aria-label={backAria}
        className="grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
      >
        <BackIcon className="size-10" />
      </Link>
    </div>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-x-0 bottom-0 z-30">{children}</div>;
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
