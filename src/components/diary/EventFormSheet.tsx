'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { formatMonthLabel, fromISO, todayISO } from '@/lib/date';
import { defaultCategoryId } from '@/domain/event/builtins';
import type { DailyConditionLog, EventCategory, EventLog } from '@/types';
import { BinIcon, ChevronDownIcon } from '@/components/ui/icons';
import { MyPageToggle } from '@/components/my-page/MyPageToggle';
import { CategorySelector } from './CategorySelector';
import { DeleteEventDialog } from './DeleteEventDialog';
import { InlineDatePicker } from './InlineDatePicker';
import { EventConditionSection, type ConditionSelection } from './EventConditionSection';

export type EventFormMode = 'add' | 'edit';

export interface EventFormInput {
  title: string;
  memo: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  periodMark: boolean;
  condition?: ConditionSelection;
}

interface EventFormSheetProps {
  mode: EventFormMode;
  categories: EventCategory[];
  initial?: EventLog | null;
  /** Edit mode only — seeds the condition section from the day's existing
   * check-in (keyed by `initial.startDate`), if any. */
  initialCondition?: DailyConditionLog | null;
  defaultDate: string;
  onClose: () => void;
  onSubmit: (input: EventFormInput) => Promise<boolean>;
  onDelete?: () => void | Promise<void>;
  onTogglePeriodMark?: () => void | Promise<void>;
  onEditCategory?: (category: EventCategory) => void;
  onAddCategory?: () => void;
}

type ExpandedField = 'none' | 'start' | 'end' | 'category';

