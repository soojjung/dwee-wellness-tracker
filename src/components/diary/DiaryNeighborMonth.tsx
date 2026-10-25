'use client';
import type { ComponentProps } from 'react';
import { useDiaryPlacementStore, selectPlacementsForMonth } from '@/store/diaryPlacementStore';
import type { DiarySticker } from '@/types';
import { DiaryMonthGrid } from './DiaryMonthGrid';
import { DiaryStickerViewLayer } from './DiaryStickerViewLayer';

type GridProps = Omit<
  ComponentProps<typeof DiaryMonthGrid>,
  'year' | 'monthIndex' | 'todayPulseKey' | 'onSelect' | 'onSelectEvent'
>;

interface DiaryNeighborMonthProps extends GridProps {
  year: number;
  monthIndex: number;
  side: 'prev' | 'next';
  stickers: DiarySticker[];
  urls: Record<string, string>;
}

const noop = () => undefined;

/**
 * 스와이프하는 동안 옆에서 따라 들어오는 이전·다음 달. 보기 전용이라 탭을 받지 않는다 —
 * 놓으면 이 달이 가운데로 와서 진짜 달력으로 바뀐다.
 */
export function DiaryNeighborMonth({
  year,
  monthIndex,
  side,
  stickers,
  urls,
  ...grid
}: DiaryNeighborMonthProps) {
  const placements = useDiaryPlacementStore(selectPlacementsForMonth(year, monthIndex));
  return (
    <div
      aria-hidden
      inert
      // 가운데 달과 16px 띄운다 — useHorizontalSwipe 의 pageGap 과 같은 값.
      className={
        'pointer-events-none absolute top-0 w-full ' +
        (side === 'prev' ? 'right-full mr-4' : 'left-full ml-4')
      }
    >
      <DiaryStickerViewLayer placements={placements} stickers={stickers} urls={urls}>
        <div className="rounded-2xl bg-brand-white/95 py-2">
          <DiaryMonthGrid
            {...grid}
            year={year}
            monthIndex={monthIndex}
            onSelect={noop}
          />
        </div>
      </DiaryStickerViewLayer>
    </div>
  );
}
