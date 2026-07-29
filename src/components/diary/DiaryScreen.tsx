'use client';
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { usePeriodStore } from '@/store/periodStore';
import { useEventStore } from '@/store/eventStore';
import { useSettingsStore } from '@/store/settingsStore';
import { todayISO } from '@/lib/date';
import { LogEntryDialog } from '@/components/log/LogEntryDialog';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';
import type { EventCategory, EventLog } from '@/types';
import { DiaryHeader } from './DiaryHeader';
import { DiaryMonthGrid } from './DiaryMonthGrid';
import { AddQuickSheet } from './AddQuickSheet';
import { EventFormSheet, type EventFormInput } from './EventFormSheet';
import { EventDetailSheet } from './EventDetailSheet';
import {
  EventCategoryFormSheet,
  type CategoryFormInput,
} from './EventCategoryFormSheet';
import { YearMonthWheelPicker } from './YearMonthWheelPicker';
import type { LogView } from './LogViewToggle';

const WEEK_STARTS_ON = 0;

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
  | { kind: 'detail'; eventId: string }
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

  const events = useEventStore((s) => s.events);
  const categories = useEventStore((s) => s.categories);
  const eventsHydrated = useEventStore((s) => s.hydrated);
  const hydrateEvents = useEventStore((s) => s.hydrate);
  const seedBuiltinsIfEmpty = useEventStore((s) => s.seedBuiltinsIfEmpty);
  const addEvent = useEventStore((s) => s.addEvent);
  const updateEvent = useEventStore((s) => s.updateEvent);
  const addCategory = useEventStore((s) => s.addCategory);
  const updateCategory = useEventStore((s) => s.updateCategory);

  const periodLength = useSettingsStore((s) => s.settings.averagePeriodLength);

  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });
  const [sheet, setSheet] = useState<ActiveSheet>({ kind: 'none' });

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);

  useEffect(() => {
    if (!eventsHydrated) hydrateEvents();
  }, [eventsHydrated, hydrateEvents]);

  const builtinNamer = useCallback(
    (key: BuiltinCategoryKey) => t.report.diary.eventCategory.builtin[key],
    [t],
  );

  useEffect(() => {
    if (!eventsHydrated) return;
    if (categories.length === 0) seedBuiltinsIfEmpty(builtinNamer);
  }, [eventsHydrated, categories.length, seedBuiltinsIfEmpty, builtinNamer]);

  const activeEvent: EventLog | null =
    sheet.kind === 'detail' || sheet.kind === 'editEvent'
      ? events.find((e) => e.id === sheet.eventId) ?? null
      : null;
  const activeCategory =
    activeEvent ? categories.find((c) => c.id === activeEvent.categoryId) : undefined;

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

  return (
    <>
      <DiaryHeader
        year={cursor.year}
        monthIndex={cursor.monthIndex}
        currentView={currentView}
        onViewChange={onViewChange}
        onMonthClick={() => setSheet({ kind: 'monthPicker' })}
        onAddClick={() => setSheet({ kind: 'quick' })}
      />
      <div className="px-4 pt-4">
        <div className="rounded-2xl bg-brand-white/95 px-2 py-2 backdrop-blur-sm">
          <DiaryMonthGrid
            year={cursor.year}
            monthIndex={cursor.monthIndex}
            weekStartsOn={WEEK_STARTS_ON}
            today={today}
            periods={periods}
            events={events}
            categories={categories}
            onSelect={() => {
              /* Day surrounding area — reserved for STEP 10.2b+ list view */
            }}
            onSelectEvent={(ev) => setSheet({ kind: 'detail', eventId: ev.id })}
          />
        </div>
      </div>

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
      {sheet.kind === 'detail' && activeEvent ? (
        <EventDetailSheet
          event={activeEvent}
          category={activeCategory}
          onClose={() => setSheet({ kind: 'none' })}
          onEdit={() => setSheet({ kind: 'editEvent', eventId: activeEvent.id })}
        />
      ) : null}
      {sheet.kind === 'editEvent' && activeEvent ? (
        <EventFormSheet
          mode="edit"
          categories={categories}
          initial={activeEvent}
          defaultDate={activeEvent.startDate}
          onClose={() => setSheet({ kind: 'detail', eventId: activeEvent.id })}
          onSubmit={(input) => handleUpdateEvent(activeEvent.id, input)}
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
    </>
  );
}
