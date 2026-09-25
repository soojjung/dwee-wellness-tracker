'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';
import { BOTTOM_CTA_CLASS } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useBodyPhotoPicker } from './useBodyPhotoPicker';
import { ConsentModal } from './DiagnoseConsentModal';
import { SLOT_ORDER, type Photo, type Photos, type Slot } from './diagnoseSlots';

const ARTICLE_HREF = '/magazine/personal-body-type';

interface IntroViewProps {
  photos: Photos;
  remaining: number | null;
  consentOpen: boolean;
  consented: boolean;
  onOpenConsent: () => void;
  onCloseConsent: () => void;
  onConsentGranted: () => void;
  onPhotos: (picked: readonly Photo[]) => void;
}

export function IntroView({
  photos,
  remaining,
  consentOpen,
  consented,
  onOpenConsent,
  onCloseConsent,
  onConsentGranted,
  onPhotos,
}: IntroViewProps) {
  const t = useT();
  const p = t.magazine.diagnose;
  const picker = useBodyPhotoPicker({ limit: SLOT_ORDER.length, onPicked: onPhotos });
  // 안내 팝업은 화면 진입 시에도 뜬다. 그때는 동의해도 선택기를 열면 안 되므로
  // "사진 선택을 누르다 막힌 경우"인지 따로 기억한다.
  const [pickAfterConsent, setPickAfterConsent] = useState(false);

  function openPicker() {
    if (!consented) {
      setPickAfterConsent(true);
      onOpenConsent();
      return;
    }
    void picker.open();
  }

  function handleConsentCancel() {
    setPickAfterConsent(false);
    onCloseConsent();
  }

  function handleConsentAgree() {
    onConsentGranted();
    if (!pickAfterConsent) return;
    setPickAfterConsent(false);
    // Defer to next tick so the modal unmounts (releasing body scroll lock)
    // before the picker takes over.
    setTimeout(() => void picker.open(), 0);
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

        <SlotStrip photos={photos} labels={slotLabel} />

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

      {picker.input}

      <BottomBar>
        <button
          type="button"
          onClick={openPicker}
          className={cn(BOTTOM_CTA_CLASS, 'text-brand-gray900')}
        >
          {p.picker.selectButton}
        </button>
      </BottomBar>

      {consentOpen ? (
        <ConsentModal onCancel={handleConsentCancel} onAgree={handleConsentAgree} />
      ) : null}
    </div>
  );
}

const SLOT_GUIDE_IMAGE: Record<Slot, string> = {
  front: '/magazine/personal-body-type/guide-front.webp',
  side: '/magazine/personal-body-type/guide-side.webp',
  back: '/magazine/personal-body-type/guide-back.webp',
};

/**
 * 촬영 가이드용 예시 이미지 띠. 사진 선택은 하단 버튼에서만 하므로 탭할 수 없고,
 * 고른 사진이 있는 슬롯만 예시 대신 그 사진을 보여준다.
 */
function SlotStrip({ photos, labels }: { photos: Photos; labels: Record<Slot, string> }) {
  return (
    <div className="px-4">
      <div className="flex overflow-hidden rounded-2xl">
        {SLOT_ORDER.map((slot) => {
          const photo = photos[slot];
          return (
            <div key={slot} className="relative h-[180px] flex-1 overflow-hidden bg-brand-gray200">
              <img
                src={photo?.previewUrl ?? SLOT_GUIDE_IMAGE[slot]}
                alt={photo ? '' : labels[slot]}
                className="h-full w-full object-cover"
              />
              {photo ? null : (
                <span className="absolute inset-x-0 bottom-0 bg-black/35 py-1 text-center text-sm font-medium text-brand-gray50">
                  {labels[slot]}
                </span>
              )}
            </div>
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

function TopBar({ backHref, backAria }: { backHref: string; backAria: string }) {
  return (
    <div className="flex items-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
      <Link
        href={backHref}
        data-swipe-back
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
    // 버튼 색을 바깥 바에 칠해야 홈 인디케이터 영역(safe-area)까지 버튼으로 채워진다.
    <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-brand-pink50 pb-[env(safe-area-inset-bottom,0px)]">
      {children}
    </div>
  );
}
