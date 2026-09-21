'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { useObjectUrl } from '@/hooks/useObjectUrl';
import type { StickerRatio } from '@/types';
import type { CameraMode } from './CameraSheet';
import { HeaderCancelGlyph, HeaderCheckGlyph } from '@/components/ui/icons';
import { PhotoRatioScreen } from './PhotoRatioScreen';
import { cropToRatio, ratioForImage } from '@/lib/image/stickerCrop';

interface PhotoImportModalProps {
  file: File;
  onClose: () => void;
  /**
   * Fires with the blob + ratio + mode. `mode: 'photo'` means "save as-is"
   * (already cropped to the chosen ratio); `mode: 'sticker'` means "run the
   * background removal cutout flow" and hands over the untouched original,
   * since cropping first can slice the subject the cutout is after.
   */
  onSaved: (blob: Blob, ratio: StickerRatio, mode: CameraMode) => Promise<void> | void;
}

/**
 * Album import sheet (013_7,8). Step 1 previews the picked photo and asks how
 * to turn it into a sticker, defaulting to "cut out". That option routes
 * straight to the scan screen; "use as is" hands over to the 013_5 ratio
 * screen before saving.
 */
type Step = 'mode' | 'ratio';

export function PhotoImportModal({ file, onClose, onSaved }: PhotoImportModalProps) {
  const t = useT();
  const c = t.report.diary.photoImport;
  // Rendering is gated on `previewUrl` being non-null.
  const previewUrl = useObjectUrl(file);

  const [step, setStep] = useState<Step>('mode');
  // Pre-selected on "cut out": it's the path most album picks are headed for,
  // so the done button starts enabled rather than inert.
  const [mode, setMode] = useState<CameraMode | null>('sticker');
  const [ratio, setRatio] = useState<StickerRatio>('1:1');
  const [submitting, setSubmitting] = useState(false);

  useBodyScrollLock();
  useEscToClose(() => {
    if (!submitting) onClose();
  });

  async function handleConfirm() {
    if (submitting || !mode) return;
    if (mode === 'sticker') {
      setSubmitting(true);
      try {
        await onSaved(file, await ratioForImage(file), 'sticker');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    if (step === 'mode') {
      setStep('ratio');
      return;
    }
    setSubmitting(true);
    try {
      const cropped = await cropToRatio(file, ratio);
      if (!cropped) return;
      await onSaved(cropped, ratio, 'photo');
    } finally {
      setSubmitting(false);
    }
  }

  const canConfirm = mode !== null && !submitting;

  if (step === 'ratio') {
    return (
      <PhotoRatioScreen
        previewUrl={previewUrl}
        value={ratio}
        onChange={setRatio}
        onBack={() => setStep('mode')}
        onClose={onClose}
        onConfirm={handleConfirm}
        submitting={submitting}
      />
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      className="fixed inset-0 z-50 flex bg-black/40"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90dvh' }}
        className="mx-auto mt-auto flex w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-brand-white"
      >
        <header className="flex shrink-0 items-center justify-between p-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={c.close}
            disabled={submitting}
            className="flex size-10 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <HeaderCancelGlyph className="size-full" />
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            aria-label={c.confirm}
            className={
              'flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (canConfirm
                ? 'bg-brand-pink200 text-brand-pink50'
                : 'bg-brand-gray300 text-brand-gray400')
            }
          >
            <HeaderCheckGlyph className="size-full" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-6 pt-5">
          <div className="h-[343px] w-full shrink-0 overflow-hidden rounded-2xl bg-brand-gray200">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div role="radiogroup" aria-label={c.title} className="flex flex-col gap-4">
            <OptionRow
              title={c.options.cutout.title}
              body={c.options.cutout.body}
              selected={mode === 'sticker'}
              onSelect={() => setMode('sticker')}
            />
            <OptionRow
              title={c.options.photo.title}
              body={c.options.photo.body}
              selected={mode === 'photo'}
              onSelect={() => setMode('photo')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface OptionRowProps {
  title: string;
  body: string;
  selected: boolean;
  onSelect: () => void;
}

/** Radio-style card from 413:6366 / 413:6372 — the selected one swaps its
 *  outline for a Pink/50 fill and its empty circle for a filled check. */
function OptionRow({ title, body, selected, onSelect }: OptionRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={
        'flex w-full items-start gap-3.5 rounded-lg px-5 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
        (selected ? 'bg-brand-pink50' : 'border border-brand-gray300')
      }
    >
      <span aria-hidden className="flex size-6 shrink-0 items-center justify-center">
        {selected ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-brand-gray900 text-brand-white">
            <svg viewBox="0 0 14 14" fill="none" className="size-3.5" aria-hidden>
              <path
                d="M3.18182 6.63636L5.95868 9.54545L10.8182 4.45455"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="size-6 text-brand-gray400" aria-hidden>
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" />
          </svg>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-base font-medium leading-none text-brand-gray900">{title}</span>
        <span className="text-sm leading-normal text-brand-gray600">{body}</span>
      </span>
    </button>
  );
}
