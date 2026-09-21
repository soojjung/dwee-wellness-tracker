'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/settingsStore';
import { fileToBase64 } from '@/lib/image/fileToBase64';
import { analyzeBodyType } from '@/data/services/bodyTypeService';
import { useBodyTypeReportStore } from '@/store/bodyTypeReportStore';
import type { BodyTypeAnalyzeError } from '@/types';
import { PhotoPreviewView } from './PhotoPreviewView';
import { useBodyPhotoPicker } from './useBodyPhotoPicker';
import { SLOT_ORDER, type Photo, type Photos } from './diagnoseSlots';
import { IntroView } from './DiagnoseIntroView';
import { LoadingView } from './DiagnoseLoadingView';
import { ErrorView } from './DiagnoseErrorView';

const RESULT_HREF = '/magazine/personal-body-type/diagnose/result';

type Step =
  | { kind: 'intro'; photos: Photos; consent: boolean; consented: boolean }
  | { kind: 'preview'; photos: Photos }
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
    // AI 이용안내는 사진을 고르기 전, 화면에 들어오자마자 먼저 보여준다.
    consent: true,
    consented: false,
  });
  const [remaining, setRemaining] = useState<number | null>(null);
  // Cancel + mount guards for the in-flight analyze call. Without these
  // an unmounted screen would still setState (React warns) and — worse —
  // still call router.push(RESULT_HREF), yanking the user out of whatever
  // screen they navigated to while the request was in flight.
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
  }, [hydrateSettings, settingsHydrated]);

  useEffect(() => {
    if (step.kind !== 'loading') return;
    const url = step.blurUrl;
    return () => URL.revokeObjectURL(url);
  }, [step]);

  // On unmount: abort the analyze request and flip mounted flag so any
  // still-pending resolution is a no-op. `mountedRef.current = true` in
  // the effect body is required because React StrictMode (Next.js dev)
  // runs cleanup once immediately after mount to test unmount safety —
  // without the reset, mountedRef stays `false` forever and the guard
  // below silently drops every successful reading.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  // Browser tab close / refresh while loading: show the native confirm so
  // the user doesn't accidentally drop an in-flight reading (server-side
  // rate limit still charges, but at least they get a chance to stay).
  useEffect(() => {
    if (step.kind !== 'loading') return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom text but still show a generic dialog.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [step]);

  // 한 번의 선택으로 전체를 다시 고르므로, 고른 순서대로 앞→옆→뒤에 채우고
  // 이전 선택은 통째로 버린다. 고르고 나면 크게 확인하는 화면으로 넘어간다.
  function setPhotos(picked: readonly Photo[]) {
    setStep((prev) => {
      if (prev.kind !== 'intro' && prev.kind !== 'preview') return prev;
      for (const photo of Object.values(prev.photos)) URL.revokeObjectURL(photo.previewUrl);
      const next: Photos = {};
      SLOT_ORDER.forEach((slot, i) => {
        const photo = picked[i];
        if (photo) next[slot] = photo;
      });
      return { kind: 'preview', photos: next };
    });
  }

  // 미리보기에서 뒤로: 고른 사진을 버리고 안내 화면으로 돌아간다. 동의는 이미 받았다.
  function backToIntro() {
    setStep((prev) => {
      if (prev.kind !== 'preview') return prev;
      for (const photo of Object.values(prev.photos)) URL.revokeObjectURL(photo.previewUrl);
      return { kind: 'intro', photos: {}, consent: false, consented: true };
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
    // 에러 후 재시도. 여기까지 왔다면 이미 동의한 상태이므로 안내를 다시 띄우지 않는다.
    setStep({ kind: 'intro', photos: {}, consent: false, consented: true });
  }

  async function startAnalysis(photos: Photos) {
    const front = photos.front;
    if (!front) return;
    // Fresh controller per attempt — abort() on unmount cancels the
    // in-flight fetch inside supabase.functions.invoke.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStep({ kind: 'loading', blurUrl: front.previewUrl });
    let imageBase64: string;
    try {
      imageBase64 = await fileToBase64(front.file);
    } catch (err) {
      console.error('[diagnose] fileToBase64 failed', err);
      if (mountedRef.current) setStep({ kind: 'error', code: 'missing_image' });
      return;
    }
    if (controller.signal.aborted) return;

    const result = await analyzeBodyType({
      imageBase64,
      imageMediaType: front.mediaType,
      shotType: 'full-body',
      locale,
      signal: controller.signal,
    });

    // User navigated away mid-request — silently drop the result.
    if (!mountedRef.current || controller.signal.aborted) return;

    if (!result.ok) {
      // `aborted` is the caller's own cancel — no UI needed since we're
      // about to unmount anyway. Bail before the error screen renders.
      if (result.error === 'aborted') return;
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
    await useBodyTypeReportStore.getState().save(result.data.report);
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
        onPhotos={setPhotos}
      />
    );
  }
  if (step.kind === 'preview') {
    return (
      <PreviewStep
        photos={step.photos}
        onBack={backToIntro}
        onPhotos={setPhotos}
        onStart={() => startAnalysis(step.photos)}
      />
    );
  }
  if (step.kind === 'loading') return <LoadingView blurUrl={step.blurUrl} />;
  return <ErrorView code={step.code} onRetry={resetIntro} />;
}

/**
 * 미리보기 화면에서도 [사진 변경하기]로 다시 고를 수 있어야 해서, 훅을 여기서 쥐고
 * 숨은 input 을 화면에 내려보낸다.
 */
function PreviewStep({
  photos,
  onBack,
  onPhotos,
  onStart,
}: {
  photos: Photos;
  onBack: () => void;
  onPhotos: (picked: readonly Photo[]) => void;
  onStart: () => void;
}) {
  const picker = useBodyPhotoPicker({ limit: SLOT_ORDER.length, onPicked: onPhotos });
  const ordered = SLOT_ORDER.flatMap((slot) => {
    const photo = photos[slot];
    return photo ? [photo] : [];
  });

  return (
    <PhotoPreviewView
      photos={ordered}
      onBack={onBack}
      onReplace={() => void picker.open()}
      onStart={onStart}
      pickerInput={picker.input}
    />
  );
}
