'use client';
import { useT } from '@/i18n/useT';
import { useEscToClose } from '@/hooks/useEscToClose';

interface AddQuickSheetProps {
  onSelectPeriod: () => void;
  onSelectEvent: () => void;
  onClose: () => void;
}

/**
 * Figma 2682:15620 — small popover anchored under the diary header's +
 * button. Two rows: 생리일 기록 (routes to `LogEntryDialog`) / 일정 등록
 * (routes to `EventFormSheet`). Tap outside or ESC to dismiss. No body
 * scroll lock: the calendar underneath stays interactive-looking but the
 * backdrop still catches taps to close.
 */
export function AddQuickSheet({
  onSelectPeriod,
  onSelectEvent,
  onClose,
}: AddQuickSheetProps) {
  const t = useT();
  useEscToClose(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.quickAdd.title}
      className="fixed inset-0 z-40"
      onClick={onClose}
    >
      {/* Anchor the popover under the header's + button (px-4 gutter,
          header height ~96px). max-w-md matches the mobile shell so the
          anchor lines up on desktop preview widths too. */}
      <div className="mx-auto flex w-full max-w-md justify-end px-4">
        <div
          className="mt-24 flex w-44 flex-col overflow-hidden rounded-2xl bg-brand-white shadow-[0_8px_24px_0_rgba(0,0,0,0.12)] ring-1 ring-brand-gray200"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onSelectPeriod}
            className="flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-brand-gray900 hover:bg-brand-gray100 focus-visible:outline-none focus-visible:bg-brand-gray100"
          >
            <WaterdropIcon />
            <span>{t.report.diary.quickAdd.period}</span>
          </button>
          <div className="border-t border-brand-gray200" />
          <button
            type="button"
            onClick={onSelectEvent}
            className="flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-brand-gray900 hover:bg-brand-gray100 focus-visible:outline-none focus-visible:bg-brand-gray100"
          >
            <CalendarIcon />
            <span>{t.report.diary.quickAdd.event}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function WaterdropIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 text-brand-gray900"
      aria-hidden
    >
      <path d="M10.29 3.96c.78-1.28 2.64-1.27 3.42 0l4.35 7.12c1.58 2.6 1.13 5.87-1.11 7.98-2.74 2.59-7.17 2.59-9.9 0-2.24-2.12-2.7-5.39-1.11-7.98l4.35-7.12z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5 text-brand-gray900"
      aria-hidden
    >
      <path d="M20 11.63a1 1 0 0 1 1 1v4.52a2.95 2.95 0 0 1-3 2.95H6a2.95 2.95 0 0 1-3-2.95v-4.52a1 1 0 0 1 1-1h16zM16.5 3.9c.83 0 1.5.66 1.5 1.47v1.47a2.95 2.95 0 0 1 3 2.95c0 .4-.33.73-.74.73H3.74A.73.73 0 0 1 3 9.79 2.95 2.95 0 0 1 6 6.85V5.37c0-.81.67-1.47 1.5-1.47.83 0 1.5.66 1.5 1.47v1.47h6V5.37c0-.81.67-1.47 1.5-1.47z" />
    </svg>
  );
}
