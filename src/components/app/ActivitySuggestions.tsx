'use client';
import { useMemo, useState } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import type { CyclePhase } from '@/domain/cycle/types';
import {
  ACTIVITY_CATEGORY_KEYS,
  activityVisual,
  type ActivityCategoryKey,
} from '@/data/homeImagery';

interface ActivitySuggestionsProps {
  phase: CyclePhase;
}

export function ActivitySuggestions({ phase }: ActivitySuggestionsProps) {
  const t = useT();
  const items = t.home.activities[phase].items;
  const tabs = t.home.activityCategoryTabs;

  const defaultCategory = useMemo<ActivityCategoryKey>(() => {
    const first = ACTIVITY_CATEGORY_KEYS.find((key) =>
      items.some((item) => item.categoryKey === key),
    );
    return first ?? 'selfcare';
  }, [items]);

  const [selected, setSelected] = useState<ActivityCategoryKey>(defaultCategory);
  const visibleItems = items.filter((item) => item.categoryKey === selected);

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.activitiesTitle}</h3>

      <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-1.5 px-5">
          {ACTIVITY_CATEGORY_KEYS.map((key) => {
            const active = key === selected;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  'rounded-full px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-brand-gray900 font-semibold text-brand-white'
                    : 'bg-brand-gray300 font-medium text-brand-gray900',
                )}
              >
                {tabs[key]}
              </button>
            );
          })}
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <p className="text-sm text-brand-gray600">{t.home.activitiesEmptyCategory}</p>
      ) : (
        <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-6 px-5">
            {chunkPairs(visibleItems).map((pair, columnIndex) => (
              <div key={columnIndex} className="flex w-[300px] flex-col gap-4">
                {pair.map((item) => (
                  <ActivityCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
}

function ActivityCard({ id, title, description }: ActivityCardProps) {
  const visual = activityVisual(id);
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl border-brand-pink100 text-3xl',
          visual.bg,
        )}
        aria-hidden
      >
        {visual.emoji}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-xl font-semibold text-brand-gray900">{title}</p>
        <p className="text-sm leading-relaxed text-brand-gray800">{description}</p>
      </div>
    </div>
  );
}

function chunkPairs<T>(arr: ReadonlyArray<T>): T[][] {
  const PAIR_SIZE = 3;
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += PAIR_SIZE) {
    result.push(arr.slice(i, i + PAIR_SIZE));
  }
  return result;
}
