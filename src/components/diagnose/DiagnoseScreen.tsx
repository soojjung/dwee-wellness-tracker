'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { fileToBase64, supportedMediaType } from '@/lib/image/fileToBase64';
import { analyzeBodyType } from '@/data/services/bodyTypeService';
import type { BodyTypeAnalyzeError, SupportedImageMediaType } from '@/types';
import { AlertCircleIcon, BackIcon } from '@/components/ui/icons';
import { REPORT_SESSION_KEY } from './DiagnoseResultScreen';

const ARTICLE_HREF = '/magazine/personal-body-type';
const RESULT_HREF = '/magazine/personal-body-type/diagnose/result';

type Slot = 'front' | 'side' | 'back';
const SLOT_ORDER: readonly Slot[] = ['front', 'side', 'back'] as const;

interface Photo {
  file: File;
  previewUrl: string;
  mediaType: SupportedImageMediaType;
}
type Photos = Partial<Record<Slot, Photo>>;

type Step =
  | { kind: 'intro'; photos: Photos; consent: boolean; consented: boolean }
  | { kind: 'loading'; blurUrl: string }
  | { kind: 'error'; code: BodyTypeAnalyzeError };

export function DiagnoseScreen() {
  const router = useRouter();
  const locale = useSettingsStore((s) => s.settings.locale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const [step, setStep] = useState<Step>({
    kind: 'intro',
    photos: {},
    consent: false,
    consented: false,
  });
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
  }, [hydrateSettings, settingsHydrated]);

  useEffect(() => {
    if (step.kind !== 'loading') return;
    const url = step.blurUrl;
    return () => URL.revokeObjectURL(url);
  }, [step]);

  function setSlot(slot: Slot, data: Photo | null) {
    setStep((prev) => {
      if (prev.kind !== 'intro') return prev;
      const prevData = prev.photos[slot];
      if (prevData) URL.revokeObjectURL(prevData.previewUrl);
      const next: Photos = { ...prev.photos };
      if (data) next[slot] = data;
      else delete next[slot];
      return { ...prev, photos: next };
    });
  }

  function setConsentOpen(consent: boolean) {
    setStep((prev) => (prev.kind === 'intro' ? { ...prev, consent } : prev));
  }

  function markConsented() {
    setStep((prev) =>
      prev.kind === 'intro' ? { ...prev, consent: false, consented: true } : prev,
    );
  }

  function resetIntro() {
    setStep({ kind: 'intro', photos: {}, consent: false, consented: false });
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

  if (step.kind === 'intro') {
    return (
      <IntroView
        photos={step.photos}
        remaining={remaining}
        consentOpen={step.consent}
        consented={step.consented}
        onOpenConsent={() => setConsentOpen(true)}
        onCloseConsent={() => setConsentOpen(false)}
        onConsentGranted={markConsented}
        onSlot={setSlot}
        onStart={() => startAnalysis(step.photos)}
      />
    );
  }
  if (step.kind === 'loading') return <LoadingView blurUrl={step.blurUrl} />;
  return <ErrorView code={step.code} onRetry={resetIntro} />;
}

interface IntroViewProps {
  photos: Photos;
  remaining: number | null;
  consentOpen: boolean;
  consented: boolean;
  onOpenConsent: () => void;
  onCloseConsent: () => void;
  onConsentGranted: () => void;
  onSlot: (slot: Slot, data: Photo | null) => void;
  onStart: () => void;
}

