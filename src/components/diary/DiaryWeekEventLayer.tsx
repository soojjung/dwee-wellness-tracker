'use client';
import type { EventLog, EventCategory } from '@/types';
import { paletteFor } from '@/domain/event/palette';
import type { WeekSegment } from '@/domain/event/weekLanes';

interface DiaryWeekEventLayerProps {
  segments: WeekSegment[];
  categoriesById: Map<string, EventCategory>;
  onSelectEvent?: (event: EventLog) => void;
}

/**
 * Overlay for one calendar row: each event is a single bar spanning every
 * column it covers, stacked by lane. Sits below the date number and the
 * holiday line (pt-2 + 19px number + 2 + 12px line in DiaryDayCell) and lets
 * clicks on empty space fall through to the day cells.
 */
export function DiaryWeekEventLayer({
  segments,
  categoriesById,
  onSelectEvent,
}: DiaryWeekEventLayerProps) {
  if (segments.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[43px] grid auto-rows-[16px] grid-cols-7 gap-y-0.5">
      {segments.map((seg) => {
        const cat = categoriesById.get(seg.event.categoryId);
        const p = paletteFor(cat?.colorId ?? 'gray');
        return (
          <button
            key={`${seg.event.id}-${seg.startCol}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectEvent?.(seg.event);
            }}
            style={{
              gridColumn: `${seg.startCol + 1} / ${seg.endCol + 2}`,
              gridRow: seg.lane + 1,
              backgroundColor: p.bg,
            }}
            className={
              'pointer-events-auto block min-w-0 px-1 py-[2px] text-left text-[12px] font-medium leading-none text-brand-gray900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-pink800 ' +
              (seg.continuesBefore ? '' : 'ml-1 rounded-l ') +
              (seg.continuesAfter ? '' : 'mr-1 rounded-r ') +
              (seg.outOfMonth ? 'opacity-40' : '')
            }
          >
            {/* 한 줄 높이에 글자 단위 줄바꿈 → 칸에 다 안 들어가는 글자는 다음 줄로 넘어가 통째로 가려진다.
                한 줄로 두고 자르면 마지막 글자가 반쯤 잘려 보인다(R8-7). */}
            <span className="block h-3 overflow-hidden break-all">{seg.event.title}</span>
          </button>
        );
      })}
    </div>
  );
}
