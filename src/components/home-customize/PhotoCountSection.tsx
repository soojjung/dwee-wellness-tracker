'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { PHOTO_COUNTS, type PhotoCount } from '@/domain/home/decor';

const COUNT_TO_KEY: Record<PhotoCount, 'one' | 'two' | 'four'> = {
  1: 'one',
  2: 'two',
  4: 'four',
};

interface PhotoCountSectionProps {
  selected: PhotoCount | null;
  onSelect: (count: PhotoCount) => void;
}

export function PhotoCountSection({ selected, onSelect }: PhotoCountSectionProps) {
  const t = useT();
  return (
    <section className="px-4 pt-4">
      <h2 className="text-lg font-semibold text-brand-gray900">{t.home.customize.photo.title}</h2>
      <p className="mt-1 text-xs leading-[1.5] text-brand-gray800">{t.home.customize.photo.hint}</p>
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {PHOTO_COUNTS.map((count) => {
          const isSelected = selected === count;
          return (
            <li key={count}>
              <button
                type="button"
                onClick={() => onSelect(count)}
                aria-pressed={isSelected}
                aria-label={t.home.customize.photo.count[COUNT_TO_KEY[count]]}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl py-4 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-[0.75px] border-brand-pink200 bg-brand-pink50'
                    : 'border-[0.75px] border-brand-gray400 bg-transparent hover:bg-brand-gray200',
                )}
              >
                <PhotoLayoutIcon count={count} />
                <span className="text-xs font-semibold text-brand-gray900">
                  {t.home.customize.photo.count[COUNT_TO_KEY[count]]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PhotoLayoutIcon({ count }: { count: PhotoCount }) {
  if (count === 1) {
    return <div className="h-5 w-5 rounded-[4px] border-2 border-brand-gray900" aria-hidden />;
  }
  if (count === 2) {
    return (
      <svg viewBox="0 0 20 20" fill="none" stroke="#353434" strokeWidth="2" className="h-5 w-5" aria-hidden>
        <rect x="1" y="1" width="18" height="18" rx="3" />
        <line x1="1" y1="10" x2="19" y2="10" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="#353434" strokeWidth="2" className="h-5 w-5" aria-hidden>
      <rect x="1" y="1" width="18" height="18" rx="3" />
      <line x1="1" y1="10" x2="19" y2="10" />
      <line x1="10" y1="1" x2="10" y2="19" />
    </svg>
  );
}
