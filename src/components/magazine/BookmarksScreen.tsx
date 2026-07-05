'use client';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { listArticles, getArticleContent, type Article } from '@/data/magazine/articles';
import { BookmarkToggleButton } from './BookmarkToggleButton';
import { BackIcon, BookmarkIcon } from '@/components/ui/icons';

export function BookmarksScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const savedSlugs = useBookmarkStore((s) => s.slugs);
  const hydrateBookmarks = useBookmarkStore((s) => s.hydrate);
  const bookmarksHydrated = useBookmarkStore((s) => s.hydrated);

  useEffect(() => {
    if (!settingsHydrated) hydrateSettings();
    if (!bookmarksHydrated) hydrateBookmarks();
  }, [settingsHydrated, hydrateSettings, bookmarksHydrated, hydrateBookmarks]);

  const saved = useMemo<readonly Article[]>(() => {
    const all = listArticles();
    const set = new Set(savedSlugs);
    return all.filter((a) => set.has(a.slug));
  }, [savedSlugs]);

  return (
    <div className="relative flex min-h-dvh flex-col bg-brand-gray50">
      <Header backAria={t.magazine.bookmarks.backAria} />
      {saved.length === 0 ? (
        <EmptyState
          title={t.magazine.bookmarks.emptyTitle}
          body={t.magazine.bookmarks.emptyBody}
        />
      ) : (
        <BookmarkGrid articles={saved} locale={locale} />
      )}
    </div>
  );
}

interface HeaderProps {
  backAria: string;
}

function Header({ backAria }: HeaderProps) {
  return (
    <header className="relative flex items-center justify-between px-4 pt-3 pb-2">
      <Link
        href="/magazine"
        aria-label={backAria}
        className="grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
      >
        <BackIcon className="size-10" />
      </Link>
    </header>
  );
}

function BookmarkGrid({
  articles,
  locale,
}: {
  articles: readonly Article[];
  locale: 'en' | 'ko';
}) {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 pt-4 pb-16">
      {articles.map((article) => (
        <BookmarkCard key={article.slug} article={article} locale={locale} />
      ))}
    </div>
  );
}

function BookmarkCard({ article, locale }: { article: Article; locale: 'en' | 'ko' }) {
  const content = getArticleContent(article, locale);
  return (
    <Link
      href={`/magazine/${article.slug}`}
      className="relative block aspect-[175/220] overflow-hidden rounded-2xl bg-brand-gray400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
    >
      <Image
        src={article.cover}
        alt=""
        fill
        sizes="(max-width: 480px) 50vw, 240px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
      <p className="absolute inset-x-3 bottom-3 text-lg font-medium leading-normal text-brand-gray50">
        {content.title}
      </p>
      <BookmarkToggleButton
        slug={article.slug}
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-brand-gray400/50 text-brand-pink200 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray50/60"
        iconClassName="size-4"
      />
    </Link>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-24 text-center">
      <div className="grid size-[70px] place-items-center rounded-full bg-brand-pink50 text-brand-pink200">
        <BookmarkIcon filled className="size-8" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold leading-normal text-brand-gray900">{title}</p>
        <p className="text-base leading-normal text-brand-gray800">{body}</p>
      </div>
    </div>
  );
}

