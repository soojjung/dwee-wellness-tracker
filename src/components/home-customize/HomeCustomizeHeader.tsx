import Link from 'next/link';
import { useT } from '@/i18n/useT';

export function HomeCustomizeHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center bg-brand-gray50 px-4">
      <Link
        href="/"
        aria-label={t.home.customize.back}
        className="flex h-6 w-6 items-center justify-center text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M8 19L1 12L8 5" />
    </svg>
  );
}
