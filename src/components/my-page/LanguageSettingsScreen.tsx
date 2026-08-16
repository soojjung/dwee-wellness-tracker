'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { useSettingsStore } from '@/store/settingsStore';
import type { Locale } from '@/types';

interface LanguageOption {
  value: Locale;
  labelKey: 'koreanLabel' | 'englishLabel';
}

const OPTIONS: readonly LanguageOption[] = [
  { value: 'ko', labelKey: 'koreanLabel' },
  { value: 'en', labelKey: 'englishLabel' },
];

/**
 * 015_4 language picker. Selecting an option updates `settings.locale`
 * immediately — no separate save button, matching the Figma flow. Back
 * arrow returns to MyPage.
 */
export function LanguageSettingsScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const update = useSettingsStore((s) => s.update);

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center bg-brand-gray50 px-4">
          <Link
            href="/settings"
            aria-label={t.myPage.language.backAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
        </header>

        <main className="flex flex-1 flex-col gap-2 px-4">
          <div className="overflow-hidden rounded-2xl bg-brand-white">
            {OPTIONS.map((opt, idx) => {
              const selected = locale === opt.value;
              const label = t.myPage.language[opt.labelKey];
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (!selected) void update({ locale: opt.value });
                  }}
                  aria-pressed={selected}
                  className={cn(
                    'flex h-14 w-full items-center gap-3 px-4 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900',
                    idx > 0 && 'border-t border-brand-gray200',
                    selected
                      ? 'text-brand-gray900'
                      : 'text-brand-gray700 hover:bg-brand-gray100',
                  )}
                >
                  <RadioIndicator selected={selected} />
                  <span className="text-base font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
        selected ? 'bg-brand-gray900 text-brand-white' : 'border border-brand-gray400 bg-transparent',
      )}
      aria-hidden
    >
      {selected ? (
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path d="M2.5 6.5L5 9L9.5 3.5" />
        </svg>
      ) : null}
    </span>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
