'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';

interface HomeCustomizeFooterProps {
  enabled: boolean;
  onSubmit: () => void;
  /** Optional inline hint shown above the button (used when the submit is
   * disabled specifically because picks haven't been confirmed yet). */
  hint?: string;
}

export function HomeCustomizeFooter({
  enabled,
  onSubmit,
  hint,
}: HomeCustomizeFooterProps) {
  const t = useT();
  return (
    <footer
      className={cn(
        'px-4 pb-8 pt-5 transition-colors',
        enabled ? 'bg-brand-gray900' : 'bg-brand-gray400',
      )}
    >
      {hint ? (
        <p
          className={cn(
            'mb-2 text-center text-xs leading-[1.4]',
            enabled ? 'text-brand-pink100/70' : 'text-brand-gray200',
          )}
        >
          {hint}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!enabled}
        onClick={onSubmit}
        className={cn(
          'block w-full text-center text-xl font-semibold leading-[normal] transition-colors',
          enabled ? 'text-brand-pink100' : 'cursor-default text-brand-gray200',
        )}
      >
        {t.home.customize.submit}
      </button>
    </footer>
  );
}
