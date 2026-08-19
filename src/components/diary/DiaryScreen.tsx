'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { usePeriodStore } from '@/store/periodStore';
import { useEventStore } from '@/store/eventStore';
import { useConditionStore } from '@/store/conditionStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useDiaryStickerStore } from '@/store/diaryStickerStore';
import {
  useDiaryPlacementStore,
  selectPlacementsForMonth,
} from '@/store/diaryPlacementStore';
import { todayISO, toISO } from '@/lib/date';
import { LogEntryDialog } from '@/components/log/LogEntryDialog';
import { DayDetailSheet } from '@/components/calendar/DayDetailSheet';
import { isPeriodDate } from '@/components/calendar/cellState';
import {
  PeriodRangeDialog,
  type AddPeriodInput,
} from '@/components/app/PeriodRangeDialog';
import { Toast } from '@/components/ui/Toast';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';
import type { EventCategory, EventLog } from '@/types';
import { DiaryHeader } from './DiaryHeader';
import { DiaryMonthGrid } from './DiaryMonthGrid';
import { DiaryStickerViewLayer } from './DiaryStickerViewLayer';
import { AddQuickSheet } from './AddQuickSheet';
import { EventFormSheet, type EventFormInput } from './EventFormSheet';
import {
  EventCategoryFormSheet,
  type CategoryFormInput,
} from './EventCategoryFormSheet';
import { YearMonthWheelPicker } from './YearMonthWheelPicker';
import type { LogView } from './LogViewToggle';

const WEEK_STARTS_ON = 0;
const TOAST_MS = 2400;

interface DiaryScreenProps {
  currentView: LogView;
  onViewChange: (view: LogView) => void;
}

type EventPrev = 'addEvent' | { kind: 'editEvent'; eventId: string };
type ActiveSheet =
  | { kind: 'none' }
  | { kind: 'quick' }
  | { kind: 'period' }
  | { kind: 'addEvent' }
  | { kind: 'editEvent'; eventId: string }
  | { kind: 'monthPicker' }
  | { kind: 'addCategory'; prev: EventPrev }
  | { kind: 'editCategory'; categoryId: string; prev: EventPrev };

