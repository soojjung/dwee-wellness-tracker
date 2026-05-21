'use client';
import { cn } from '@/lib/cn';

interface Choice<T extends string> {
  value: T;
  label: string;
}

interface ChoiceGroupProps<T extends string> {
  choices: ReadonlyArray<Choice<T>>;
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function ChoiceGroup<T extends string>({
  choices,
  value,
  onChange,
  className,
  ariaLabel,
}: ChoiceGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('flex gap-2', className)}>
      {choices.map((c) => {
        const active = c.value === value;
        return (
          <button
            key={c.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.value)}
            className={cn(
              'flex-1 rounded-full px-4 py-2 text-sm transition-colors',
              active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700',
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
