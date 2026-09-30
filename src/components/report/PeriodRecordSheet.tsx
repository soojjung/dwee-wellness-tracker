'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useConditionStore } from '@/store/conditionStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { useApplyPeriodChanges } from '@/hooks/useApplyPeriodChanges';
import { useConditionSelection } from '@/hooks/useConditionSelection';
import { HeaderCancelGlyph, HeaderCheckGlyph } from '@/components/ui/icons';
import { EventConditionSection } from '@/components/log/EventConditionSection';
import { addRange, computeChanges, toDrafts } from '@/domain/cycle/periodEdit';
import { defaultPeriodEndDate } from '@/domain/cycle/recordPolicy';
import {
  rangeBounds,
  tapRangeDate,
  type PeriodRangeSelection,
} from '@/domain/cycle/periodRangeSelection';
import type { ISODate } from '@/lib/date';
import type { PeriodLog } from '@/types';
import { PeriodRangeCalendar } from './PeriodRangeCalendar';

interface PeriodRecordSheetProps {
  today: ISODate;
  periods: PeriodLog[];
  onClose: () => void;
}

/**
 * "생리 기록 / Log period" — opened from the cycle report's period-add icon
 * (Figma 947:7835 / 947:7336). Unlike `PeriodSelectSheet`, this only ADDS a
 * new period range and optionally logs TODAY's condition alongside it; it
 * never edits or removes existing records (that stays on Home).
 */
export function PeriodRecordSheet({ today, periods, onClose }: PeriodRecordSheetProps) {
  const t = useT();
  const averagePeriodLength = useSettingsStore((s) => s.settings.averagePeriodLength);
  const applyPeriodChanges = useApplyPeriodChanges();

  const conditionByDate = useConditionStore((s) => s.byDate);
  const hydrateConditionRange = useConditionStore((s) => s.hydrateRange);
  const upsertCondition = useConditionStore((s) => s.upsert);
  const condition = useConditionSelection(null);
  const seededConditionRef = useRef(false);

  const [selection, setSelection] = useState<PeriodRangeSelection | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hydrateConditionRange(today, today);
    // Runs once on mount — a fixed one-day range for "today" never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const existing = conditionByDate[today];
    if (!existing || seededConditionRef.current) return;
    seededConditionRef.current = true;
    condition.seed(existing);
    // `condition` is a fresh object every render; only re-seed when the
    // hydrated log for today actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conditionByDate, today]);

  const canSave = selection !== null && !submitting;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSave() {
    if (!canSave || !selection) return;
    setSubmitting(true);
    try {
      const { lo, hi } = rangeBounds(selection);
      const end = hi ?? defaultPeriodEndDate(lo, averagePeriodLength);
      const changes = computeChanges(periods, addRange(toDrafts(periods), lo, end, 'new'));
      await applyPeriodChanges(changes);
      const picked = condition.toSelection();
      if (picked) await upsertCondition({ date: today, ...picked });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  useBodyScrollLock();
  useEscToClose(handleClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.report.diary.periodRecordSheet.title}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      <div
        className="flex h-[calc(100dvh-120px-env(safe-area-inset-top,0px))] w-full max-w-md flex-col rounded-t-[32px] bg-brand-gray200 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:h-auto sm:max-h-[90vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            aria-label={t.report.diary.periodRecordSheet.closeAria}
            disabled={submitting}
            onClick={handleClose}
            className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
          >
            <HeaderCancelGlyph className="size-10" />
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold text-brand-gray900">
            {t.report.diary.periodRecordSheet.title}
          </h2>
          <button
            type="button"
            aria-label={t.report.diary.periodRecordSheet.saveAria}
            disabled={!canSave}
            onClick={() => void handleSave()}
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

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 pt-2">
          <div className="flex flex-col gap-[18px] rounded-2xl bg-brand-white px-4 py-3.5">
            <h3 className="text-base font-normal text-brand-gray600">
              {t.report.diary.periodRecordSheet.periodDaysLabel}
            </h3>
            <PeriodRangeCalendar
              today={today}
              periods={periods}
              selection={selection}
              onTapDate={(date) => setSelection((s) => tapRangeDate(s, date))}
            />
          </div>

          <EventConditionSection
            mood={condition.mood}
            energy={condition.energy}
            pain={condition.pain}
            bloating={condition.bloating}
            appetite={condition.appetite}
            skin={condition.skin}
            sleep={condition.sleep}
            exercise={condition.exercise}
            onChangeMood={condition.setMood}
            onChangeEnergy={condition.setEnergy}
            onChangePain={condition.setPain}
            onChangeBloating={condition.setBloating}
            onChangeAppetite={condition.setAppetite}
            onChangeSkin={condition.setSkin}
            onChangeSleep={condition.setSleep}
            onChangeExercise={condition.setExercise}
          />
        </div>
      </div>
    </div>
  );
}
