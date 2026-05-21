'use client';
import { useMemo } from 'react';
import { ChoiceGroup } from '@/components/ui/ChoiceGroup';

interface ConditionRowProps<T extends string> {
  label: string;
  values: ReadonlyArray<T>;
  labels: Record<T, string>;
  value: T | null;
  onChange: (value: T) => void;
}

export function ConditionRow<T extends string>({
  label,
  values,
  labels,
  value,
  onChange,
}: ConditionRowProps<T>) {
  const choices = useMemo(
    () => values.map((v) => ({ value: v, label: labels[v] })),
    [values, labels],
  );
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-neutral-700">{label}</h2>
      <ChoiceGroup ariaLabel={label} choices={choices} value={value} onChange={onChange} />
    </section>
  );
}
