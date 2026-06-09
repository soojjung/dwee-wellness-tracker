'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { Button } from '@/components/ui/Button';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { defaultPeriodEndDate } from '@/domain/cycle/recordPolicy';
import {
  MOOD_VALUES,
  ENERGY_VALUES,
  PAIN_VALUES,
  BLOATING_VALUES,
  APPETITE_VALUES,
  SKIN_VALUES,
} from '@/constants/conditionOptions';
import type { Mood, Energy, Pain, Bloating, Appetite, Skin } from '@/types';
import { ConditionRow } from './ConditionRow';

const MEMO_MAX = 200;

interface LogEntryDialogProps {
  today: string;
  defaultPeriodLength: number;
  onClose: () => void;
  onSaved: () => void;
}

export function LogEntryDialog({
  today,
  defaultPeriodLength,
  onClose,
  onSaved,
}: LogEntryDialogProps) {
  const t = useT();
  const addPeriod = usePeriodStore((s) => s.add);
  const upsertCondition = useConditionStore((s) => s.upsert);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() =>
    defaultPeriodEndDate(today, defaultPeriodLength),
  );
  const [endDirty, setEndDirty] = useState(false);

  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [pain, setPain] = useState<Pain | null>(null);
  const [bloating, setBloating] = useState<Bloating | null>(null);
  const [appetite, setAppetite] = useState<Appetite | null>(null);
  const [skin, setSkin] = useState<Skin | null>(null);
  const [memo, setMemo] = useState('');

  const [submitting, setSubmitting] = useState(false);

  function handleStartChange(v: string) {
    setStartDate(v);
    if (!endDirty && v) {
      setEndDate(defaultPeriodEndDate(v, defaultPeriodLength));
    }
  }

  function handleEndChange(v: string) {
    setEndDate(v);
    setEndDirty(true);
  }

  const periodValid = !!startDate && !!endDate && startDate <= today && endDate >= startDate;
  const hasAnyCondition =
    !!(mood || energy || pain || bloating || appetite || skin || memo.trim());
  const disabled = submitting || !periodValid;

  async function handleSave() {
    setSubmitting(true);
    try {
      await addPeriod({ startDate, endDate });
      if (hasAnyCondition) {
        await upsertCondition({
          date: today,
          ...(mood ? { mood } : {}),
          ...(energy ? { energy } : {}),
          ...(pain ? { pain } : {}),
          ...(bloating ? { bloating } : {}),
          ...(appetite ? { appetite } : {}),
          ...(skin ? { skin } : {}),
          ...(memo.trim() ? { memo: memo.trim() } : {}),
        });
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-brand-white shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-brand-gray200 px-6 py-4">
          <h2 className="text-base font-semibold text-brand-gray900">
            {t.log.addEntryTitle}
          </h2>
          <button
            type="button"
            aria-label={t.home.cancel}
            disabled={submitting}
            onClick={handleClose}
            className="text-xl text-brand-gray800"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-brand-gray800">
              {t.log.periodSectionLabel}
            </h3>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-brand-gray800">
                {t.home.startPeriodStartLabel}
              </span>
              <input
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => handleStartChange(e.target.value)}
                className="h-11 w-full rounded-lg border border-brand-gray300 bg-brand-white px-3 text-base text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-brand-gray800">
                {t.home.startPeriodEndLabel}
              </span>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleEndChange(e.target.value)}
                className="h-11 w-full rounded-lg border border-brand-gray300 bg-brand-white px-3 text-base text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1"
              />
            </label>
          </section>

          <section className="mt-6 flex flex-col gap-4">
            <h3 className="text-sm font-medium text-brand-gray800">
              {t.log.conditionSectionLabel}
            </h3>
            <ConditionRow
              label={t.log.todayMood}
              values={MOOD_VALUES}
              labels={t.condition.mood}
              value={mood}
              onChange={setMood}
            />
            <ConditionRow
              label={t.log.todayEnergy}
              values={ENERGY_VALUES}
              labels={t.condition.energy}
              value={energy}
              onChange={setEnergy}
            />
            <ConditionRow
              label={t.log.todayPain}
              values={PAIN_VALUES}
              labels={t.condition.pain}
              value={pain}
              onChange={setPain}
            />
            <ConditionRow
              label={t.log.todayBloating}
              values={BLOATING_VALUES}
              labels={t.condition.bloating}
              value={bloating}
              onChange={setBloating}
            />
            <ConditionRow
              label={t.log.todayAppetite}
              values={APPETITE_VALUES}
              labels={t.condition.appetite}
              value={appetite}
              onChange={setAppetite}
            />
            <ConditionRow
              label={t.log.todaySkin}
              values={SKIN_VALUES}
              labels={t.condition.skin}
              value={skin}
              onChange={setSkin}
            />
            <textarea
              value={memo}
              maxLength={MEMO_MAX}
              placeholder={t.log.memoPlaceholder}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[72px] resize-none rounded-2xl border border-brand-gray300 px-4 py-3 text-sm text-brand-gray900 placeholder:text-brand-gray600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2"
            />
          </section>
        </div>

        <footer className="flex gap-2 border-t border-brand-gray200 px-6 py-4">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            disabled={submitting}
            onClick={handleClose}
          >
            {t.home.cancel}
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={disabled}
            onClick={handleSave}
          >
            {submitting ? t.log.saving : t.log.save}
          </Button>
        </footer>
      </div>
    </div>
  );
}
