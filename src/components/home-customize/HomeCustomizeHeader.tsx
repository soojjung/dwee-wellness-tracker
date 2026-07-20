import Link from 'next/link';
import { useT } from '@/i18n/useT';

export function HomeCustomizeHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-brand-gray50 px-4">
      <Link
        href="/"
        aria-label={t.home.customize.back}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
      >
        <BackIcon />
      </Link>
      <h1 className="text-lg font-semibold leading-6 text-brand-gray900">{t.home.customize.title}</h1>
    </header>
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
