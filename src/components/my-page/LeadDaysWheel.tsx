'use client';
import { cn } from '@/lib/cn';
import { WheelColumn, WHEEL_ITEM_HEIGHT } from '@/components/ui/WheelColumn';

// Reminder lead-time range shown in the timing picker (0–14 days before).
const LEAD_DAY_MIN = 0;
const LEAD_DAY_MAX = 14;

interface LeadDaysWheelProps {
  value: number;
  onChange: (days: number) => void;
  /** Unit marker appended to the number ('일' in ko, '' in en). */
  unit: string;
  /** Static right-column label ('전 알림' in ko, 'days before' in en). */
  trailingLabel: string;
}

const WHEEL_ROWS = 3;
const LEAD_DAY_ITEMS = Array.from(
  { length: LEAD_DAY_MAX - LEAD_DAY_MIN + 1 },
  (_, i) => LEAD_DAY_MIN + i,
);

/**
 * Figma 292:2721 — 3-row scroll wheel. Drag/flick (or tap a neighbour) to
 * change the value; only the centre row carries the pink underline, and the
 * rows above/below fade out. Right column is a static trailing label aligned
 * with the centre row. At value=0 the whole "0일 전 알림" phrase turns pink
 * (Figma spec #3).
 */
export function LeadDaysWheel({ value, onChange, unit, trailingLabel }: LeadDaysWheelProps) {
  const isZero = value === 0;
  const centreText = isZero ? 'text-brand-pink300' : 'text-brand-gray900';
  const wheelHeight = WHEEL_ITEM_HEIGHT * WHEEL_ROWS;

  return (
    <div className="py-3.5">
      <div className="mx-auto grid w-52 grid-cols-2" style={{ height: wheelHeight }}>
        {/* Numbers column — underline sits on the centre row only. Explicit
            height (not h-full): an auto grid row would stretch to the full
            15-item list and push the wheel out of its 3-row window. */}
        <div className="relative min-h-0 overflow-hidden" style={{ height: wheelHeight }}>
          <WheelColumn
            items={LEAD_DAY_ITEMS.map((n) => ({ key: n, label: `${n}${unit}` }))}
            selectedKey={value}
            onSelectKey={(k) => onChange(Number(k))}
            className="h-full"
            selectedClassName={cn('text-base font-medium', centreText)}
            idleClassName="text-base text-brand-gray400"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-brand-pink200"
            style={{ marginTop: WHEEL_ITEM_HEIGHT / 2 - 1 }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-brand-white/80 to-transparent"
            style={{ height: WHEEL_ITEM_HEIGHT }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-white/80 to-transparent"
            style={{ height: WHEEL_ITEM_HEIGHT }}
          />
        </div>

        {/* Trailing label column ("전 알림" / "days before") */}
        <div
          className={cn('flex items-center justify-center text-base font-medium', centreText)}
          style={{ height: wheelHeight }}
        >
          {trailingLabel}
        </div>
      </div>
    </div>
  );
}

export function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        'h-4 w-4 text-brand-pink300 transition-transform',
        open ? 'rotate-180' : 'rotate-0',
      )}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
