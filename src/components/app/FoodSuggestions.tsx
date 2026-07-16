'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import type { CyclePhase } from '@/domain/cycle/types';
import { foodVisual } from '@/data/homeImagery';

interface FoodSuggestionsProps {
  phase: CyclePhase;
}

interface FoodPosition {
  top: string;
  left: string;
  size: string;
  rotate: string;
}

interface LabelPosition {
  top: string;
  left: string;
}

// Foods cluster inside the bowl opening, overlapping like ingredients in a bowl.
// Positions are % of the 340×280 composition (bowl sits in the bottom 180px).
const FOOD_POSITIONS: ReadonlyArray<FoodPosition> = [
  { top: '32%', left: '6%', size: 'text-[76px]', rotate: '-rotate-12' },
  { top: '30%', left: '48%', size: 'text-[80px]', rotate: 'rotate-6' },
  { top: '52%', left: '22%', size: 'text-[68px]', rotate: 'rotate-3' },
  { top: '54%', left: '58%', size: 'text-[64px]', rotate: '-rotate-6' },
];

const LABEL_POSITIONS: ReadonlyArray<LabelPosition> = [
  { top: '20%', left: '2%' },
  { top: '18%', left: '58%' },
  { top: '82%', left: '10%' },
  { top: '84%', left: '52%' },
];

export function FoodSuggestions({ phase }: FoodSuggestionsProps) {
  const t = useT();
  const items = t.home.foods[phase].items.slice(0, 4);

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.foodsTitle}</h3>

      <div className="relative mx-auto h-[280px] w-full max-w-[340px]">
        <Bowl className="absolute bottom-0 left-1/2 h-[190px] w-[320px] -translate-x-1/2" />

        {items.map((item, i) => {
          const pos = FOOD_POSITIONS[i] ?? FOOD_POSITIONS[0]!;
          const visual = foodVisual(item.id);
          return (
            <span
              key={`food-${item.id}`}
              className={cn(
                'pointer-events-none absolute z-10 select-none leading-none drop-shadow-sm',
                pos.size,
                pos.rotate,
              )}
              style={{ top: pos.top, left: pos.left }}
              aria-hidden
            >
              {visual.emoji}
            </span>
          );
        })}

        {items.map((item, i) => {
          const pos = LABEL_POSITIONS[i] ?? LABEL_POSITIONS[0]!;
          const visual = foodVisual(item.id);
          return (
            <span
              key={`label-${item.id}`}
              className="absolute z-20 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-gray900 px-3 py-1.5 text-xs font-medium text-brand-white shadow-md"
              style={{ top: pos.top, left: pos.left }}
            >
              <span>{item.name}</span>
              <span aria-hidden>{visual.emoji}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

function Bowl({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none', className)} aria-hidden>
      {/* Bowl body — wide half-oval */}
      <div className="absolute inset-x-0 bottom-0 h-[160px] overflow-hidden rounded-b-[160px] rounded-t-[10px] bg-gradient-to-b from-brand-gray200 via-brand-gray300 to-brand-gray400 shadow-[inset_0_-14px_28px_rgba(0,0,0,0.08)]" />
      {/* Bowl rim (top ellipse) — pale white ring */}
      <div className="absolute inset-x-0 top-[18px] h-[36px] rounded-[50%] bg-brand-gray100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)]" />
      {/* Inner cavity — slightly darker ellipse to give depth */}
      <div className="absolute inset-x-3 top-[24px] h-[26px] rounded-[50%] bg-brand-gray300/70" />
      {/* Rim highlight */}
      <div className="absolute inset-x-6 top-[26px] h-[6px] rounded-[50%] bg-brand-white/70" />
    </div>
  );
}
