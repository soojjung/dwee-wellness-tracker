'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { useEventStore } from '@/store/eventStore';
import { fromISO } from '@/lib/date';
import type { EventLog, EventCategory } from '@/types';
import { BackIcon } from '@/components/ui/icons';
import { CategoryChip } from './CategoryChip';

interface EventDetailSheetProps {
  event: EventLog;
  category: EventCategory | undefined;
  onClose: () => void;
  onEdit: () => void;
}

export function EventDetailSheet({
  event,
  category,
  onClose,
  onEdit,
}: EventDetailSheetProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const removeEvent = useEventStore((s) => s.removeEvent);
  const linkPeriodMark = useEventStore((s) => s.linkPeriodMark);
  const unlinkPeriodMark = useEventStore((s) => s.unlinkPeriodMark);
  const [busy, setBusy] = useState(false);

  useBodyScrollLock();
  useEscToClose(onClose);

  const dateLabel = formatFullDate(event.startDate, locale);

  async function handleTogglePeriod() {
    if (busy) return;
    setBusy(true);
    try {
      if (event.hasPeriodMark) {
        await unlinkPeriodMark(event.id);
      } else {
        await linkPeriodMark(event.id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy) return;
    if (typeof window !== 'undefined' && !window.confirm(t.report.diary.eventDetail.deleteConfirm)) {
      return;
    }
    setBusy(true);
    try {
      await removeEvent(event.id);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.eventDetail.edit}
      className="fixed inset-0 z-40 flex flex-col bg-brand-gray200"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col self-center"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 pb-3 pt-safe">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.report.diary.eventDetail.back}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <BackIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-brand-gray400/40 px-4 py-1.5 text-sm font-medium text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            {t.report.diary.eventDetail.edit}
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
          <h1 className="text-2xl font-semibold leading-tight text-brand-gray900">
            {dateLabel}
          </h1>

          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <div className="border-b border-brand-gray300 px-4 py-3">
              <p className="text-base font-semibold text-brand-gray900">
                {event.title}
              </p>
            </div>
            {event.memo ? (
              <div className="px-4 py-3">
                <p className="whitespace-pre-wrap text-sm text-brand-gray800">
                  {event.memo}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-brand-white px-4 py-3">
            <span className="text-sm text-brand-gray700">
              {t.report.diary.eventSheet.category}
            </span>
            {category ? (
              <CategoryChip name={category.name} colorId={category.colorId} />
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-brand-white px-4 py-3">
            <span className="text-sm text-brand-gray700">
              {t.report.diary.eventDetail.periodToggle}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={event.hasPeriodMark}
              onClick={handleTogglePeriod}
              disabled={busy}
              className={
                'relative h-6 w-11 rounded-full transition-colors ' +
                (event.hasPeriodMark ? 'bg-brand-pink300' : 'bg-brand-gray400')
              }
            >
              <span
                aria-hidden
                className={
                  'absolute top-0.5 h-5 w-5 rounded-full bg-brand-white shadow transition-transform ' +
                  (event.hasPeriodMark ? 'translate-x-[22px]' : 'translate-x-0.5')
                }
              />
            </button>
          </div>
        </div>

        <footer className="flex justify-center pb-6 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-brand-white px-5 py-2 text-sm font-medium text-brand-pink600 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink600 disabled:opacity-60"
          >
            <TrashIcon />
            <span>{t.report.diary.eventDetail.delete}</span>
          </button>
        </footer>
      </div>
    </div>
  );
}

function formatFullDate(iso: string, locale: 'en' | 'ko'): string {
  const d = fromISO(iso);
  return locale === 'ko'
    ? format(d, 'yyyy년 M월 d일 EEEE', { locale: ko })
    : format(d, 'EEEE, MMM d, yyyy');
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M2.5 4.5h11m-9 0v-1a1 1 0 011-1h4a1 1 0 011 1v1m-6 0v9a1 1 0 001 1h6a1 1 0 001-1v-9M6.5 7v5m3-5v5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
