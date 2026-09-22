'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { usePeriodStore } from '@/store/periodStore';
import { useConditionStore } from '@/store/conditionStore';
import { defaultPeriodEndDate, resolvePeriodEndOnStartChange } from '@/domain/cycle/recordPolicy';
import { DateRow } from '@/components/ui/DateRow';
import { InlineDatePicker } from '@/components/diary/InlineDatePicker';
import type { Mood, Energy, Pain, Bloating, Appetite, Skin, Sleep, Exercise } from '@/types';
import { EventConditionSection } from '@/components/diary/EventConditionSection';
import { HeaderCancelGlyph, HeaderCheckGlyph } from '@/components/ui/icons';

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
  const [endDate, setEndDate] = useState(() => defaultPeriodEndDate(today, defaultPeriodLength));
  const [endDirty, setEndDirty] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedField>('none');

  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [pain, setPain] = useState<Pain | null>(null);
  const [bloating, setBloating] = useState<Bloating | null>(null);
  const [appetite, setAppetite] = useState<Appetite | null>(null);
  const [skin, setSkin] = useState<Skin | null>(null);
  const [sleep, setSleep] = useState<Sleep | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [memo, setMemo] = useState('');

  const [submitting, setSubmitting] = useState(false);

  function handleStartChange(v: string) {
    if (!v) {
      setStartDate(v);
      return;
    }
    setStartDate(v);
    setEndDate(
      resolvePeriodEndOnStartChange({
        newStart: v,
        currentEnd: endDate,
        endDirty,
        defaultPeriodLength,
      }),
    );
  }

  function handleEndChange(v: string) {
    setEndDate(v);
    setEndDirty(true);
  }

  const periodValid = !!startDate && !!endDate && startDate <= today && endDate >= startDate;
  const hasAnyCondition = !!(
    mood ||
    energy ||
    pain ||
    bloating ||
    appetite ||
    skin ||
    sleep ||
    exercise ||
    memo.trim()
  );
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
          ...(sleep ? { sleep } : {}),
          ...(exercise ? { exercise } : {}),
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
      aria-label={t.log.addEntryTitle}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      {/* Figma 904:6959 — 일정 시트(EventFormSheet)와 같은 껍데기: 위 120px 을 남기는 높이,
          둥근 헤더의 ○X / 제목 / ○✓. 취소·저장 푸터는 없고 ✓ 가 저장이다. */}
      <div
        className="flex h-[calc(100dvh-120px-env(safe-area-inset-top,0px))] w-full max-w-md flex-col rounded-t-3xl bg-brand-gray200 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:h-auto sm:max-h-[90vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="relative flex items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            aria-label={t.home.cancel}
            disabled={submitting}
            onClick={handleClose}
            className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
          >
            <HeaderCancelGlyph className="size-10" />
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold text-brand-gray900">
            {t.log.addEntryTitle}
          </h2>
          <button
            type="button"
            aria-label={t.log.save}
            disabled={disabled}
            onClick={handleSave}
            className={
              'grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (disabled
                ? 'bg-brand-gray400 text-brand-gray200'
                : 'bg-brand-pink200 text-brand-pink50')
            }
          >
            <HeaderCheckGlyph className="size-10" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-2">
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <DateRow
              label={t.home.startPeriodStartLabel}
              value={startDate}
              locale={locale}
              expanded={expanded === 'start'}
              onToggle={() => setExpanded((v) => (v === 'start' ? 'none' : 'start'))}
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
              onToggle={() => setExpanded((v) => (v === 'end' ? 'none' : 'end'))}
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

          <EventConditionSection
            mood={mood}
            energy={energy}
            pain={pain}
            bloating={bloating}
            appetite={appetite}
            skin={skin}
            sleep={sleep}
            exercise={exercise}
            onChangeMood={setMood}
            onChangeEnergy={setEnergy}
            onChangePain={setPain}
            onChangeBloating={setBloating}
            onChangeAppetite={setAppetite}
            onChangeSkin={setSkin}
            onChangeSleep={setSleep}
            onChangeExercise={setExercise}
          />

          {/* 시안에는 없지만 기존 기능(하루 메모)이라 유지 — 일정 시트의 메모 칸과 같은 모양. */}
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <textarea
              value={memo}
              maxLength={MEMO_MAX}
              placeholder={t.log.memoPlaceholder}
              onChange={(e) => setMemo(e.target.value)}
              className="block min-h-[72px] w-full resize-none bg-transparent px-4 py-3 text-sm text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
