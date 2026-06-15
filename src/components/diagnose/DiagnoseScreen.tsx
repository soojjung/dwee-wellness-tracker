'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { fileToBase64 } from '@/lib/image/fileToBase64';
import { analyzeBodyType } from '@/data/services/bodyTypeService';
import type {
  BodyTypeAnalyzeError,
  BodyTypeReport,
  SupportedImageMediaType,
} from '@/types';
import { PhotoPicker } from './PhotoPicker';
import { ReportView } from './ReportView';
import { exportReportAsPng } from './exportReport';

type Step =
  | { kind: 'picker' }
  | { kind: 'preview'; file: File; previewUrl: string; mediaType: SupportedImageMediaType }
  | { kind: 'loading' }
  | { kind: 'result'; report: BodyTypeReport; remaining: number }
  | { kind: 'error'; code: BodyTypeAnalyzeError };

const ARTICLE_HREF = '/magazine/personal-body-type';

export function DiagnoseScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const [step, setStep] = useState<Step>({ kind: 'picker' });
  const [remaining, setRemaining] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // (fullscreen) route group sits outside AppShell, so the store isn't
  // hydrated automatically — without this the page falls through to en.
  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
  }, [hydrateSettings, settingsHydrated]);

  // Revoke object URLs when preview unmounts to avoid leaks.
  useEffect(() => {
    if (step.kind !== 'preview') return;
    const url = step.previewUrl;
    return () => URL.revokeObjectURL(url);
  }, [step]);

  async function submit(file: File, mediaType: SupportedImageMediaType) {
    setStep({ kind: 'loading' });
    let imageBase64: string;
    try {
      imageBase64 = await fileToBase64(file);
    } catch {
      setStep({ kind: 'error', code: 'missing_image' });
      return;
    }
    const result = await analyzeBodyType({
      imageBase64,
      imageMediaType: mediaType,
      shotType: 'full-body',
      locale,
    });
    if (!result.ok) {
      setStep({ kind: 'error', code: result.error });
      return;
    }
    setRemaining(result.data.remaining);
    if (!result.data.report.analyzable) {
      setStep({ kind: 'error', code: 'no_body_detected' });
      return;
    }
    setStep({ kind: 'result', report: result.data.report, remaining: result.data.remaining });
  }

  async function saveAsImage() {
    if (!reportRef.current || saving) return;
    setSaving(true);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      await exportReportAsPng(reportRef.current, `dwee-body-type-${stamp}.png`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6">
      {step.kind !== 'loading' ? (
        <Link
          href={ARTICLE_HREF}
          className="-ml-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-brand-gray600 hover:text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          ← {t.magazine.diagnose.backToArticle}
        </Link>
      ) : null}

      {step.kind === 'picker' ? (
        <div className="flex flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-brand-gray900">{t.magazine.diagnose.intro.title}</h1>
            <p className="text-sm text-brand-gray600">{t.magazine.diagnose.intro.subtitle}</p>
          </header>
          <section className="flex flex-col gap-2 rounded-2xl bg-brand-pink50 p-4">
            <h2 className="text-sm font-semibold text-brand-gray900">{t.magazine.diagnose.picker.guideTitle}</h2>
            <p className="text-sm leading-relaxed text-brand-gray800">{t.magazine.diagnose.picker.guideBody}</p>
          </section>
          <section className="flex flex-col gap-2 rounded-2xl bg-brand-gray200 p-4">
            <h2 className="text-sm font-semibold text-brand-gray900">{t.magazine.diagnose.intro.toneTitle}</h2>
            <p className="text-sm leading-relaxed text-brand-gray800">{t.magazine.diagnose.intro.toneBody}</p>
          </section>
          <section className="flex flex-col gap-2 rounded-2xl bg-brand-gray200 p-4">
            <h2 className="text-sm font-semibold text-brand-gray900">{t.magazine.diagnose.intro.privacyTitle}</h2>
            <p className="text-sm leading-relaxed text-brand-gray800">{t.magazine.diagnose.intro.privacyBody}</p>
          </section>
          <PhotoPicker
            remaining={remaining}
            onPicked={({ file, mediaType }) =>
              setStep({
                kind: 'preview',
                file,
                previewUrl: URL.createObjectURL(file),
                mediaType,
              })
            }
            onInvalidFormat={() => setStep({ kind: 'error', code: 'invalid_media_type' })}
          />
        </div>
      ) : null}

      {step.kind === 'preview' ? (
        <PreviewStep
          previewUrl={step.previewUrl}
          onConfirm={() => submit(step.file, step.mediaType)}
          onRetake={() => setStep({ kind: 'picker' })}
        />
      ) : null}

      {step.kind === 'loading' ? <LoadingStep /> : null}

      {step.kind === 'result' ? (
        <ResultStep
          report={step.report}
          reportRef={reportRef}
          onSave={saveAsImage}
          saving={saving}
          onTryAgain={() => setStep({ kind: 'picker' })}
        />
      ) : null}

      {step.kind === 'error' ? (
        <ErrorStep code={step.code} onRetry={() => setStep({ kind: 'picker' })} />
      ) : null}
    </div>
  );
}

function PreviewStep({
  previewUrl,
  onConfirm,
  onRetake,
}: {
  previewUrl: string;
  onConfirm: () => void;
  onRetake: () => void;
}) {
  const t = useT();
  const p = t.magazine.diagnose.preview;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-brand-gray900">{p.title}</h1>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-brand-gray200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="" className="h-full w-full object-contain" />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 rounded-2xl border border-brand-gray300 px-4 py-3 text-sm font-semibold text-brand-gray800 hover:bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {p.retake}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-2xl bg-brand-pink200 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {p.confirm}
        </button>
      </div>
    </div>
  );
}

function LoadingStep() {
  const t = useT();
  const l = t.magazine.diagnose.loading;
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-pink50 border-t-brand-pink200" aria-hidden />
      <p className="text-base font-semibold text-brand-gray900">{l.title}</p>
      <p className="text-sm text-brand-gray600">{l.body}</p>
      <p className="mt-2 max-w-xs rounded-2xl bg-brand-pink50 px-4 py-3 text-xs leading-relaxed text-brand-gray800">
        {l.stayHint}
      </p>
    </div>
  );
}

function ResultStep({
  report,
  reportRef,
  onSave,
  saving,
  onTryAgain,
}: {
  report: BodyTypeReport;
  reportRef: React.RefObject<HTMLDivElement | null>;
  onSave: () => void;
  saving: boolean;
  onTryAgain: () => void;
}) {
  const t = useT();
  const r = t.magazine.diagnose.result;
  return (
    <div className="flex flex-col gap-4">
      <ReportView ref={reportRef} report={report} />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onTryAgain}
          className="flex-1 rounded-2xl border border-brand-gray300 px-4 py-3 text-sm font-semibold text-brand-gray800 hover:bg-brand-gray200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {r.tryAgain}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 rounded-2xl bg-brand-pink200 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
        >
          {saving ? r.savingImage : r.saveAsImage}
        </button>
      </div>
      <Link
        href={ARTICLE_HREF}
        className="self-center text-xs font-medium text-brand-gray600 hover:text-brand-gray900"
      >
        {r.backToArticle}
      </Link>
    </div>
  );
}

function ErrorStep({
  code,
  onRetry,
}: {
  code: BodyTypeAnalyzeError;
  onRetry: () => void;
}) {
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
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <h1 className="text-xl font-semibold text-brand-gray900">{e.title}</h1>
      <p className="text-sm text-brand-gray600">{messageMap[code]}</p>
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
