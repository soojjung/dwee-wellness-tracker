'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { useApplyPeriodChanges } from '@/hooks/useApplyPeriodChanges';
import { addDaysISO, type ISODate } from '@/lib/date';
import { BinIcon, HeaderCancelGlyph, HeaderCheckGlyph } from '@/components/ui/icons';
import { DateRow } from '@/components/ui/DateRow';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { InlineDatePicker } from '@/components/diary/InlineDatePicker';
import {
  FUTURE_WINDOW_DAYS,
  computeChanges,
  replaceDraftRange,
  toDrafts,
} from '@/domain/cycle/periodEdit';
import type { PeriodLog } from '@/types';

// 한 번의 생리로 셀 수 있는 최대 기간 (domain/cycle/aggregate 의 14일 이상치 선과 같다).
const MAX_PERIOD_DAYS = 14;

interface PeriodEditSheetProps {
  today: ISODate;
  period: PeriodLog;
  periods: PeriodLog[];
  onClose: () => void;
}

/** 주기 리포트 "최근 주기 기록"의 한 줄을 눌렀을 때 — 시작일·종료일 수정과 삭제 (R5-7). */
export function PeriodEditSheet({ today, period, periods, onClose }: PeriodEditSheetProps) {
  const t = useT();
  const c = t.report.diary.periodEditSheet;
  const locale = useSettingsStore((s) => s.settings.locale);
  const updatePeriod = usePeriodStore((s) => s.update);
  const applyPeriodChanges = useApplyPeriodChanges();
  const [start, setStart] = useState<ISODate>(period.startDate);
  // 종료일 없는(진행 중) 기록은 건드리지 않으면 진행 중으로 남긴다.
  const [end, setEnd] = useState<ISODate | null>(period.endDate ?? null);
  const [expanded, setExpanded] = useState<'none' | 'start' | 'end'>('none');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const maxSelectable = addDaysISO(today, FUTURE_WINDOW_DAYS);
  const endMax = [addDaysISO(start, MAX_PERIOD_DAYS - 1), maxSelectable].sort()[0]!;
  const dirty = start !== period.startDate || end !== (period.endDate ?? null);
  const canSave = dirty && !submitting;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function run(action: () => Promise<void>) {
    setSubmitting(true);
    try {
      await action();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  function handleSave() {
    if (!canSave) return;
    void run(async () => {
      if (end === null) {
        await updatePeriod(period.id, { startDate: start });
        return;
      }
      const drafts = replaceDraftRange(toDrafts(periods), period.id, start, end);
      await applyPeriodChanges(computeChanges(periods, drafts));
    });
  }

  useBodyScrollLock();
  // 삭제 확인 팝업이 떠 있는 동안 Esc 는 팝업 몫 — 둘 다 받으면 시트까지 닫힌다.
  useEscToClose(handleClose, !confirmingDelete);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[calc(100dvh-120px-env(safe-area-inset-top,0px))] w-full max-w-md flex-col rounded-t-[32px] bg-brand-gray200 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:max-w-[416px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            aria-label={c.closeAria}
            disabled={submitting}
            onClick={handleClose}
            className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
          >
            <HeaderCancelGlyph className="size-10" />
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold text-brand-gray900">
            {c.title}
          </h2>
          <button
            type="button"
            aria-label={c.saveAria}
            disabled={!canSave}
            onClick={handleSave}
            className={
              'grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (canSave
                ? 'bg-brand-pink200 text-brand-pink50'
                : 'bg-brand-gray400 text-brand-gray200')
            }
          >
            <HeaderCheckGlyph className="size-10" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-2">
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <DateRow
              label={c.startDate}
              value={start}
              locale={locale}
              expanded={expanded === 'start'}
              onToggle={() => setExpanded((v) => (v === 'start' ? 'none' : 'start'))}
            />
            {expanded === 'start' ? (
              <InlineDatePicker
                selectedDate={start}
                maxDate={end ?? maxSelectable}
                onSelect={setStart}
              />
            ) : null}
            <div className="border-t border-brand-gray300" />
            <DateRow
              label={c.endDate}
              value={end ?? ''}
              emptyLabel={t.report.row.ongoing}
              locale={locale}
              expanded={expanded === 'end'}
              onToggle={() => setExpanded((v) => (v === 'end' ? 'none' : 'end'))}
            />
            {expanded === 'end' ? (
              <InlineDatePicker
                selectedDate={end ?? start}
                minDate={start}
                maxDate={endMax}
                onSelect={setEnd}
              />
            ) : null}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={submitting}
              className="flex items-center gap-1 rounded-[40px] bg-brand-gray400/50 px-5 py-2.5 text-sm font-medium text-brand-red backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60"
            >
              <BinIcon className="size-3.5" />
              <span>{c.delete}</span>
            </button>
          </div>
        </div>
      </div>

      {confirmingDelete ? (
        // 팝업 바깥(백드롭) 탭이 시트의 handleClose 까지 올라가 시트를 닫지 않게 막는다.
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmDialog
            titleId="delete-period-dialog-title"
            title={c.deleteConfirm}
            cancelLabel={c.cancel}
            confirmLabel={c.confirm}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() =>
              void run(() => applyPeriodChanges([{ kind: 'remove', id: period.id }]))
            }
            submitting={submitting}
            zIndex={50}
          />
        </div>
      ) : null}
    </div>
  );
}
