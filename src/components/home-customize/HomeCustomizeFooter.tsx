'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';

interface HomeCustomizeFooterProps {
  enabled: boolean;
  onSubmit: () => void;
}

export function HomeCustomizeFooter({ enabled, onSubmit }: HomeCustomizeFooterProps) {
  const t = useT();
  return (
    <footer
      className={cn(
        'px-4 pb-8 pt-5 transition-colors',
        enabled ? 'bg-brand-gray900' : 'bg-brand-gray400',
      )}
    >
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
