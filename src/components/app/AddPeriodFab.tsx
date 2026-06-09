'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { PeriodRangeDialog, type AddPeriodInput } from './PeriodRangeDialog';

export type { AddPeriodInput };

interface AddPeriodFabProps {
  today: string;
  defaultPeriodLength: number;
  onSubmit: (input: AddPeriodInput) => Promise<void>;
}

export function AddPeriodFab({ today, defaultPeriodLength, onSubmit }: AddPeriodFabProps) {
  const t = useT();
  const [open, setOpen] = useState(false);

  async function handleSubmit(input: AddPeriodInput) {
    await onSubmit(input);
    setOpen(false);
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex w-full max-w-md justify-end px-5">
        <button
          type="button"
          aria-label={t.home.startPeriodButton}
          onClick={() => setOpen(true)}
          className={cn(
            'pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full',
            'bg-brand-gray900 text-brand-white shadow-[0_4px_12px_0_rgba(0,0,0,0.18)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2',
          )}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open ? (
        <PeriodRangeDialog
          initialStartDate={today}
          defaultPeriodLength={defaultPeriodLength}
          today={today}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
