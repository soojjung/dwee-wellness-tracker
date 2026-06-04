'use client';
import { useT } from '@/i18n/useT';
import type { CyclePhase } from '@/domain/cycle/types';

interface FoodSuggestionsProps {
  phase: CyclePhase;
}

export function FoodSuggestions({ phase }: FoodSuggestionsProps) {
  const t = useT();
  const block = t.home.foods[phase];

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.foodsTitle}</h3>
      <div className="flex flex-col gap-2">
        <p className="text-base font-medium text-brand-gray900">{block.category}</p>
        <ul className="ml-5 list-disc text-base leading-relaxed text-brand-gray800">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
