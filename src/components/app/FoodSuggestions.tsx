'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import type { CyclePhase } from '@/domain/cycle/types';
import { FOOD_BOWL_IMAGE, FOOD_LABEL_POSITION, foodVisual } from '@/data/homeImagery';

interface FoodSuggestionsProps {
  phase: CyclePhase;
}

// 사진 원본은 1020×871 근처 — 340px 폭에 맞춰 세로를 잡는다.
const BOWL_WIDTH = 340;
const BOWL_HEIGHT = 292;

export function FoodSuggestions({ phase }: FoodSuggestionsProps) {
  const t = useT();
  const items = t.home.foods[phase].items;
  const bowlImage = FOOD_BOWL_IMAGE[phase];

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-2xl font-semibold text-brand-gray900">{t.home.foodsTitle}</h3>

      {bowlImage ? (
        <PhotoBowl image={bowlImage} items={items} />
      ) : (
        <EmojiBowl items={items} />
      )}
    </section>
  );
}

type Items = ReturnType<typeof useT>['home']['foods'][CyclePhase]['items'];

/**
 * 주기별 합성 사진 위에 라벨을 얹는다. 라벨 자리는 사진 속 식재료 위치에
 * 맞춰 두므로 `FOOD_LABEL_POSITION` 에서 음식 id 로 찾는다.
 *
 * 라벨이 사진 밖으로 조금 나가는 배치(예: 황체기 고구마)가 시안에 있어
 * 바깥 여백을 두고 `overflow-visible` 로 둔다.
 */
function PhotoBowl({ image, items }: { image: string; items: Items }) {
  return (
    <div className="mx-auto w-full max-w-[356px] px-2">
      <div
        className="relative mx-auto"
        style={{ width: BOWL_WIDTH, height: BOWL_HEIGHT }}
      >
        <Image
          src={image}
          alt=""
          width={BOWL_WIDTH}
          height={BOWL_HEIGHT}
          className="h-full w-full object-contain"
          priority={false}
        />

        {items.map((item) => {
          const pos = FOOD_LABEL_POSITION[item.id];
          if (!pos) return null;
          const visual = foodVisual(item.id);
          return (
            <Link
              key={item.id}
              href={`/foods/${item.id}`}
              className="absolute z-10 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-gray900 px-3 py-1.5 text-xs font-medium text-brand-white shadow-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200 focus-visible:ring-offset-2"
              style={{ left: pos.left, top: pos.top }}
            >
              <span>{item.name}</span>
              <span aria-hidden>{visual.emoji}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// 사진 시안이 없는 주기(unknown)용 폴백 — 이모지를 CSS 그릇에 담는다.
const FALLBACK_FOOD_POSITIONS = [
  { top: '17%', left: '6%', size: 'text-[76px]', rotate: '-rotate-12' },
  { top: '15%', left: '48%', size: 'text-[80px]', rotate: 'rotate-6' },
  { top: '42%', left: '22%', size: 'text-[68px]', rotate: 'rotate-3' },
  { top: '44%', left: '58%', size: 'text-[64px]', rotate: '-rotate-6' },
] as const;

const FALLBACK_LABEL_POSITIONS = [
  { top: '7%', left: '2%' },
  { top: '7%', left: '58%' },
  { top: '78%', left: '10%' },
  { top: '80%', left: '52%' },
] as const;

function EmojiBowl({ items }: { items: Items }) {
  const shown = items.slice(0, FALLBACK_FOOD_POSITIONS.length);
  return (
    <div className="relative mx-auto h-[230px] w-full max-w-[340px]">
      <Bowl className="absolute bottom-0 left-1/2 h-[190px] w-[320px] -translate-x-1/2" />

      {shown.map((item, i) => {
        const pos = FALLBACK_FOOD_POSITIONS[i] ?? FALLBACK_FOOD_POSITIONS[0];
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
            {foodVisual(item.id).emoji}
          </span>
        );
      })}

      {shown.map((item, i) => {
        const pos = FALLBACK_LABEL_POSITIONS[i] ?? FALLBACK_LABEL_POSITIONS[0];
        return (
          <span
            key={`label-${item.id}`}
            className="absolute z-20 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-gray900 px-3 py-1.5 text-xs font-medium text-brand-white shadow-md"
            style={{ top: pos.top, left: pos.left }}
          >
            <span>{item.name}</span>
            <span aria-hidden>{foodVisual(item.id).emoji}</span>
          </span>
        );
      })}
    </div>
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
