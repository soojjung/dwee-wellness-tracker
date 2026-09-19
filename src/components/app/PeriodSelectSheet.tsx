'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { addMonths, format, getDay, getDaysInMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { addDaysISO, fromISO, toISO, type ISODate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { BOTTOM_CTA_CLASS } from '@/components/ui/Button';
import { CancelIcon } from '@/components/ui/icons/CancelIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import type { PeriodLog } from '@/types';
import {
  EXTEND_GAP_DAYS,
  addRange,
  computeChanges,
  extendTo,
  findContainingDraft,
  findExtendableDraft,
  removeDay,
  toDrafts,
  type DraftPeriod,
  type PeriodChange,
} from '@/domain/cycle/periodEdit';
import { defaultPeriodEndDate } from '@/domain/cycle/recordPolicy';

interface PeriodSelectSheetProps {
  today: ISODate;
  periods: PeriodLog[];
  monthsBack?: number;
  monthsForward?: number;
  /**
   * `intro` 는 첫 로그인 직후 한 번 뜨는 생리일 기입(Figma 832:5234, 001_5). 헤더의
   * 닫기·저장 버튼 대신 하단 "시작하기" 하나로 끝내고, 아무것도 고르지 않아도 누를 수
   * 있다 — 그때 `onSubmit` 은 빈 배열을 받는다.
   */
  variant?: 'default' | 'intro';
  onSubmit: (changes: PeriodChange[]) => Promise<void>;
  onCancel: () => void;
}

const DEFAULT_MONTHS_BACK = 6;
const DEFAULT_MONTHS_FORWARD = 1;
// Matches the 14-day period-length outlier cap in domain/cycle/aggregate.
// A period that starts today can extend up to this many days ahead.
const FUTURE_WINDOW_DAYS = 14;
const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
// intro 시트가 내려가며 홈이 드러나는 시간. 아래 transition duration 과 맞춘다.
const INTRO_SLIDE_MS = 300;

interface MonthGrid {
  key: string;
  labelKo: string;
  labelEn: string;
  weeks: Array<Array<ISODate | null>>;
}

