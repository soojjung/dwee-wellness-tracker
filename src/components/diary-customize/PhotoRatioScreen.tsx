'use client';
import { useT } from '@/i18n/useT';
import { useEscToClose } from '@/hooks/useEscToClose';
import type { StickerRatio } from '@/types';

interface PhotoRatioScreenProps {
  previewUrl: string | null;
  value: StickerRatio;
  onChange: (v: StickerRatio) => void;
  /** Circular-arrow button — steps back to the import sheet. */
  onBack: () => void;
  /** Header X — abandons the whole import flow. */
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

// Figma 013_5 (256:18016): the preview box is a 358px square at 1:1, and the
// portrait option is fitted into the same footprint so the controls below it
// never shift.
const PREVIEW_BOX_PX = 358;

const RATIO_ORDER: readonly StickerRatio[] = ['1:1', '4:3'];

/**
 * 013_5 — full-screen ratio picker reached from the album import sheet after
 * the user chooses "use the photo as is".
 */
export function PhotoRatioScreen({
  previewUrl,
  value,
  onChange,
  onBack,
  onClose,
  onConfirm,
  submitting,
}: PhotoRatioScreenProps) {
  const t = useT();
  const c = t.report.diary.photoImport;
  useEscToClose(() => {
    if (!submitting) onClose();
  });

  // "4:3" label maps to portrait 3:4 (the Figma preview shows taller frames).
  const aspectRatio = value === '1:1' ? '1 / 1' : '3 / 4';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      className="fixed inset-0 z-50 bg-brand-white"
    >
      <div className="mx-auto flex h-full w-full max-w-md flex-col">
        <header className="relative flex shrink-0 items-center justify-end px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <h2 className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[20px] font-semibold leading-none text-brand-gray900">
            {c.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label={c.close}
            className="flex size-10 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <svg viewBox="0 0 40 40" className="size-full" fill="none" aria-hidden>
              <path
                d="M14 14L26 26M26 14L14 26"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-4">
          <div
            className="flex w-full items-center justify-center"
            style={{ height: PREVIEW_BOX_PX }}
          >
            <div
              className="h-full max-w-full overflow-hidden rounded-2xl bg-brand-gray200"
              style={{ aspectRatio }}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-[45px] pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))]">
          <div
            role="radiogroup"
            aria-label={c.ratioTitle}
            className="flex items-center rounded-full border border-brand-gray200 px-[3px]"
          >
            {RATIO_ORDER.map((r) => {
              const active = r === value;
              return (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(r)}
                  className={
                    'min-w-[78px] whitespace-nowrap rounded-full px-[18px] py-2.5 text-center text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
                    (active
                      ? 'bg-brand-pink50 font-semibold text-brand-gray900'
                      : 'text-brand-gray600')
                  }
                >
                  {r === '1:1' ? c.ratio1x1 : c.ratio4x3}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-[60px] py-3.5">
            <button
              type="button"
              onClick={onBack}
              disabled={submitting}
              aria-label={c.back}
              className="flex size-[55px] items-center justify-center rounded-full bg-brand-gray300 text-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
            >
              <RetakeGlyph />
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              aria-label={c.confirm}
              className="flex size-[55px] items-center justify-center rounded-full bg-brand-pink200 text-brand-pink50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:opacity-60"
            >
              <svg viewBox="0 0 55 55" className="size-full" fill="none" aria-hidden>
                <path
                  d="M16.5 26.4526L24.5 34.8335L38.5 20.1668"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Circular-arrow glyph traced from the exported Figma button (256:18028). */
function RetakeGlyph() {
  return (
    <svg viewBox="0 0 55 55" className="size-full" aria-hidden>
      <path
        fill="currentColor"
        d="M28.3137 14.2912C30.1006 14.3361 31.477 14.5323 32.7092 14.9328C33.9446 15.3344 34.968 15.9196 36.0607 16.6496C38.3629 18.1877 40.1574 20.3741 41.217 22.9318C42.2766 25.4896 42.554 28.3044 42.0139 31.0197C41.4737 33.7348 40.1405 36.2292 38.1828 38.1867C36.225 40.1443 33.7294 41.4776 31.0139 42.0178C28.2985 42.5577 25.4838 42.2801 22.926 41.2209C20.3679 40.1615 18.1811 38.3675 16.6428 36.0656C15.1772 33.8726 14.2834 32.1202 14.2834 29.2473C14.2834 28.5622 14.8386 28.007 15.5236 28.007C16.2086 28.0072 16.7638 28.5623 16.7639 29.2473C16.7639 31.4203 17.367 32.6841 18.7053 34.6867C19.971 36.5806 21.7704 38.0572 23.8752 38.9289C25.9799 39.8004 28.2962 40.0285 30.5305 39.5842C32.7647 39.1397 34.8171 38.0424 36.4279 36.4318C38.0387 34.8212 39.1359 32.7692 39.5803 30.5353C40.0247 28.3014 39.7968 25.9854 38.925 23.881C38.0533 21.7769 36.5768 19.9785 34.6828 18.7131C33.6777 18.0416 32.8699 17.5936 31.9426 17.2922C31.0119 16.9897 29.8917 16.8128 28.2522 16.7717C25.5559 16.704 23.2147 17.5981 18.3352 21.6086L22.7512 21.8977C23.4348 21.9422 23.9529 22.5325 23.9084 23.216C23.8638 23.8996 23.2736 24.4177 22.59 24.3732L15.5022 23.9103C14.8186 23.8657 14.3013 23.2756 14.3459 22.592L14.8078 15.5051C14.8524 14.8214 15.4425 14.3033 16.1262 14.3478C16.8097 14.3925 17.3279 14.9827 17.2834 15.6662L17.0344 19.468C21.8749 15.525 24.7723 14.2025 28.3137 14.2912Z"
      />
    </svg>
  );
}
