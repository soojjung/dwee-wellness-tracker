'use client';
import { cn } from '@/lib/cn';

interface MyPageToggleProps {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

/**
 * Pink pill switch. Uses inline-flex + inner padding to anchor the thumb
 * predictably at the left edge of the track; the `translate-x-*` only
 * shifts to the "on" position, so we don't rely on `absolute` static
 * placement (which caused the thumb to spill outside on some browsers).
 */
export function MyPageToggle({ enabled, onToggle, ariaLabel }: MyPageToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={cn(
        'inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-1',
        enabled ? 'bg-brand-pink200' : 'bg-brand-gray300',
      )}
    >
      <span
        className={cn(
          'block h-6 w-6 rounded-full bg-brand-white shadow transition-transform',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}
