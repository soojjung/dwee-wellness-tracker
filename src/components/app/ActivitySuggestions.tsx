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

type CardTone = 'gray' | 'pink' | 'dark';
const TONE_CYCLE: ReadonlyArray<CardTone> = ['gray', 'pink', 'dark', 'gray'];

export function ActivitySuggestions({ phase }: ActivitySuggestionsProps) {
  const t = useT();
  const items = t.home.activities[phase].items;
  const tabs = t.home.activityCategoryTabs;

  const defaultCategory = useMemo<ActivityCategoryKey>(() => {
    const first = ACTIVITY_CATEGORY_KEYS.find((key) =>
      items.some((item) => item.categoryKey === key),
    );
    return first ?? 'emotion';
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
                    : 'border border-brand-gray300 font-medium text-brand-gray600',
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
          <div className="flex w-max gap-2.5 px-5 pb-1">
            {visibleItems.map((item, i) => (
              <ActivityToneCard
                key={item.id}
                tone={TONE_CYCLE[i % TONE_CYCLE.length] ?? 'gray'}
                emoji={activityVisual(item.id).emoji}
                title={item.title}
                description={item.description}
                durationLabel={`${item.durationMinutes}${t.home.durationSuffix}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface ActivityToneCardProps {
  tone: CardTone;
  emoji: string;
  title: string;
  description: string;
  durationLabel: string;
}

function ActivityToneCard({ tone, emoji, title, description, durationLabel }: ActivityToneCardProps) {
  const dark = tone === 'dark';
  const bg =
    tone === 'gray'
      ? 'bg-brand-gray300'
      : tone === 'pink'
      ? 'bg-brand-pink50'
      : 'bg-brand-gray900';
  const durationPill =
    tone === 'gray'
      ? 'bg-brand-gray500 text-brand-white'
      : tone === 'pink'
      ? 'bg-brand-pink100 text-brand-white'
      : 'bg-brand-gray800 text-brand-white';
  return (
    <div
      className={cn(
        'flex w-[170px] shrink-0 flex-col justify-between gap-8 rounded-2xl p-4',
        bg,
      )}
    >
      <span
        className={cn(
          'inline-flex w-fit items-center justify-center rounded-full px-2 py-1 text-xs font-medium',
          durationPill,
        )}
      >
        {durationLabel}
      </span>
      <div className="flex flex-col gap-1.5">
        <p
          className={cn(
            'flex items-center gap-1.5 text-lg font-semibold leading-snug',
            dark ? 'text-brand-white' : 'text-brand-gray900',
          )}
        >
          <span>{title}</span>
          <span aria-hidden>{emoji}</span>
        </p>
        <p
          className={cn(
            'text-xs leading-relaxed',
            dark ? 'text-brand-gray300' : 'text-brand-gray800',
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
