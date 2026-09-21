'use client';
import { useEffect } from 'react';
import { monthBoundsISO } from '@/lib/date';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';

interface MonthCursor {
  year: number;
  monthIndex: number;
}

interface UseDiaryHydrationParams {
  cursor: MonthCursor;
  periodsHydrated: boolean;
  hydratePeriods: () => void | Promise<void>;
  eventsHydrated: boolean;
  hydrateEvents: () => void | Promise<void>;
  stickersHydrated: boolean;
  hydrateStickers: () => void | Promise<void>;
  hydratePlacementMonth: (year: number, monthIndex: number) => void | Promise<void>;
  settingsHydrated: boolean;
  categoriesCount: number;
  seedBuiltinsIfEmpty: (namer: (key: BuiltinCategoryKey) => string) => void | Promise<void>;
  builtinNamer: (key: BuiltinCategoryKey) => string;
  /** DiaryScreen-only opt-in: also hydrates the condition log range for the
   * visible month. Left undefined on DiaryCustomizeScreen, which doesn't
   * show condition data. */
  withConditionRange?: boolean;
  hydrateConditionRange?: (start: string, end: string) => void | Promise<void>;
}

/** Shared hydration bootstrap for the diary tab and its customize screen:
 * periods / events / stickers / placement-month hydration, the builtin
 * category seed, and the opt-in condition-log range hydrate that only the
 * main diary screen needs. */
export function useDiaryHydration({
  cursor,
  periodsHydrated,
  hydratePeriods,
  eventsHydrated,
  hydrateEvents,
  stickersHydrated,
  hydrateStickers,
  hydratePlacementMonth,
  settingsHydrated,
  categoriesCount,
  seedBuiltinsIfEmpty,
  builtinNamer,
  withConditionRange,
  hydrateConditionRange,
}: UseDiaryHydrationParams): void {
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
    if (!withConditionRange || !hydrateConditionRange) return;
    const { start, end } = monthBoundsISO({ year: cursor.year, monthIndex: cursor.monthIndex });
    hydrateConditionRange(start, end);
  }, [withConditionRange, cursor.year, cursor.monthIndex, hydrateConditionRange]);

  useEffect(() => {
    // 기본 유형의 이름은 시드하는 순간의 언어로 저장소에 굳는다. 설정이 로드되기 전에는
    // 언어가 기본값(en)이라, 기다리지 않으면 한국어 기기에 "Family / Friend…"가 남는다.
    if (!eventsHydrated || !settingsHydrated) return;
    if (categoriesCount === 0) seedBuiltinsIfEmpty(builtinNamer);
  }, [eventsHydrated, settingsHydrated, categoriesCount, seedBuiltinsIfEmpty, builtinNamer]);
}
