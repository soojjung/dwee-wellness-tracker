'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { CheckIcon24 } from '@/components/ui/icons';

interface ConsentCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Login-screen consent row (release STEP 1.5): "14 or older + agree to the
 * Terms / Privacy Policy". The document links open the public `/legal/*`
 * pages so they work before any session exists.
 */
export function ConsentCheck({ checked, onChange }: ConsentCheckProps) {
  const t = useT();
  const c = t.auth.consent;
  return (
    <label className="flex cursor-pointer items-start gap-2.5 px-1 text-sm leading-[1.5] text-auth-linkMuted">
      <span className="relative mt-0.5 flex size-[18px] shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={c.ariaLabel}
          data-testid="consent-check"
          className={cn(
            'peer size-[18px] shrink-0 appearance-none rounded-[5px] border border-brand-gray400 bg-brand-white',
            'checked:border-auth-button checked:bg-auth-button',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2',
          )}
        />
        <CheckIcon24 className="pointer-events-none absolute inset-0 m-auto size-3.5 text-auth-buttonText opacity-0 peer-checked:opacity-100" />
      </span>
      <span>
        {c.prefix}
        <Link
          href="/legal/terms"
          className="font-medium text-brand-gray900 underline underline-offset-2"
        >
          {c.terms}
        </Link>
        {c.join}
        <Link
          href="/legal/privacy"
          className="font-medium text-brand-gray900 underline underline-offset-2"
        >
          {c.privacy}
        </Link>
        {c.suffix}
      </span>
    </label>
  );
}
