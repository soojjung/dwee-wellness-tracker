'use client';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';
import { BOTTOM_CTA_CLASS } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { PickedPhoto } from './useBodyPhotoPicker';

interface PhotoPreviewViewProps {
  photos: readonly PickedPhoto[];
  onBack: () => void;
  onReplace: () => void;
  onStart: () => void;
  /** 웹 폴백용 숨은 file input (useBodyPhotoPicker 가 내려준다). */
  pickerInput: React.ReactNode;
}

/**
 * 고른 사진을 크게 확인하는 화면. 안내 화면의 예시 이미지 자리에 끼워 넣으면
 * 작아서 확인이 안 되므로, 선택 직후 이 화면으로 넘어온다.
 *
 * 여러 장을 골랐으면 가로로 넘겨 본다 — 다음 장이 살짝 걸쳐 보여 넘길 수 있다는
 * 걸 알린다.
 */
export function PhotoPreviewView({
  photos,
  onBack,
  onReplace,
  onStart,
  pickerInput,
}: PhotoPreviewViewProps) {
  const t = useT();
  const p = t.magazine.diagnose;

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand-gray50 pb-[calc(88px+env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center px-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={p.backToArticle}
          className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <BackIcon className="size-10" />
        </button>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-14 pt-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {photos.map((photo) => (
          <div
            key={photo.previewUrl}
            className="h-[422px] w-[278px] shrink-0 snap-center overflow-hidden rounded-2xl bg-brand-gray200"
          >
            <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <button
          type="button"
          onClick={onReplace}
          className="flex items-center gap-2 rounded-full bg-brand-gray300 px-5 py-3 text-base font-medium leading-normal text-brand-gray900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <PhotoIcon />
          {p.picker.replaceButton}
        </button>
      </div>

      {pickerInput}

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-brand-gray900 pb-[env(safe-area-inset-bottom,0px)]">
        <button
          type="button"
          onClick={onStart}
          className={cn(BOTTOM_CTA_CLASS, 'text-brand-pink100')}
        >
          {p.picker.startButton}
        </button>
      </div>
    </div>
  );
}

function PhotoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.5" />
      <path d="M21 16l-5-5-4.5 4.5" />
    </svg>
  );
}