export function EventFormSheet({
  mode,
  categories,
  initial,
  initialCondition,
  defaultDate,
  onClose,
  onSubmit,
  onDelete,
  onTogglePeriodMark,
  onEditCategory,
  onAddCategory,
}: EventFormSheetProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [memo, setMemo] = useState(initial?.memo ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? defaultDate);
  const [endDate, setEndDate] = useState(initial?.endDate ?? defaultDate);
  const [categoryId, setCategoryId] = useState<string | null>(
    initial?.categoryId ?? defaultCategoryId(categories),
  );
  const [expanded, setExpanded] = useState<ExpandedField>('none');
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [togglingPeriod, setTogglingPeriod] = useState(false);
  const hasPeriodMark = initial?.hasPeriodMark ?? false;
  // add mode only — edit mode's toggle mutates the store immediately via
  // `onTogglePeriodMark` and reads its state from `hasPeriodMark` instead.
  const [periodOn, setPeriodOn] = useState(false);
  const periodMarkOn = mode === 'edit' ? hasPeriodMark : periodOn;
  const periodMarkFutureBlocked = mode === 'add' && startDate > todayISO();

  const [mood, setMood] = useState(initialCondition?.mood ?? null);
  const [energy, setEnergy] = useState(initialCondition?.energy ?? null);
  const [pain, setPain] = useState(initialCondition?.pain ?? null);
  const [bloating, setBloating] = useState(initialCondition?.bloating ?? null);
  const [appetite, setAppetite] = useState(initialCondition?.appetite ?? null);
  const [skin, setSkin] = useState(initialCondition?.skin ?? null);
  const [sleep, setSleep] = useState(initialCondition?.sleep ?? null);
  const [exercise, setExercise] = useState(initialCondition?.exercise ?? null);

  async function handleTogglePeriodMark() {
    if (mode === 'edit') {
      if (togglingPeriod || !onTogglePeriodMark) return;
      setTogglingPeriod(true);
      try {
        await onTogglePeriodMark();
      } finally {
        setTogglingPeriod(false);
      }
      return;
    }
    if (periodMarkFutureBlocked) return;
    setPeriodOn((v) => !v);
  }

  function handleDelete() {
    if (submitting || !onDelete) return;
    setConfirmingDelete(true);
  }

  async function confirmDelete() {
    if (submitting || !onDelete) return;
    setSubmitting(true);
    try {
      await onDelete();
    } finally {
      setSubmitting(false);
      setConfirmingDelete(false);
    }
  }

  // A period-marked event may be saved without a title; the badge then
  // reads as the period label so the calendar cell never shows an empty chip.
  const trimmedTitle =
    title.trim() || (periodMarkOn ? t.report.diary.eventDetail.periodToggle : '');
  const trimmedMemo = memo.trim();

  const conditionChanged =
    mood !== (initialCondition?.mood ?? null) ||
    energy !== (initialCondition?.energy ?? null) ||
    pain !== (initialCondition?.pain ?? null) ||
    bloating !== (initialCondition?.bloating ?? null) ||
    appetite !== (initialCondition?.appetite ?? null) ||
    skin !== (initialCondition?.skin ?? null) ||
    sleep !== (initialCondition?.sleep ?? null) ||
    exercise !== (initialCondition?.exercise ?? null);

  const isDirty =
    !initial ||
    trimmedTitle !== initial.title ||
    trimmedMemo !== (initial.memo ?? '') ||
    startDate !== initial.startDate ||
    endDate !== initial.endDate ||
    categoryId !== initial.categoryId ||
    conditionChanged;

  const canSave =
    !submitting && trimmedTitle.length > 0 && !!categoryId && endDate >= startDate && isDirty;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSave() {
    if (!canSave || !categoryId) return;
    setSubmitting(true);
    try {
      const condition: ConditionSelection | undefined =
        mood || energy || pain || bloating || appetite || skin || sleep || exercise
          ? {
              ...(mood ? { mood } : {}),
              ...(energy ? { energy } : {}),
              ...(pain ? { pain } : {}),
              ...(bloating ? { bloating } : {}),
              ...(appetite ? { appetite } : {}),
              ...(skin ? { skin } : {}),
              ...(sleep ? { sleep } : {}),
              ...(exercise ? { exercise } : {}),
            }
          : undefined;
      const ok = await onSubmit({
        title: trimmedTitle,
        memo: trimmedMemo,
        startDate,
        endDate,
        categoryId,
        periodMark: periodMarkOn,
        condition,
      });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  useBodyScrollLock();
  // While the delete confirm is up, Esc belongs to it — otherwise both close.
  useEscToClose(handleClose, !confirmingDelete);

  const headerTitle =
    mode === 'edit' ? t.report.diary.editSheet.title : t.report.diary.eventSheet.title;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={headerTitle}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={handleClose}
    >
      {/* 시트 위로 다이어리 제목 행(56px + 노치)이 그대로 보일 만큼 남긴다 — 90vh 로
          거의 꽉 차면 바깥을 탭해 닫을 영역이 너무 좁다는 피드백. 120px = 제목 행
          56 + 여유 64. 데스크톱(sm)은 가운데 카드라 예전 값 유지. */}
      <div
        className="flex h-[calc(100dvh-120px-env(safe-area-inset-top,0px))] w-full max-w-md flex-col rounded-t-3xl bg-brand-gray200 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] sm:h-auto sm:max-h-[90vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Figma 012_2 header: circular X (left), centered title, circular
            confirm ✓ (right — pink when canSave, gray400 when disabled). */}
        <header className="relative flex items-center justify-between px-4 pb-3 pt-4">
          <button
            type="button"
            aria-label={t.report.diary.eventSheet.close}
            disabled={submitting}
            onClick={handleClose}
            className="grid size-10 place-items-center rounded-full bg-brand-gray100 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-60"
          >
            <CloseIcon />
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 text-[20px] font-semibold text-brand-gray900">
            {headerTitle}
          </h2>
          <button
            type="button"
            aria-label={t.report.diary.eventSheet.save}
            disabled={!canSave}
            onClick={handleSave}
            // Figma 327:4405 / 327:4404 — pink200 circle + pink50 check when
            // enabled, gray400 circle + gray200 check when disabled.
            className={
              'grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
              (canSave
                ? 'bg-brand-pink200 text-brand-pink50'
                : 'bg-brand-gray400 text-brand-gray200')
            }
          >
            <CheckIcon />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-2">
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.report.diary.eventSheet.titlePlaceholder}
              className="block w-full border-b border-brand-gray300 bg-transparent px-4 py-3 text-base font-semibold text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none"
            />
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t.report.diary.eventSheet.memoPlaceholder}
              rows={3}
              className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none"
            />
          </div>

          <div className="overflow-hidden rounded-2xl bg-brand-white">
            <DateRow
              label={t.report.diary.eventSheet.startDate}
              value={startDate}
              locale={locale}
              expanded={expanded === 'start'}
              onToggle={() => setExpanded((v) => (v === 'start' ? 'none' : 'start'))}
            />
            {expanded === 'start' ? (
              <InlineDatePicker
                selectedDate={startDate}
                onSelect={(d) => {
                  setStartDate(d);
                  if (endDate < d) setEndDate(d);
                }}
              />
            ) : null}
            <div className="border-t border-brand-gray300" />
            <DateRow
              label={t.report.diary.eventSheet.endDate}
              value={endDate}
              locale={locale}
              expanded={expanded === 'end'}
              onToggle={() => setExpanded((v) => (v === 'end' ? 'none' : 'end'))}
            />
            {expanded === 'end' ? (
              <InlineDatePicker
                selectedDate={endDate}
                minDate={startDate}
                onSelect={(d) => setEndDate(d)}
              />
            ) : null}
          </div>

          <CategorySelector
            categories={categories}
            selectedId={categoryId}
            onSelect={setCategoryId}
            expanded={expanded === 'category'}
            onToggle={() => setExpanded((v) => (v === 'category' ? 'none' : 'category'))}
            onEditCategory={onEditCategory}
            onAddCategory={onAddCategory}
          />

          {mode === 'add' || onTogglePeriodMark ? (
            <div className="flex items-center justify-between rounded-2xl bg-brand-white px-4 py-3">
              <span className="text-base text-brand-gray600">
                {t.report.diary.eventDetail.periodToggle}
              </span>
              <MyPageToggle
                enabled={periodMarkOn}
                onToggle={handleTogglePeriodMark}
                ariaLabel={t.report.diary.eventDetail.periodToggle}
                disabled={togglingPeriod || periodMarkFutureBlocked}
              />
            </div>
          ) : null}

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

          {mode === 'edit' && onDelete ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                // Figma 324:2315 — translucent gray400 pill, red label.
                className="flex items-center gap-1 rounded-[40px] bg-brand-gray400/50 px-7 py-4 text-lg font-medium text-brand-red backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:opacity-60"
              >
                <BinIcon className="size-[18px]" />
                <span>{t.report.diary.eventDetail.delete}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {confirmingDelete ? (
        // Rendered inside the sheet root, so a backdrop tap on the dialog must
        // not bubble up to handleClose and take the sheet down with it.
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteEventDialog
            submitting={submitting}
            onCancel={() => setConfirmingDelete(false)}
            onConfirm={() => void confirmDelete()}
          />
        </div>
      ) : null}
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
          className={'h-2 w-3 transition-transform ' + (expanded ? 'rotate-180' : '')}
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

function CloseIcon() {
  return (
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
  );
}

// Figma 256:15860 의 벡터 그대로 — 40 viewBox 를 버튼 크기(40px)에 1:1 로 얹어
// 체크 크기·선 굵기·둥근 꺾임이 시안과 같아진다.
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="size-10"
      aria-hidden
    >
      <path d="M13.0001 20L16.8773 24.9851C17.2777 25.4999 18.0557 25.4999 18.456 24.9851L27 14" />
    </svg>
  );
}
