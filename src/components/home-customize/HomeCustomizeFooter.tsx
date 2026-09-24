'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';

interface HomeCustomizeFooterProps {
  enabled: boolean;
  /** Upload in flight — the button shows "Saving…" and ignores taps. */
  saving?: boolean;
  onSubmit: () => void;
  /** Optional inline hint shown above the button (used when the submit is
   * disabled specifically because picks haven't been confirmed yet). */
  hint?: string;
}

export function HomeCustomizeFooter({
  enabled,
  saving = false,
  onSubmit,
  hint,
}: HomeCustomizeFooterProps) {
  const t = useT();
  return (
    <footer
      className={cn(
        'px-4 pb-8 pt-5 transition-colors',
        enabled
          ? 'bg-brand-gray900 has-[button:active:not(:disabled)]:bg-brand-gray800'
          : 'bg-brand-gray300',
      )}
    >
      {hint ? (
        <p
          className={cn(
            'mb-2 text-center text-xs leading-[1.4]',
            enabled ? 'text-brand-pink100/70' : 'text-brand-gray600',
          )}
        >
          {hint}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!enabled || saving}
        aria-busy={saving}
        onClick={onSubmit}
        className={cn(
          'block w-full text-center text-xl font-semibold leading-[normal] transition-colors',
          !enabled
            ? 'cursor-not-allowed text-brand-gray500'
            : saving
              ? 'text-brand-pink100/60'
              : 'text-brand-pink100 hover:text-brand-pink100/80 active:text-brand-pink100/60',
        )}
      >
        {saving ? t.home.customize.submitting : t.home.customize.submit}
      </button>
    </footer>
  );
}
