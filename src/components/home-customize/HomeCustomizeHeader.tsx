'use client';
import { useT } from '@/i18n/useT';
import { BackIcon24 } from '@/components/ui/icons';

interface HomeCustomizeHeaderProps {
  onBack: () => void;
}

export function HomeCustomizeHeader({ onBack }: HomeCustomizeHeaderProps) {
  const t = useT();
  return (
    <header className="sticky top-0 z-20 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center pt-[env(safe-area-inset-top,0px)] gap-3 bg-brand-gray50 px-4">
      <button
        type="button"
        data-swipe-back
        onClick={onBack}
        aria-label={t.home.customize.back}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
      >
        <BackIcon24 className="h-5 w-5" />
      </button>
      <h1 className="text-lg font-semibold leading-6 text-brand-gray900">
        {t.home.customize.title}
      </h1>
    </header>
  );
}
