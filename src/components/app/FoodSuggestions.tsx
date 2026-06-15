'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import type { CyclePhase } from '@/domain/cycle/types';
import { foodVisual } from '@/data/homeImagery';

interface FoodSuggestionsProps {
  phase: CyclePhase;
}

export function FoodSuggestions({ phase }: FoodSuggestionsProps) {
  const t = useT();
  const items = t.home.foods[phase].items;

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.foodsTitle}</h3>
      <div className="-mx-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max gap-5 px-5 pb-1">
          {items.map((item) => (
            <FoodCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FoodCardProps {
  id: string;
  name: string;
  description: string;
}

function FoodCard({ id, name, description }: FoodCardProps) {
  const visual = foodVisual(id);
  return (
    <div className="flex w-[120px] shrink-0 flex-col items-center gap-1.5 text-center">
      <div
        className={cn(
          'flex h-20 w-20 items-center justify-center rounded-full text-3xl',
          visual.bg,
        )}
        aria-hidden
      >
        {visual.emoji}
      </div>
      <p className="text-lg font-semibold text-brand-gray900">{name}</p>
      <p className="text-xs leading-relaxed text-brand-gray800">{description}</p>
    </div>
  );
}
