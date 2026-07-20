'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useMediaStore } from '@/store/mediaStore';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { currentPhase } from '@/domain/cycle/phase';
import { todayISO } from '@/lib/date';
import { DEFAULT_TEXT_ORDER, slotsForCount, type PhotoCount } from '@/domain/home/decor';
import { HomeCustomizeHeader } from './HomeCustomizeHeader';
import { PhotoCountSection } from './PhotoCountSection';
import { PhotoPreviewGrid } from './PhotoPreviewGrid';
import { TextSettingsSection } from './TextSettingsSection';
import { HomeCustomizeFooter } from './HomeCustomizeFooter';

export function HomeCustomizeScreen() {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const pickTargetRef = useRef<PhotoCount | null>(null);

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const photoCount = useMediaStore((s) => s.photoCount);
  const photoUrls = useMediaStore((s) => s.photoUrls);
  const setPhotoCount = useMediaStore((s) => s.setPhotoCount);
  const setPhoto = useMediaStore((s) => s.setPhoto);
  const clearPhoto = useMediaStore((s) => s.clearPhoto);
  const textPosition = useMediaStore((s) => s.textPosition);
  const mainText = useMediaStore((s) => s.mainText);
  const subText = useMediaStore((s) => s.subText);
  const textOrder = useMediaStore((s) => s.textOrder) ?? DEFAULT_TEXT_ORDER;
  const setTextPosition = useMediaStore((s) => s.setTextPosition);
  const setMainText = useMediaStore((s) => s.setMainText);
  const setSubText = useMediaStore((s) => s.setSubText);
  const swapTexts = useMediaStore((s) => s.swapTexts);

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);
  const settings = useSettingsStore((s) => s.settings);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);

  const [localMain, setLocalMain] = useState('');
  const [localSub, setLocalSub] = useState('');
  const initRef = useRef(false);
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (!hydrated) hydrate();
    if (!periodsHydrated) hydratePeriods();
    if (!settingsHydrated) hydrateSettings();
  }, [hydrated, hydrate, periodsHydrated, hydratePeriods, settingsHydrated, hydrateSettings]);

  const phaseResult = useMemo(
    () => currentPhase(todayISO(), periods, settings),
    [periods, settings],
  );
  const autoCopy = t.home.autoText[phaseResult.phase];

  useEffect(() => {
    if (initRef.current) return;
    if (!hydrated) return;
    setLocalMain(mainText);
    setLocalSub(subText);
    initRef.current = true;
  }, [hydrated, mainText, subText]);

  useEffect(() => {
    if (prefilledRef.current) return;
    if (!initRef.current) return;
    if (!periodsHydrated || !settingsHydrated) return;
    prefilledRef.current = true;
    if (localMain === '' && localSub === '') {
      setLocalMain(autoCopy.main);
      setLocalSub(autoCopy.sub);
    }
  }, [periodsHydrated, settingsHydrated, autoCopy.main, autoCopy.sub, localMain, localSub]);

  async function handleSelectCount(count: PhotoCount) {
    await setPhotoCount(count);
    const targetSlots = slotsForCount(count);
    const missing = targetSlots.some((s) => !photoUrls[s]);
    if (!missing) return;
    pickTargetRef.current = count;
    fileRef.current?.click();
  }

  async function handleFilesPicked(files: FileList) {
    const target = pickTargetRef.current;
    pickTargetRef.current = null;
    if (!target) return;
    const targetSlots = slotsForCount(target);
    const picked = Array.from(files).slice(0, target);
    for (let i = 0; i < target; i++) {
      const slot = targetSlots[i]!;
      const file = picked[i];
      if (file) {
        await setPhoto(slot, file);
      } else {
        await clearPhoto(slot);
      }
    }
    if (picked.length === target) {
      router.push('/home/customize/edit-photos');
    }
  }

  const activeSlots = photoCount ? slotsForCount(photoCount) : [];
  const activeUrls = activeSlots.map((s) => photoUrls[s] ?? null);
  const allFilled = photoCount !== null && activeUrls.every((u) => !!u);
  const submitEnabled = allFilled;

  async function handleSubmit() {
    if (!submitEnabled) return;
    if (localMain !== mainText) await setMainText(localMain);
    if (localSub !== subText) await setSubText(localSub);
    router.push('/');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        <HomeCustomizeHeader />
        <main className="flex-1">
          <PhotoCountSection selected={photoCount} onSelect={handleSelectCount} />
          {allFilled && photoCount ? (
            <div className="px-4">
              <PhotoPreviewGrid count={photoCount} urls={activeUrls} />
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
          <TextSettingsSection
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
          />
        </main>
        <HomeCustomizeFooter enabled={submitEnabled} onSubmit={handleSubmit} />
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
