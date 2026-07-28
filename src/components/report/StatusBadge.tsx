'use client';
import { cn } from '@/lib/cn';
import type { CycleStatus } from '@/domain/cycle/status';

interface StatusBadgeProps {
  status: CycleStatus;
  label: string;
  onInfoClick?: () => void;
  infoAriaLabel: string;
}

const TONE: Record<CycleStatus, { bg: string; fg: string }> = {
  stable: { bg: 'bg-[#E2FDF0]', fg: 'text-[#008450]' },
  regular: { bg: 'bg-[#E2FDF0]', fg: 'text-[#008450]' },
  slightlyIrregular: { bg: 'bg-[#FFF6DA]', fg: 'text-[#B58900]' },
  shortPeriod: { bg: 'bg-[#FFF6DA]', fg: 'text-[#B58900]' },
  longPeriod: { bg: 'bg-[#FFF6DA]', fg: 'text-[#B58900]' },
  irregular: { bg: 'bg-[#FFE9D9]', fg: 'text-[#C15A00]' },
  insufficient: { bg: 'bg-brand-gray200', fg: 'text-brand-gray700' },
};

export function StatusBadge({ status, label, onInfoClick, infoAriaLabel }: StatusBadgeProps) {
  const tone = TONE[status];
  return (
    <div className="flex items-center gap-1">
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full px-[7px] py-1 text-xs font-semibold',
          tone.bg,
          tone.fg,
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onInfoClick}
        aria-label={infoAriaLabel}
        className="flex h-4 w-4 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="8" fill="#D5D3D4" />
          <path
            d="M6.5 6.15c0-.85.68-1.55 1.5-1.55s1.5.7 1.5 1.55c0 .58-.32.9-.78 1.2-.52.33-.72.53-.72.95v.35"
            stroke="#FFFDFE"
            strokeWidth="1.1"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11.15" r="0.72" fill="#FFFDFE" />
        </svg>
      </button>
    </div>
  );
}
