'use client';
import { useCallback } from 'react';
import { useT } from '@/i18n/useT';
import { dictionaries } from '@/i18n';
import { localizedCategoryName } from '@/domain/event/builtins';
import type { EventCategory } from '@/types';

const SEEDED_NAMES = Object.values(dictionaries).map(
  (d) => d.report.diary.eventCategory.builtin,
);

/** Display name for an event category in the current locale (see localizedCategoryName). */
export function useCategoryName() {
  const t = useT();
  const builtinNames = t.report.diary.eventCategory.builtin;
  return useCallback(
    (category: EventCategory) => localizedCategoryName(category, builtinNames, SEEDED_NAMES),
    [builtinNames],
  );
}
