'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import type { ColorPaletteId, EventCategory } from '@/types';
import { ColorPaletteSelector } from './ColorPaletteSelector';

export type CategoryFormMode = 'add' | 'edit';

export interface CategoryFormInput {
  name: string;
  colorId: ColorPaletteId;
}

interface EventCategoryFormSheetProps {
  mode: CategoryFormMode;
  initial?: EventCategory | null;
  onClose: () => void;
  onSubmit: (input: CategoryFormInput) => Promise<boolean>;
}

export function EventCategoryFormSheet({
  mode,
  initial,
  onClose,
  onSubmit,
}: EventCategoryFormSheetProps) {
  const t = useT();
  const [name, setName] = useState(initial?.name ?? '');
  const [colorId, setColorId] = useState<ColorPaletteId>(initial?.colorId ?? 'pink');
  const [submitting, setSubmitting] = useState(false);

  const trimmed = name.trim();
  const isDirty =
    !initial || trimmed !== initial.name || colorId !== initial.colorId;
  const canSave = !submitting && trimmed.length > 0 && isDirty;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSave() {
    if (!canSave) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({ name: trimmed, colorId });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  useBodyScrollLock();
  useEscToClose(handleClose);

  const title =
    mode === 'edit'
      ? t.report.diary.categorySheet.editTitle
      : t.report.diary.categorySheet.addTitle;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col bg-brand-gray200"
      onClick={handleClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col self-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Figma 012_9 header: matches EventFormSheet — circular X (left),
            centered title, circular ✓ (right — pink200 when canSave,
            gray400 when disabled). */}
        <header className="relative flex items-center justify-between px-4 pt-4 pb-3">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.report.diary.categorySheet.close}
            className="grid size-9 place-items-center rounded-full bg-brand-gray100 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-brand-gray900">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleSave}
            aria-label={t.report.diary.categorySheet.save}
            disabled={!canSave}
            className={
              'grid size-9 place-items-center rounded-full text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (canSave ? 'bg-brand-pink200' : 'bg-brand-gray400')
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.report.diary.categorySheet.namePlaceholder}
              className="block w-full bg-transparent px-4 py-3 text-base font-medium text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none"
            />
          </div>

          <ColorPaletteSelector selectedId={colorId} onSelect={setColorId} />
        </div>
      </div>
    </div>
  );
}
