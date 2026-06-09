'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useMediaStore } from '@/store/mediaStore';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import { currentPhase } from '@/domain/cycle/phase';
import { todayISO } from '@/lib/date';
import { DEFAULT_TEXT_ORDER, type PhotoCount, type PhotoSlot } from '@/domain/home/decor';
import { CropDialog } from '@/components/app/CropDialog';
import { HomeCustomizeHeader } from './HomeCustomizeHeader';
import { PhotoCountSection } from './PhotoCountSection';
import { PhotoSlotPicker } from './PhotoSlotPicker';
import { TextSettingsSection } from './TextSettingsSection';
import { HomeCustomizeFooter } from './HomeCustomizeFooter';

interface Pending {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export function HomeCustomizeScreen() {
  const t = useT();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const hydrated = useMediaStore((s) => s.hydrated);
  const hydrate = useMediaStore((s) => s.hydrate);
  const photoCount = useMediaStore((s) => s.photoCount);
  const photoUrls = useMediaStore((s) => s.photoUrls);
  const setPhotoCount = useMediaStore((s) => s.setPhotoCount);
  const setPhoto = useMediaStore((s) => s.setPhoto);
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

  const [targetSlot, setTargetSlot] = useState<PhotoSlot | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [localMain, setLocalMain] = useState('');
  const [localSub, setLocalSub] = useState('');
  const initRef = useRef(false);
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (!hydrated) hydrate();
    if (!periodsHydrated) hydratePeriods();
    if (!settingsHydrated) hydrateSettings();
  }, [hydrated, hydrate, periodsHydrated, hydratePeriods, settingsHydrated, hydrateSettings]);

  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.src);
    };
  }, [pending]);

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
  }

  function handleSlotPick(slot: PhotoSlot) {
    setTargetSlot(slot);
    fileRef.current?.click();
  }

  async function handleFilesPicked(files: FileList) {
    const [file] = Array.from(files);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const size = await readImageSize(url);
    setPending({ src: url, naturalWidth: size.width, naturalHeight: size.height });
  }

  async function handleCropConfirm(blob: Blob) {
    if (targetSlot !== null) await setPhoto(targetSlot, blob);
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
    setTargetSlot(null);
  }

  function handleCropCancel() {
    if (pending) URL.revokeObjectURL(pending.src);
    setPending(null);
    setTargetSlot(null);
  }

  const filledSlots = photoCount
    ? photoUrls.slice(0, photoCount).filter(Boolean).length
    : 0;
  const submitEnabled = photoCount !== null && filledSlots === photoCount && !pending;

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
          {photoCount ? (
            <div className="px-4">
              <PhotoSlotPicker
                count={photoCount}
                urls={photoUrls.slice(0, photoCount)}
                onSlotPick={handleSlotPick}
              />
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
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) handleFilesPicked(files);
          e.target.value = '';
        }}
      />

      {pending ? (
        <CropDialog
          src={pending.src}
          naturalWidth={pending.naturalWidth}
          naturalHeight={pending.naturalHeight}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      ) : null}
    </div>
  );
}

function readImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}
