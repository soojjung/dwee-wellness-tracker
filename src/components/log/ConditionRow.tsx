'use client';
import { useMemo } from 'react';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';

interface ConditionRowProps<T extends string> {
  label: string;
  values: ReadonlyArray<T>;
  labels: Record<T, string>;
  value: T | null;
  onChange: (value: T) => void;
  /** See `ChoiceGroup` — 'filled' (default) keeps today-check-in styling. */
  variant?: 'filled' | 'outline';
}

export function ConditionRow<T extends string>({
  label,
  values,
  labels,
  value,
  onChange,
  variant = 'filled',
}: ConditionRowProps<T>) {
  const choices = useMemo(
    () => values.map((v) => ({ value: v, label: labels[v] })),
    [values, labels],
  );
  const labelClass =
    variant === 'outline'
      ? 'text-base font-medium text-brand-gray900'
      : 'text-sm font-medium text-neutral-700';
  return (
    <section className="flex flex-col gap-2">
      <h2 className={labelClass}>{label}</h2>
      <ChoiceGroup
        ariaLabel={label}
        choices={choices}
        value={value}
        onChange={onChange}
        variant={variant}
      />
    </section>
  );
}