function IntroView({
  photos,
  remaining,
  consentOpen,
  consented,
  onOpenConsent,
  onCloseConsent,
  onConsentGranted,
  onSlot,
  onStart,
}: IntroViewProps) {
  const t = useT();
  const p = t.magazine.diagnose;
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const hasFront = Boolean(photos.front);

  function requestPickerFor(slot: Slot) {
    setPendingSlot(slot);
    if (!consented) {
      onOpenConsent();
      return;
    }
    inputRef.current?.click();
  }

  function handleConsentAgree() {
    onConsentGranted();
    // Defer to next tick so the modal unmounts (releasing body scroll lock)
    // before the file picker takes over.
    setTimeout(() => inputRef.current?.click(), 0);
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

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand-gray50 pb-[calc(88px+env(safe-area-inset-bottom,0px))]">
      <TopBar backHref={ARTICLE_HREF} backAria={p.backToArticle} />

      <div className="flex flex-col gap-6 pt-6">
        <header className="flex flex-col gap-2 px-4">
          <h1 className="text-2xl font-semibold leading-[normal] text-brand-gray900">
            {p.intro.title}
          </h1>
          <p className="text-lg leading-normal text-brand-gray800">{p.intro.subtitle}</p>
        </header>

        <SlotStrip photos={photos} labels={slotLabel} onSlotTap={requestPickerFor} />

        <GuideSection
          chip={p.picker.guideChip}
          title={p.picker.guideTitle}
          items={[p.picker.guideItem1, p.picker.guideItem2, p.picker.guideItem3]}
        />
        <GuideSection
          chip={p.picker.uploadChip}
          title={p.picker.uploadTitle}
          items={[p.picker.uploadItem1, p.picker.uploadItem2]}
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
            onClick={onStart}
            className="flex h-[60px] w-full items-center justify-center bg-brand-pink50 text-xl font-semibold leading-[normal] text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {p.picker.startButton}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => requestPickerFor('front')}
            className="flex h-[60px] w-full items-center justify-center bg-brand-pink50 text-xl font-semibold leading-[normal] text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {p.picker.selectButton}
          </button>
        )}
      </BottomBar>

      {consentOpen ? (
        <ConsentModal onCancel={onCloseConsent} onAgree={handleConsentAgree} />
      ) : null}
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
        {SLOT_ORDER.map((slot) => {
          const photo = photos[slot];
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSlotTap(slot)}
              className="relative h-[180px] flex-1 overflow-hidden bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
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
    <section className="flex flex-col gap-2 px-4">
      <span className="inline-flex w-fit items-center justify-center rounded bg-brand-gray200 px-2 py-1 text-xs leading-normal text-brand-gray700">
        {chip}
      </span>
      <h2 className="text-lg font-semibold leading-normal text-brand-gray900">{title}</h2>
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

function ConsentModal({ onCancel, onAgree }: { onCancel: () => void; onAgree: () => void }) {
  const t = useT();
  const c = t.magazine.diagnose.consent;
  useBodyScrollLock();
  useEscToClose(onCancel);
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnose-consent-title"
        className="flex w-full max-w-[333px] flex-col overflow-hidden rounded-2xl bg-brand-gray50"
      >
        <div className="flex flex-col gap-4 p-8">
          <h2
            id="diagnose-consent-title"
            className="text-xl font-semibold leading-normal text-brand-gray900"
          >
            {c.title}
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold leading-[normal] text-brand-gray900">
              {c.heading}
            </p>
            <ul className="flex flex-col gap-1 pl-5 text-sm leading-normal text-brand-gray700">
              <li className="list-disc">{c.item1}</li>
              <li className="list-disc">{c.item2}</li>
            </ul>
            <p className="text-xs leading-normal text-brand-gray600">{c.footnote}</p>
          </div>
        </div>
        <div className="flex w-full items-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[50px] flex-1 items-center justify-center bg-brand-gray300 text-lg font-medium leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {c.cancel}
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="flex h-[50px] w-[167px] items-center justify-center bg-brand-gray900 text-lg font-semibold leading-normal text-brand-gray50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {c.agree}
          </button>
        </div>
      </div>
    </div>
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
      <img
        src={blurUrl}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-[15px]"
      />
      <div className="absolute inset-0 bg-black/[0.15]" />
      <div className="relative flex flex-col items-center gap-8 px-6">
        <CircularProgress percent={percent} label={`${percentInt}%`} />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl font-semibold leading-normal text-brand-gray50">{l.title}</p>
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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-4">
      <span className="grid size-[70px] place-items-center rounded-full bg-brand-gray300 text-brand-gray600">
        <AlertCircleIcon className="size-[42px]" />
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold leading-normal text-brand-gray900">{e.title}</h1>
        <p className="text-base leading-normal text-brand-gray800">{messageMap[code]}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-full bg-brand-pink50 px-7 py-4 text-base font-medium leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
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
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-brand-gray50 pb-[env(safe-area-inset-bottom,0px)]">
      {children}
    </div>
  );
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
