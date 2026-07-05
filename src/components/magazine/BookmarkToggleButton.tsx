'use client';
import { useT } from '@/i18n/useT';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { BookmarkIcon } from '@/components/ui/icons';

interface BookmarkToggleButtonProps {
  slug: string;
  className?: string;
  iconClassName?: string;
}

export function BookmarkToggleButton({ slug, className, iconClassName }: BookmarkToggleButtonProps) {
  const t = useT();
  const saved = useBookmarkStore((s) => s.slugs.includes(slug));
  const toggle = useBookmarkStore((s) => s.toggle);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggle(slug);
      }}
      aria-pressed={saved}
      aria-label={saved ? t.magazine.bookmark.unsaveAria : t.magazine.bookmark.saveAria}
      className={className}
    >
      <BookmarkIcon filled={saved} className={iconClassName} />
    </button>
  );
}
