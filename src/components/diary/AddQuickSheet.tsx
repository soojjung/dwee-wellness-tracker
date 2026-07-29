'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

interface AddQuickSheetProps {
  onSelectPeriod: () => void;
  onSelectEvent: () => void;
  onClose: () => void;
}

export function AddQuickSheet({
  onSelectPeriod,
  onSelectEvent,
  onClose,
}: AddQuickSheetProps) {
  const t = useT();
  useBodyScrollLock();
  useEscToClose(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.quickAdd.title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col gap-2 rounded-t-3xl bg-brand-white p-4 pb-8 shadow-[0_-8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onSelectPeriod}
          className="rounded-2xl bg-brand-pink50 px-4 py-4 text-left text-base font-medium text-brand-pink800 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800"
        >
          {t.report.diary.quickAdd.period}
        </button>
        <button
          type="button"
          onClick={onSelectEvent}
          className="rounded-2xl bg-brand-gray200 px-4 py-4 text-left text-base font-medium text-brand-gray900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          {t.report.diary.quickAdd.event}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-2xl px-4 py-3 text-sm font-medium text-brand-gray700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          {t.report.diary.quickAdd.close}
        </button>
      </div>
    </div>
  );
}