function buildMonth(year: number, monthIndex: number): MonthGrid {
  const first = new Date(year, monthIndex, 1);
  const leading = getDay(first);
  const total = getDaysInMonth(first);
  const cells: Array<ISODate | null> = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(toISO(new Date(year, monthIndex, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<ISODate | null>> = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return {
    key: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    labelKo: format(first, 'M월', { locale: ko }),
    labelEn: format(first, 'MMMM'),
    weeks,
  };
}

function collectRecordedDates(drafts: DraftPeriod[]): Set<ISODate> {
  const set = new Set<ISODate>();
  for (const p of drafts) {
    let cursor = p.startDate;
    while (cursor <= p.endDate) {
      set.add(cursor);
      cursor = addDaysISO(cursor, 1);
    }
  }
  return set;
}

export function PeriodSelectSheet({
  today,
  periods,
  monthsBack = DEFAULT_MONTHS_BACK,
  monthsForward = DEFAULT_MONTHS_FORWARD,
  variant = 'default',
  onSubmit,
  onCancel,
}: PeriodSelectSheetProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const averagePeriodLength = useSettingsStore((s) => s.settings.averagePeriodLength);
  const isIntro = variant === 'intro';
  const [closing, setClosing] = useState(false);
  const [drafts, setDrafts] = useState<DraftPeriod[]>(() => toDrafts(periods));
  const [pendingStart, setPendingStart] = useState<ISODate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const currentMonthRef = useRef<HTMLDivElement | null>(null);
  const newKeyCounter = useRef(0);

  function nextNewKey() {
    newKeyCounter.current += 1;
    return `new:${newKeyCounter.current}`;
  }

  const months = useMemo(() => {
    const anchor = fromISO(today);
    const list: MonthGrid[] = [];
    for (let i = monthsBack; i >= 0; i--) {
      const m = addMonths(anchor, -i);
      list.push(buildMonth(m.getFullYear(), m.getMonth()));
    }
    for (let i = 1; i <= monthsForward; i++) {
      const m = addMonths(anchor, i);
      list.push(buildMonth(m.getFullYear(), m.getMonth()));
    }
    return list;
  }, [today, monthsBack, monthsForward]);

  const currentMonthKey = useMemo(() => {
    const anchor = fromISO(today);
    return `${anchor.getFullYear()}-${String(anchor.getMonth() + 1).padStart(2, '0')}`;
  }, [today]);

  const maxSelectable = useMemo(() => addDaysISO(today, FUTURE_WINDOW_DAYS), [today]);

  const recordedSet = useMemo(() => collectRecordedDates(drafts), [drafts]);

  const changes = useMemo(() => computeChanges(periods, drafts), [periods, drafts]);
  const dirty = changes.length > 0;

  useEffect(() => {
    currentMonthRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  useBodyScrollLock();
  useEscToClose(handleCancel);

  function handleCellClick(date: ISODate) {
    if (date > maxSelectable) return;

    const containing = findContainingDraft(drafts, date);
    if (containing) {
      setPendingStart(null);
      setDrafts(removeDay(drafts, containing.key, date, nextNewKey));
      return;
    }

    const extendable = findExtendableDraft(drafts, date, EXTEND_GAP_DAYS);
    if (extendable) {
      setPendingStart(null);
      setDrafts(extendTo(drafts, extendable.key, date));
      return;
    }

    if (!pendingStart) {
      setPendingStart(date);
      return;
    }
    if (date === pendingStart) {
      setPendingStart(null);
      return;
    }

    const [lo, hi] = pendingStart < date ? [pendingStart, date] : [date, pendingStart];
    const nearbyForLo = findExtendableDraft(drafts, lo, EXTEND_GAP_DAYS);
    if (nearbyForLo) {
      setPendingStart(null);
      setDrafts(extendTo(drafts, nearbyForLo.key, hi));
      return;
    }
    setPendingStart(null);
    setDrafts(addRange(drafts, lo, hi, nextNewKey()));
  }

  async function handleSave() {
    if (!dirty || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(changes);
    } finally {
      setSubmitting(false);
    }
  }

  function slideOut() {
    setClosing(true);
    // transition 은 다음 프레임에야 시작한다. 딱 맞춰 끊으면 시트가 바닥에 닿기 직전에
    // 사라지므로 조금 더 기다린다.
    return new Promise<void>((resolve) => setTimeout(resolve, INTRO_SLIDE_MS + 80));
  }

  async function handleStart() {
    if (submitting) return;
    setSubmitting(true);
    // 시작일 하나만 누르고 바로 시작하는 경우가 흔하다. 버리지 않고, 시작일만 입력했을
    // 때의 기존 정책(평균 생리 기간만큼)으로 기간을 채워 저장한다.
    const finalDrafts = pendingStart
      ? addRange(
          drafts,
          pendingStart,
          defaultPeriodEndDate(pendingStart, averagePeriodLength),
          nextNewKey(),
        )
      : drafts;
    try {
      await slideOut();
      await onSubmit(computeChanges(periods, finalDrafts));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (submitting) return;
    if (isIntro) {
      setSubmitting(true);
      await slideOut();
    }
    onCancel();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.home.periodSheet.title}
      className={cn('fixed inset-0 z-40 flex items-end justify-center', !isIntro && 'bg-black/20')}
      onClick={handleCancel}
    >
      {/* intro 는 홈 위가 아니라 빈 화면 위에 뜬다 (시안 832:5234: 흰 배경 + 20% 딤).
          불투명한 판으로 홈을 가려 두었다가, 닫힐 때 시트가 내려가는 동안 걷어 내어
          홈이 드러나게 한다. */}
      {isIntro && (
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 mx-auto max-w-md bg-brand-gray50 transition-opacity duration-300',
            closing && 'opacity-0',
          )}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}
      <div
        className={cn(
          'relative flex w-full max-w-md flex-col overflow-hidden rounded-t-[32px] bg-brand-white',
          isIntro && 'animate-sheetSlideUp transition-transform duration-300 ease-in',
          closing && 'translate-y-full',
        )}
        // intro 는 시안대로 화면 위 55px 만 남기고 꽉 채운다 — 하단 CTA 가 늘 같은 자리에 있도록.
        style={isIntro ? { height: 'calc(100dvh - 55px)' } : { maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {isIntro ? (
          <h2 className="px-4 pb-3 pt-[26px] text-center text-[20px] font-semibold leading-[normal] text-brand-gray900">
            {t.home.periodSheet.title}
          </h2>
        ) : (
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={handleCancel}
              aria-label={t.home.periodSheet.closeAria}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
            >
              <CancelIcon className="h-5 w-5" />
            </button>
            <h2 className="text-[20px] font-semibold text-brand-gray900">
              {t.home.periodSheet.title}
            </h2>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || submitting}
              aria-label={t.home.periodSheet.saveAria}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 enabled:bg-brand-pink500 enabled:text-brand-white enabled:hover:opacity-80 disabled:cursor-not-allowed disabled:bg-brand-gray200 disabled:text-brand-gray400"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="mx-auto grid w-full max-w-[358px] grid-cols-7 gap-1.5 bg-brand-white px-4 py-2 text-[12px] font-medium text-brand-gray700">
          {WEEKDAY_KEYS.map((k, i) => (
            <span
              key={k}
              className={`text-center ${i === 0 || i === 6 ? 'text-brand-gray500' : ''}`}
            >
              {t.home.weekdays[k]}
            </span>
          ))}
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0, black 40px)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, black 40px)',
          }}
        >
          <div className="mx-auto flex w-full max-w-[358px] flex-col gap-6">
            {months.map((m) => {
              const isCurrent = m.key === currentMonthKey;
              return (
                <div
                  key={m.key}
                  ref={isCurrent ? currentMonthRef : undefined}
                  className="flex flex-col gap-4"
                >
                  <p className="w-full text-center text-[18px] font-semibold text-brand-gray900">
                    {locale === 'ko' ? m.labelKo : m.labelEn}
                  </p>
                  <div className="flex flex-col gap-3">
                    {m.weeks.map((week, wi) => (
                      <div key={wi} className="grid grid-cols-7 gap-1.5">
                        {week.map((cell, ci) => (
                          <DayCell
                            key={ci}
                            date={cell}
                            today={today}
                            maxSelectable={maxSelectable}
                            recordedSet={recordedSet}
                            pendingStart={pendingStart}
                            onClick={handleCellClick}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isIntro && (
          <button
            type="button"
            onClick={handleStart}
            disabled={submitting}
            className={cn(BOTTOM_CTA_CLASS, 'flex-shrink-0 bg-brand-pink50 text-brand-gray900')}
          >
            {t.onboarding.start}
          </button>
        )}
      </div>
    </div>
  );
}

interface DayCellProps {
  date: ISODate | null;
  today: ISODate;
  maxSelectable: ISODate;
  recordedSet: Set<ISODate>;
  pendingStart: ISODate | null;
  onClick: (date: ISODate) => void;
}

function DayCell({ date, today, maxSelectable, recordedSet, pendingStart, onClick }: DayCellProps) {
  if (!date) return <div className="h-10 w-full" aria-hidden />;
  const day = Number(date.slice(-2));
  const isToday = date === today;
  const isOutOfRange = date > maxSelectable;
  const isRecorded = recordedSet.has(date);
  const isPendingStart = pendingStart === date;

  let bgClass = '';
  let textClass = 'text-brand-gray900';
  let borderClass = '';

  if (isOutOfRange) {
    textClass = 'text-brand-gray500';
  }
  // 선택되면 today 의 어두운 칩이 pink 로 덮여 today 표시가 사라진다.
  // 링이 그 표식을 대신하므로, 범위의 시작일인지와 무관하게 오늘이면 항상 붙인다.
  if (isRecorded || isPendingStart) {
    bgClass = 'bg-brand-pink50';
    textClass = 'text-brand-pink800';
    if (isToday) borderClass = 'ring-2 ring-inset ring-brand-pink900';
  } else if (isToday) {
    bgClass = 'bg-brand-gray900';
    textClass = 'text-brand-white';
  }

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      disabled={isOutOfRange}
      aria-pressed={isRecorded || isPendingStart}
      className={`flex h-10 w-full items-center justify-center text-[16px] font-medium ${
        isOutOfRange ? 'cursor-default' : 'cursor-pointer'
      } focus-visible:outline-none`}
    >
      <span
        className={`flex h-10 min-w-[40px] items-center justify-center rounded-full px-2 ${bgClass} ${textClass} ${borderClass}`}
      >
        {day}
      </span>
    </button>
  );
}
