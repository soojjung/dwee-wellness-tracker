'use client';
import { cn } from '@/lib/cn';

interface Choice<T extends string> {
  value: T;
  label: string;
}

type ChoiceGroupVariant = 'filled' | 'outline';

interface ChoiceGroupProps<T extends string> {
  choices: ReadonlyArray<Choice<T>>;
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
  /**
   * 'filled' (default) — equal-width dark/light pill, used by the existing
   * today-check-in screens. 'outline' — hug-content pill with a gray border
   * that fills solid on selection (Figma event-sheet condition chips).
   */
  variant?: ChoiceGroupVariant;
}

const CONTAINER_CLASS: Record<ChoiceGroupVariant, string> = {
  filled: 'flex gap-2',
  outline: 'flex flex-wrap gap-1',
};

export function ChoiceGroup<T extends string>({
  choices,
  value,
  onChange,
  className,
  ariaLabel,
  variant = 'filled',
}: ChoiceGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(CONTAINER_CLASS[variant], className)}
    >
      {choices.map((c) => {
        const active = c.value === value;
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.value)}
            className={
              variant === 'outline'
                ? cn(
                    'rounded-full border px-3 py-2 text-sm transition-colors',
                    active
                      ? 'border-brand-gray900 bg-brand-gray900 text-brand-white'
                      : 'border-brand-gray300 bg-transparent text-brand-gray600',
                  )
                : cn(
                    'flex-1 rounded-full px-4 py-2 text-sm transition-colors',
                    active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700',
                  )
            }
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