export function DiaryScreen({ currentView, onViewChange }: DiaryScreenProps) {
  const t = useT();
  const today = todayISO();

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);
  const addPeriod = usePeriodStore((s) => s.add);
  const removePeriod = usePeriodStore((s) => s.remove);
  const updatePeriod = usePeriodStore((s) => s.update);

  const conditionByDate = useConditionStore((s) => s.byDate);
  const hydrateConditionRange = useConditionStore((s) => s.hydrateRange);

  const settings = useSettingsStore((s) => s.settings);

  const events = useEventStore((s) => s.events);
  const categories = useEventStore((s) => s.categories);
  const eventsHydrated = useEventStore((s) => s.hydrated);
  const hydrateEvents = useEventStore((s) => s.hydrate);
  const seedBuiltinsIfEmpty = useEventStore((s) => s.seedBuiltinsIfEmpty);
  const addEvent = useEventStore((s) => s.addEvent);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const removeEvent = useEventStore((s) => s.removeEvent);
  const linkPeriodMark = useEventStore((s) => s.linkPeriodMark);
  const unlinkPeriodMark = useEventStore((s) => s.unlinkPeriodMark);
  const addCategory = useEventStore((s) => s.addCategory);
  const updateCategory = useEventStore((s) => s.updateCategory);

  const periodLength = useSettingsStore((s) => s.settings.averagePeriodLength);

  const stickers = useDiaryStickerStore((s) => s.stickers);
  const stickerUrls = useDiaryStickerStore((s) => s.urls);
  const stickersHydrated = useDiaryStickerStore((s) => s.hydrated);
  const hydrateStickers = useDiaryStickerStore((s) => s.hydrate);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });
  const [sheet, setSheet] = useState<ActiveSheet>({ kind: 'none' });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [rangeStartSeed, setRangeStartSeed] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const placements = useDiaryPlacementStore(
    selectPlacementsForMonth(cursor.year, cursor.monthIndex),
  );
  const hydratePlacementMonth = useDiaryPlacementStore((s) => s.hydrateMonth);

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    if (!eventsHydrated) hydrateEvents();
  }, [eventsHydrated, hydrateEvents]);

  useEffect(() => {
    if (!stickersHydrated) hydrateStickers();
  }, [stickersHydrated, hydrateStickers]);

  useEffect(() => {
    hydratePlacementMonth(cursor.year, cursor.monthIndex);
  }, [cursor.year, cursor.monthIndex, hydratePlacementMonth]);

  useEffect(() => {
    const start = toISO(new Date(cursor.year, cursor.monthIndex, 1));
    const end = toISO(new Date(cursor.year, cursor.monthIndex + 1, 0));
    hydrateConditionRange(start, end);
  }, [cursor.year, cursor.monthIndex, hydrateConditionRange]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const prediction = useMemo(
    () => predictNextPeriod(periods, settings),
    [periods, settings],
  );

  const startMatchId = useMemo(
    () =>
      selectedDate ? periods.find((p) => p.startDate === selectedDate)?.id ?? null : null,
    [periods, selectedDate],
  );
  const openRecordId = useMemo(() => {
    if (!selectedDate) return null;
    let latest: { id: string; startDate: string } | null = null;
    for (const p of periods) {
      if (p.endDate) continue;
      if (p.startDate > selectedDate) continue;
      if (!latest || p.startDate > latest.startDate) latest = { id: p.id, startDate: p.startDate };
    }
    return latest?.id ?? null;
  }, [periods, selectedDate]);
  const canAddOnSelected =
    !!selectedDate && !startMatchId && selectedDate <= today;

  function handleAddPeriodOnDate(startDate: string) {
    setSelectedDate(null);
    setRangeStartSeed(startDate);
  }
  async function handleRangeSubmit(input: AddPeriodInput) {
    await addPeriod(input);
    setRangeStartSeed(null);
    setToast(t.calendar.detail.added);
  }
  async function handleRemovePeriod(id: string) {
    await removePeriod(id);
    setSelectedDate(null);
    setToast(t.calendar.detail.removed);
  }
  async function handleMarkEnd(id: string, endDate: string) {
    await updatePeriod(id, { endDate });
    setSelectedDate(null);
    setToast(t.calendar.detail.endMarked);
  }

  const builtinNamer = useCallback(
    (key: BuiltinCategoryKey) => t.report.diary.eventCategory.builtin[key],
    [t],
  );

  useEffect(() => {
    if (!eventsHydrated) return;
    if (categories.length === 0) seedBuiltinsIfEmpty(builtinNamer);
  }, [eventsHydrated, categories.length, seedBuiltinsIfEmpty, builtinNamer]);

  const activeEvent: EventLog | null =
    sheet.kind === 'editEvent'
      ? events.find((e) => e.id === sheet.eventId) ?? null
      : null;

  async function handleAddEvent(input: EventFormInput): Promise<boolean> {
    const log = await addEvent({
      startDate: input.startDate,
      endDate: input.endDate,
      title: input.title,
      memo: input.memo,
      categoryId: input.categoryId,
    });
    return !!log;
  }

  async function handleUpdateEvent(
    id: string,
    input: EventFormInput,
  ): Promise<boolean> {
    const next = await updateEvent(id, {
      startDate: input.startDate,
      endDate: input.endDate,
      title: input.title,
      memo: input.memo,
      categoryId: input.categoryId,
    });
    return !!next;
  }

  async function handleAddCategory(input: CategoryFormInput): Promise<boolean> {
    const row = await addCategory({
      name: input.name,
      colorId: input.colorId,
      order: categories.length,
    });
    return !!row;
  }

  async function handleUpdateCategory(
    id: string,
    input: CategoryFormInput,
  ): Promise<boolean> {
    const next = await updateCategory(id, {
      name: input.name,
      colorId: input.colorId,
    });
    return !!next;
  }

  function openAddCategoryFromEvent() {
    setSheet((prev) => {
      if (prev.kind === 'addEvent') return { kind: 'addCategory', prev: 'addEvent' };
      if (prev.kind === 'editEvent')
        return {
          kind: 'addCategory',
          prev: { kind: 'editEvent', eventId: prev.eventId },
        };
      return prev;
    });
  }

  function openEditCategoryFromEvent(cat: EventCategory) {
    setSheet((prev) => {
      if (prev.kind === 'addEvent')
        return { kind: 'editCategory', categoryId: cat.id, prev: 'addEvent' };
      if (prev.kind === 'editEvent')
        return {
          kind: 'editCategory',
          categoryId: cat.id,
          prev: { kind: 'editEvent', eventId: prev.eventId },
        };
      return prev;
    });
  }

  function returnToEventSheet(prev: EventPrev) {
    if (prev === 'addEvent') setSheet({ kind: 'addEvent' });
    else setSheet(prev);
  }

  const activeCategoryForEdit =
    sheet.kind === 'editCategory'
      ? categories.find((c) => c.id === sheet.categoryId) ?? null
      : null;

  const swipeContainerRef = useRef<HTMLDivElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeAnimating, setSwipeAnimating] = useState(false);
  const dragRef = useRef<{ id: number; startX: number; startY: number; captured: boolean } | null>(
    null,
  );

  // Spec 8: onboarding nudge — the calendar pulls slightly left and returns
  // on first mount of the diary tab in this session, hinting that swipe
  // changes the month. `sessionStorage` so tab switches within a session
  // don't retrigger, but a page reload does (matches "onboarding").
  const [nudgeOnMount, setNudgeOnMount] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = 'dwee:diary_nudge_shown';
    if (window.sessionStorage.getItem(key)) return;
    setNudgeOnMount(true);
    window.sessionStorage.setItem(key, '1');
    const t = window.setTimeout(() => setNudgeOnMount(false), 1000);
    return () => window.clearTimeout(t);
  }, []);

  function commitSwipe(direction: -1 | 0 | 1, containerWidth: number) {
    if (direction === 0) {
      setSwipeAnimating(true);
      setSwipeOffset(0);
      return;
    }
    // Slide fully out of view in the swipe direction, then swap month +
    // instantly snap the new month in from the opposite side (offset 0).
    setSwipeAnimating(true);
    setSwipeOffset(direction * -containerWidth);
    window.setTimeout(() => {
      setCursor((c) => {
        const total = c.year * 12 + c.monthIndex + direction;
        return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 };
      });
      setSwipeAnimating(false);
      setSwipeOffset(0);
    }, 220);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      captured: false,
    };
    setSwipeAnimating(false);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.captured) {
      // Only start owning the gesture once horizontal intent dominates so
      // vertical scrolls (calendar list, page scroll) still work.
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      s.captured = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setSwipeOffset(dx);
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    const s = dragRef.current;
    if (!s || s.id !== e.pointerId) return;
    dragRef.current = null;
    if (!s.captured) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    const width = swipeContainerRef.current?.getBoundingClientRect().width ?? 0;
    const threshold = Math.max(60, width * 0.2);
    if (swipeOffset <= -threshold) commitSwipe(1, width);
    else if (swipeOffset >= threshold) commitSwipe(-1, width);
    else commitSwipe(0, width);
  }

  return (
    <>
      {/* Diary page background: because <main> has `pb-32` for the fixed
          bottom-nav overlay and its own bg is transparent, the AppShell's
          gray50 would show through below the calendar. A fixed backdrop
          scoped to this component paints the whole viewport in gray200
          (matches Figma 012_1 page bg variable) and unmounts cleanly
          when the user leaves the diary tab. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-brand-gray200"
      />
      <div className="relative z-10">
        <DiaryHeader
          year={cursor.year}
          monthIndex={cursor.monthIndex}
          currentView={currentView}
          onViewChange={onViewChange}
          onMonthClick={() => setSheet({ kind: 'monthPicker' })}
          onAddClick={() => setSheet({ kind: 'quick' })}
        />
        {/* Padding gutter lives OUTSIDE the overflow-hidden layer so the
            left/right margin stays visible even while the swipe transform
            drags the calendar past its resting position. Extra pb keeps the
            6th calendar row clear of the fixed BottomTabNav on short mobile
            viewports (Safari with URL bar visible). */}
        <div className="px-4 pb-24 pt-4">
        <div
          ref={swipeContainerRef}
          // `select-none` prevents mouse-drag text selection from
          // hijacking the swipe gesture on desktop; `touch-pan-y`
          // lets vertical page scroll still work on mobile.
          className="relative touch-pan-y select-none overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {/* Two nested divs so nudge (CSS keyframe transform on the outer)
              and swipe (inline transform on the inner) don't collide on
              the same property. */}
          <div className={nudgeOnMount ? 'animate-diaryNudge' : undefined}>
            <div
              style={{
                transform: `translateX(${swipeOffset}px)`,
                transition: swipeAnimating ? 'transform 220ms ease-out' : 'none',
              }}
            >
              <DiaryStickerViewLayer
                placements={placements}
                stickers={stickers}
                urls={stickerUrls}
              >
                <div className="rounded-2xl bg-brand-white/95 py-2 backdrop-blur-sm">
                  <DiaryMonthGrid
                    year={cursor.year}
                    monthIndex={cursor.monthIndex}
                    weekStartsOn={WEEK_STARTS_ON}
                    today={today}
                    periods={periods}
                    events={events}
                    categories={categories}
                    conditionByDate={conditionByDate}
                    predictedDate={prediction.predictedDate}
                    onSelect={setSelectedDate}
                    onSelectEvent={(ev) => setSheet({ kind: 'editEvent', eventId: ev.id })}
                  />
                </div>
              </DiaryStickerViewLayer>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* + button routes through AddQuickSheet: 생리일 기록 →
          LogEntryDialog (same modal 주기리포트 uses), 일정 등록 →
          EventFormSheet. */}
      {sheet.kind === 'quick' ? (
        <AddQuickSheet
          onSelectPeriod={() => setSheet({ kind: 'period' })}
          onSelectEvent={() => setSheet({ kind: 'addEvent' })}
          onClose={() => setSheet({ kind: 'none' })}
        />
      ) : null}
      {sheet.kind === 'period' ? (
        <LogEntryDialog
          today={today}
          defaultPeriodLength={periodLength}
          onClose={() => setSheet({ kind: 'none' })}
          onSaved={() => setSheet({ kind: 'none' })}
        />
      ) : null}
      {sheet.kind === 'addEvent' && categories.length > 0 ? (
        <EventFormSheet
          mode="add"
          categories={categories}
          defaultDate={today}
          onClose={() => setSheet({ kind: 'none' })}
          onSubmit={handleAddEvent}
          onEditCategory={openEditCategoryFromEvent}
          onAddCategory={openAddCategoryFromEvent}
        />
      ) : null}
      {sheet.kind === 'editEvent' && activeEvent ? (
        <EventFormSheet
          mode="edit"
          categories={categories}
          initial={activeEvent}
          defaultDate={activeEvent.startDate}
          onClose={() => setSheet({ kind: 'none' })}
          onSubmit={(input) => handleUpdateEvent(activeEvent.id, input)}
          onDelete={async () => {
            await removeEvent(activeEvent.id);
            setSheet({ kind: 'none' });
          }}
          onTogglePeriodMark={async () => {
            if (activeEvent.hasPeriodMark) {
              await unlinkPeriodMark(activeEvent.id);
            } else {
              await linkPeriodMark(activeEvent.id);
            }
          }}
          onEditCategory={openEditCategoryFromEvent}
          onAddCategory={openAddCategoryFromEvent}
        />
      ) : null}
      {sheet.kind === 'addCategory' ? (
        <EventCategoryFormSheet
          mode="add"
          onClose={() => returnToEventSheet(sheet.prev)}
          onSubmit={handleAddCategory}
        />
      ) : null}
      {sheet.kind === 'editCategory' && activeCategoryForEdit ? (
        <EventCategoryFormSheet
          mode="edit"
          initial={activeCategoryForEdit}
          onClose={() => returnToEventSheet(sheet.prev)}
          onSubmit={(input) =>
            handleUpdateCategory(activeCategoryForEdit.id, input)
          }
        />
      ) : null}
      {sheet.kind === 'monthPicker' ? (
        <YearMonthWheelPicker
          initialYear={cursor.year}
          initialMonthIndex={cursor.monthIndex}
          onCancel={() => setSheet({ kind: 'none' })}
          onApply={(year, monthIndex) => {
            setCursor({ year, monthIndex });
            setSheet({ kind: 'none' });
          }}
        />
      ) : null}

      {selectedDate ? (
        <DayDetailSheet
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
          hasPeriod={isPeriodDate(selectedDate, periods)}
          isPredicted={prediction.predictedDate === selectedDate}
          condition={conditionByDate[selectedDate] ?? null}
          startMatchId={startMatchId}
          openRecordId={openRecordId}
          canAdd={canAddOnSelected}
          onAdd={handleAddPeriodOnDate}
          onRemove={handleRemovePeriod}
          onMarkEnd={handleMarkEnd}
        />
      ) : null}

      {rangeStartSeed ? (
        <PeriodRangeDialog
          initialStartDate={rangeStartSeed}
          defaultPeriodLength={periodLength}
          today={today}
          onSubmit={handleRangeSubmit}
          onCancel={() => setRangeStartSeed(null)}
        />
      ) : null}

      <Toast message={toast} />
    </>
  );
}
