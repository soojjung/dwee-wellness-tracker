'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import {
  useMediaCustomizeView,
  useIsPhotoDraftDirty,
} from '@/store/useMediaCustomizeView';
// import { usePeriodStore } from '@/store/periodStore';
// import { useSettingsStore } from '@/store/settingsStore';
// import { currentPhase } from '@/domain/cycle/phase';
// import { todayISO } from '@/lib/date';
import { slotsForCount, type PhotoCount } from '@/domain/home/decor';
// import { DEFAULT_TEXT_ORDER } from '@/domain/home/decor';
import { HomeCustomizeHeader } from './HomeCustomizeHeader';
import { PhotoCountSection } from './PhotoCountSection';
import { PhotoPreviewGrid } from './PhotoPreviewGrid';
// import { TextSettingsSection } from './TextSettingsSection';
import { HomeCustomizeFooter } from './HomeCustomizeFooter';
import { DiscardDraftDialog } from './DiscardDraftDialog';

export function HomeCustomizeScreen() {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const pickTargetRef = useRef<PhotoCount | null>(null);

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const beginPhotoDraft = useMediaStore((s) => s.beginPhotoDraft);
  const discardPhotoDraft = useMediaStore((s) => s.discardPhotoDraft);
  const commitPhotoDraft = useMediaStore((s) => s.commitPhotoDraft);
  const draftSetPhotoCount = useMediaStore((s) => s.draftSetPhotoCount);
  const draftSetPhoto = useMediaStore((s) => s.draftSetPhoto);
  const view = useMediaCustomizeView();
  const photoCount = view.photoCount;
  const photoUrls = view.photoUrls;
  const photoTransforms = view.photoTransforms;
  const picksConfirmed = view.picksConfirmed;
  const isDirty = useIsPhotoDraftDirty();
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  // const textPosition = useMediaStore((s) => s.textPosition);
  // const mainText = useMediaStore((s) => s.mainText);
  // const subText = useMediaStore((s) => s.subText);
  // const textOrder = useMediaStore((s) => s.textOrder) ?? DEFAULT_TEXT_ORDER;
  // const setTextPosition = useMediaStore((s) => s.setTextPosition);
  // const setMainText = useMediaStore((s) => s.setMainText);
  // const setSubText = useMediaStore((s) => s.setSubText);
  // const swapTexts = useMediaStore((s) => s.swapTexts);

  // const periods = usePeriodStore((s) => s.periods);
  // const periodsHydrated = usePeriodStore((s) => s.hydrated);
  // const hydratePeriods = usePeriodStore((s) => s.hydrate);
  // const settings = useSettingsStore((s) => s.settings);
  // const settingsHydrated = useSettingsStore((s) => s.hydrated);
  // const hydrateSettings = useSettingsStore((s) => s.hydrate);

  // const [localMain, setLocalMain] = useState('');
  // const [localSub, setLocalSub] = useState('');
  // const initRef = useRef(false);
  // const prefilledRef = useRef(false);

  useEffect(() => {
    if (!hydrated) hydrate();
    // if (!periodsHydrated) hydratePeriods();
    // if (!settingsHydrated) hydrateSettings();
  }, [hydrated, hydrate]);

  // Start (or reset) a draft session when this screen mounts on a fresh
  // hydration. All customize/edit-photos mutations happen inside the draft
  // and only reach the repo when the user taps "설정 완료".
  useEffect(() => {
    if (!hydrated) return;
    beginPhotoDraft();
  }, [hydrated, beginPhotoDraft]);

  // const phaseResult = useMemo(
  //   () => currentPhase(todayISO(), periods, settings),
  //   [periods, settings],
  // );
  // const autoCopy = t.home.autoText[phaseResult.phase];

  // useEffect(() => {
  //   if (initRef.current) return;
  //   if (!hydrated) return;
  //   setLocalMain(mainText);
  //   setLocalSub(subText);
  //   initRef.current = true;
  // }, [hydrated, mainText, subText]);

  // useEffect(() => {
  //   if (prefilledRef.current) return;
  //   if (!initRef.current) return;
  //   if (!periodsHydrated || !settingsHydrated) return;
  //   prefilledRef.current = true;
  //   if (localMain === '' && localSub === '') {
  //     setLocalMain(autoCopy.main);
  //     setLocalSub(autoCopy.sub);
  //   }
  // }, [periodsHydrated, settingsHydrated, autoCopy.main, autoCopy.sub, localMain, localSub]);

  function handleSelectCount(count: PhotoCount) {
    draftSetPhotoCount(count);
    const targetSlots = slotsForCount(count);
    const missing = targetSlots.some((s) => !photoUrls[s]);
    if (!missing) {
      // Already have photos in every slot — jump to overview so the user can
      // review, replace, or remove from there.
      router.push('/home/customize/edit-photos');
      return;
    }
    pickTargetRef.current = count;
    fileRef.current?.click();
  }

  function handleFilesPicked(files: FileList) {
    const target = pickTargetRef.current;
    pickTargetRef.current = null;
    if (!target) return;
    const targetSlots = slotsForCount(target);
    const picked = Array.from(files).slice(0, target);
    // Fill only the slots the user picked a file for. Any un-picked slot is
    // left as-is (may be empty or hold a previously-committed photo) — the
    // overview screen shows a "+" placeholder for empty slots so the user can
    // finish there. This avoids destroying existing photos when the user
    // picks fewer files than the target count.
    for (let i = 0; i < picked.length; i++) {
      const slot = targetSlots[i]!;
      const file = picked[i]!;
      draftSetPhoto(slot, file);
    }
    // Always land on the overview after a pick attempt (even if the user
    // cancelled with 0 picks). Overview is where the customize flow's photo
    // management lives.
    router.push('/home/customize/edit-photos');
  }

  const activeSlots = photoCount ? slotsForCount(photoCount) : [];
  const activeUrls = activeSlots.map((s) => photoUrls[s] ?? null);
  const activeTransforms = activeSlots.map((s) => photoTransforms[s] ?? null);
  const allFilled = photoCount !== null && activeUrls.every((u) => !!u);
  // "설정 완료" only activates when the user has explicitly confirmed the
  // photo picks via 선택하기 on the edit-photos overview. Any subsequent pick
  // change resets picksConfirmed → forcing another visit.
  const submitEnabled = allFilled && picksConfirmed;

  async function handleSubmit() {
    if (!submitEnabled) return;
    await commitPhotoDraft();
    // if (localMain !== mainText) await setMainText(localMain);
    // if (localSub !== subText) await setSubText(localSub);
    router.push('/');
  }

  function handleBack() {
    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    discardPhotoDraft();
    router.push('/');
  }

  function handleDiscardConfirm() {
    setShowDiscardDialog(false);
    discardPhotoDraft();
    router.push('/');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        <HomeCustomizeHeader onBack={handleBack} />
        <main className="flex-1">
          <PhotoCountSection selected={photoCount} onSelect={handleSelectCount} />
          {allFilled && photoCount ? (
            <div className="px-4">
              <PhotoPreviewGrid
                count={photoCount}
                urls={activeUrls}
                transforms={activeTransforms}
              />
              <Link
                href="/home/customize/edit-photos"
                className={cn(
                  'mt-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-gray300 py-4 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
                )}
              >
                <CropIcon />
                {t.home.customize.photo.editButton}
              </Link>
            </div>
          ) : null}
          {/* <TextSettingsSection
            position={textPosition}
            mainText={localMain}
            subText={localSub}
            textOrder={textOrder}
            mainPlaceholder={t.home.customize.text.mainPlaceholder}
            subPlaceholder={t.home.customize.text.subPlaceholder}
            onPositionChange={setTextPosition}
            onMainChange={setLocalMain}
            onSubChange={setLocalSub}
            onSwap={swapTexts}
          /> */}
        </main>
        <HomeCustomizeFooter
          enabled={submitEnabled}
          onSubmit={handleSubmit}
          hint={allFilled && !picksConfirmed ? t.home.customize.confirmPicksHint : undefined}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) handleFilesPicked(files);
          e.target.value = '';
        }}
      />

      {showDiscardDialog ? (
        <DiscardDraftDialog
          onCancel={() => setShowDiscardDialog(false)}
          onConfirm={handleDiscardConfirm}
        />
      ) : null}
    </div>
  );
}

function CropIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 1v11a1 1 0 001 1h11M1 4h11a1 1 0 011 1v11" />
    </svg>
  );
}
