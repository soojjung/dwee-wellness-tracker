'use client';
import { fromISO } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { CellMarkers } from './cellState';

interface DayCellProps {
  date: string;
  inCurrentMonth: boolean;
  markers: CellMarkers;
  onSelect: (date: string) => void;
}

export function DayCell({ date, inCurrentMonth, markers, onSelect }: DayCellProps) {
  const day = fromISO(date).getDate();
  const { background, predicted, hasCondition, isToday } = markers;

  return (
    <button
      type="button"
      onClick={() => onSelect(date)}
      className={cn(
        'relative flex h-11 items-center justify-center rounded-full text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1',
        background === 'menstrual' && 'bg-calendar-menstrualBg text-calendar-menstrualFg font-medium',
        predicted && 'ring-2 ring-calendar-predictedRing ring-inset',
        isToday && !background && 'ring-1 ring-neutral-900',
        !background && !inCurrentMonth && 'text-neutral-300',
        !background && inCurrentMonth && 'text-neutral-800',
      )}
      aria-label={date}
    >
      <span>{day}</span>
      {hasCondition ? (
        <span
          aria-hidden
          className="absolute bottom-1 h-1 w-1 rounded-full bg-calendar-conditionDot"
        />
      ) : null}
    </button>
  );
}
