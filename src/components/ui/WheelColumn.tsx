'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export const WHEEL_ITEM_HEIGHT = 44;

export interface WheelItem {
  key: number | string;
  label: string;
}

interface WheelColumnProps {
  items: WheelItem[];
  selectedKey: number | string;
  onSelectKey: (key: number | string) => void;
  itemHeight?: number;
  /** Classes for the centred (selected) row — defaults to the diary picker look. */
  selectedClassName?: string;
  /** Classes for every other row. */
  idleClassName?: string;
  className?: string;
}

/**
 * Scroll-snap wheel: drag/flick to scroll, the row that settles in the middle
 * becomes the selection; tapping a row also selects it. Parent controls the
 * visible height (3 rows = `itemHeight * 3`, etc.).
 */
export function WheelColumn({
  items,
  selectedKey,
  onSelectKey,
  itemHeight = WHEEL_ITEM_HEIGHT,
  selectedClassName = 'text-lg font-semibold text-brand-gray900',
  idleClassName = 'text-lg text-brand-gray400',
  className,
}: WheelColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idx = items.findIndex((it) => it.key === selectedKey);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || idx < 0) return;
    el.scrollTop = idx * itemHeight;
  }, [idx, itemHeight]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const nextIdx = Math.round(el.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, nextIdx));
      const target = items[clamped];
      if (target && target.key !== selectedKey) onSelectKey(target.key);
    }, 90);
  }

  const spacer = `calc(50% - ${itemHeight / 2}px)`;

  return (
    <div className={cn('relative flex-1 overflow-hidden', className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        // No scroll-padding: the spacers already centre the first/last rows, so
        // `snap-center` lines the selected row up with the scrollport centre at
        // exactly `idx * itemHeight`. Padding on top of that shifted every row
        // by half an item.
        className="h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: spacer }} aria-hidden />
        {items.map((it) => {
          const isSelected = it.key === selectedKey;
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => onSelectKey(it.key)}
              className={cn(
                'flex w-full snap-center items-center justify-center transition-colors',
                isSelected ? selectedClassName : idleClassName,
              )}
              style={{ height: itemHeight }}
            >
              {it.label}
            </button>
          );
        })}
        <div style={{ height: spacer }} aria-hidden />
      </div>
    </div>
  );
}
