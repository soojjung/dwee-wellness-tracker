'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { BinIcon } from '@/components/ui/icons';
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
  /**
   * 편집 모드 전용 — 넘기면 하단에 "일정 유형 삭제" 버튼이 뜬다 (Figma 873:5374, 012_10 ⑤).
   * 지울 수 없는 상황(마지막 하나 남은 유형)에서는 부모가 넘기지 않는다.
   */
  onDelete?: () => Promise<void> | void;
}

export function EventCategoryFormSheet({
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: EventCategoryFormSheetProps) {
  const t = useT();
  const [name, setName] = useState(initial?.name ?? '');
  const [colorId, setColorId] = useState<ColorPaletteId>(initial?.colorId ?? 'pink');
  const [submitting, setSubmitting] = useState(false);

  const trimmed = name.trim();
  const isDirty = !initial || trimmed !== initial.name || colorId !== initial.colorId;
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

  // 정의서대로 확인 팝업 없이 바로 지운다. 닫고 일정 시트로 돌아가는 건 부모 몫.
  async function handleDelete() {
    if (submitting || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete();
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
        <header className="relative flex items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.report.diary.categorySheet.close}
            className="grid size-9 place-items-center rounded-full bg-brand-gray100 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden
            >
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
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

        {mode === 'edit' && onDelete ? (
          <div className="flex shrink-0 justify-center pb-[calc(40px+env(safe-area-inset-bottom,0px))] pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              // EventFormSheet 의 "일정 및 기록 삭제"와 같은 알약. 높이는 시안 값(873:5628, 49px).
              className="flex h-[49px] items-center gap-1 rounded-[40px] bg-brand-gray400/50 px-7 text-lg font-medium text-brand-red backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60"
            >
              <BinIcon className="size-[18px]" />
              <span>{t.report.diary.categorySheet.delete}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
