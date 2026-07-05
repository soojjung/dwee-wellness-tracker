'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { getArticleBySlug, getArticleContent } from '@/data/magazine/articles';
import { BackIcon } from '@/components/ui/icons';
import { ArticleSectionView } from './ArticleSectionView';
import { BookmarkToggleButton } from './BookmarkToggleButton';

interface ArticleScreenProps {
  slug: string;
}

export function ArticleScreen({ slug }: ArticleScreenProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const hydrateBookmarks = useBookmarkStore((s) => s.hydrate);
  const bookmarksHydrated = useBookmarkStore((s) => s.hydrated);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
    if (!bookmarksHydrated) hydrateBookmarks();
  }, [settingsHydrated, hydrateSettings, bookmarksHydrated, hydrateBookmarks]);

  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="flex flex-col gap-4 px-6 pt-16">
        <Link
          href="/magazine"
          className="text-sm font-medium text-brand-pink800 focus-visible:underline focus-visible:outline-none"
        >
          ← {t.magazine.backToList}
        </Link>
        <p className="text-sm text-brand-gray800">{t.magazine.notFound}</p>
      </div>
    );
  }

  const content = getArticleContent(article, locale);
  const cta = content.cta;

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand-gray50">
      <TopBar backAria={t.magazine.backToList} slug={article.slug} />

      <div className="relative h-[508px] w-full shrink-0">
        <Image src={article.cover} alt="" fill sizes="100vw" priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-4 text-brand-gray50">
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-bold leading-normal">
              {content.title}
              {content.heroEmoji ? ` ${content.heroEmoji}` : null}
            </p>
            <p className="text-lg leading-normal text-brand-gray300">{content.subtitle}</p>
          </div>
          <p className="text-xs leading-normal text-brand-gray500">{article.publishedAt}</p>
        </div>
      </div>

      <article className={`flex flex-col gap-6 pt-8 ${cta ? 'pb-40' : 'pb-16'}`}>
        {content.sections.map((section, i) => (
          <ArticleSectionView key={i} section={section} />
        ))}
      </article>

      {cta ? (
        <div className="fixed inset-x-0 bottom-0 z-30 bg-brand-gray50 pb-[env(safe-area-inset-bottom,0px)]">
          <Link
            href={cta.href}
            className="flex items-center justify-center bg-brand-gray900 py-4 text-xl font-semibold leading-[normal] text-brand-pink100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {cta.label}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

interface TopBarProps {
  backAria: string;
  slug: string;
}

function TopBar({ backAria, slug }: TopBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3">
      <Link
        href="/magazine"
        aria-label={backAria}
        className="pointer-events-auto grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray50/60"
      >
        <BackIcon className="size-10" />
      </Link>
      <BookmarkToggleButton
        slug={slug}
        className="pointer-events-auto grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray50 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray50/60"
        iconClassName="size-5"
      />
    </div>
  );
}
