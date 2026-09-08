'use client';
import { cn } from '@/lib/cn';

interface MyPageToggleProps {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
  disabled?: boolean;
}

/**
 * Pink pill switch — Figma 292:2694: 50×24 track, 30×20 pill thumb,
 * Pink/100 when on, Gray/400 when off. Uses inline-flex + inner padding to
 * anchor the thumb at the left edge of the track; `translate-x-*` only
 * shifts to the "on" position, so we don't rely on `absolute` static
 * placement (which spilled the thumb outside the track on some browsers).
 */
export function MyPageToggle({
  enabled,
  onToggle,
  ariaLabel,
  disabled = false,
}: MyPageToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'inline-flex h-6 w-[50px] shrink-0 items-center rounded-full p-0.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300 focus-visible:ring-offset-1',
        'disabled:opacity-60',
        enabled ? 'bg-brand-pink100' : 'bg-brand-gray400',
      )}
    >
      <span
        className={cn(
          'block h-5 w-[30px] rounded-full bg-brand-white shadow transition-transform',
          enabled ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}
