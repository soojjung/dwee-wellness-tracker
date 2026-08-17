'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/Button';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { defaultPeriodEndDate } from '@/domain/cycle/recordPolicy';
import { formatMonthLabel, fromISO } from '@/lib/date';
import { ChevronDownIcon } from '@/components/ui/icons';
import { InlineDatePicker } from '@/components/diary/InlineDatePicker';
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

type ExpandedField = 'none' | 'start' | 'end';

export function LogEntryDialog({
  today,
  defaultPeriodLength,
  onClose,
  onSaved,
}: LogEntryDialogProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const addPeriod = usePeriodStore((s) => s.add);
  const upsertCondition = useConditionStore((s) => s.upsert);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(() =>
    defaultPeriodEndDate(today, defaultPeriodLength),
  );
  const [endDirty, setEndDirty] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedField>('none');

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

  useBodyScrollLock();
  useEscToClose(handleClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-md flex-col rounded-t-3xl bg-brand-gray200 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4">
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

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {/* Period date card — matches EventFormSheet's date rows: tap
              label to expand an inline calendar underneath, pink accent
              on the active row. Replaces the native `<input type="date">`
              browser picker which read as raw / unstyled. */}
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <DateRow
              label={t.home.startPeriodStartLabel}
              value={startDate}
              locale={locale}
              expanded={expanded === 'start'}
              onToggle={() =>
                setExpanded((v) => (v === 'start' ? 'none' : 'start'))
              }
            />
            {expanded === 'start' ? (
              <InlineDatePicker
                selectedDate={startDate}
                maxDate={today}
                onSelect={(d) => {
                  handleStartChange(d);
                  setExpanded('none');
                }}
              />
            ) : null}
            <div className="border-t border-brand-gray300" />
            <DateRow
              label={t.home.startPeriodEndLabel}
              value={endDate}
              locale={locale}
              expanded={expanded === 'end'}
              onToggle={() =>
                setExpanded((v) => (v === 'end' ? 'none' : 'end'))
              }
            />
            {expanded === 'end' ? (
              <InlineDatePicker
                selectedDate={endDate}
                minDate={startDate}
                onSelect={(d) => {
                  handleEndChange(d);
                  setExpanded('none');
                }}
              />
            ) : null}
          </div>

          <section className="space-y-4 rounded-2xl bg-brand-white p-4">
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
              className="min-h-[72px] w-full resize-none rounded-2xl border border-brand-gray300 px-4 py-3 text-sm text-brand-gray900 placeholder:text-brand-gray600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2"
            />
          </section>
        </div>

        <footer className="flex gap-2 border-t border-brand-gray300 bg-brand-gray200 px-6 py-4">
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

interface DateRowProps {
  label: string;
  value: string;
  locale: 'en' | 'ko';
  expanded: boolean;
  onToggle: () => void;
}

function DateRow({ label, value, locale, expanded, onToggle }: DateRowProps) {
  const formatted = formatDateShort(value, locale);
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
    >
      <span className="text-sm text-brand-gray700">{label}</span>
      <span
        className={
          'flex items-center gap-2 text-base font-medium ' +
          (expanded ? 'text-brand-pink300' : 'text-brand-gray900')
        }
      >
        <span>{formatted}</span>
        <ChevronDownIcon
          className={
            'h-2 w-3 transition-transform ' + (expanded ? 'rotate-180' : '')
          }
        />
      </span>
    </button>
  );
}

function formatDateShort(iso: string, locale: 'en' | 'ko'): string {
  const d = fromISO(iso);
  if (locale === 'ko') {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  }
  return `${formatMonthLabel(d, 'en')} ${d.getDate()}`;
}
