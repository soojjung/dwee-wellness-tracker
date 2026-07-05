'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { listArticles, getArticleContent, type Article } from '@/data/magazine/articles';
import type { Locale } from '@/types';
import { BookmarkIcon } from '@/components/ui/icons';
import { formatPublishedAt } from './formatPublishedAt';

export function MagazineScreen() {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const articles = listArticles();
  const featured = articles.slice(0, 1);
  const rest = articles.slice(1);

  if (articles.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold text-brand-gray900">{t.magazine.listTitle}</h1>
        <p className="text-base text-brand-gray800">{t.magazine.listEmpty}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <FeaturedSection articles={featured} locale={locale} />
      {rest.length > 0 ? (
        <BasicList articles={rest} locale={locale} title={t.magazine.moreStoriesTitle} />
      ) : null}
    </div>
  );
}

interface FeaturedSectionProps {
  articles: readonly Article[];
  locale: Locale;
}

function FeaturedSection({ articles, locale }: FeaturedSectionProps) {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeArticle = articles[activeIndex] ?? articles[0];

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const items = scroller.querySelectorAll<HTMLElement>('[data-featured-item]');
    if (items.length <= 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio as active.
        let bestRatio = 0;
        let bestIndex = activeIndex;
        for (const entry of entries) {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = Number(entry.target.getAttribute('data-featured-index'));
          }
        }
        if (bestRatio > 0.5) setActiveIndex(bestIndex);
      },
      { root: scroller, threshold: [0.4, 0.6, 0.8, 1.0] },
    );
    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [articles.length, activeIndex]);

  if (!activeArticle) return null;

  return (
    <section className="relative overflow-hidden pb-2">
      <div aria-hidden className="pointer-events-none absolute -inset-x-12 -top-12 h-[520px]">
        <Image
          src={activeArticle.cover}
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover blur-2xl"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-brand-gray50" />
      </div>

      <header className="relative flex items-center justify-between px-4 pt-3 pb-4">
        <h1 className="text-2xl font-semibold leading-normal text-brand-gray50">
          {t.magazine.listTitle}
        </h1>
        <Link
          href="/magazine/bookmarks"
          aria-label={t.magazine.bookmark.openAria}
          className="grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[1.5px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray50/60"
        >
          <BookmarkIcon filled className="size-6" />
        </Link>
      </header>

      <div
        ref={scrollerRef}
        className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 pl-8 pr-8"
        style={{ scrollbarWidth: 'none' }}
      >
        {articles.map((article, i) => (
          <FeaturedCard
            key={article.slug}
            article={article}
            locale={locale}
            counter={`${i + 1}/${articles.length}`}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

interface FeaturedCardProps {
  article: Article;
  locale: Locale;
  counter: string;
  index: number;
}

function FeaturedCard({ article, locale, counter, index }: FeaturedCardProps) {
  const content = getArticleContent(article, locale);
  return (
    <Link
      href={`/magazine/${article.slug}`}
      data-featured-item
      data-featured-index={index}
      className="relative block aspect-square h-[330px] w-[330px] shrink-0 snap-center overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray50/60"
    >
      <Image
        src={article.cover}
        alt=""
        fill
        sizes="330px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-1 text-brand-gray50">
        <p className="text-xl font-semibold leading-normal">{content.title}</p>
        <p className="whitespace-pre-line text-base leading-normal text-brand-gray300">
          {content.subtitle}
        </p>
      </div>
      <span className="absolute bottom-5 right-5 rounded-full bg-brand-gray900/30 px-2 py-1 text-xs font-medium text-brand-gray300">
        {counter}
      </span>
    </Link>
  );
}

interface BasicListProps {
  articles: readonly Article[];
  locale: Locale;
  title: string;
}

function BasicList({ articles, locale, title }: BasicListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-4 text-2xl font-semibold leading-normal text-brand-gray900">{title}</h2>
      <ul className="flex flex-col">
        {articles.map((article) => (
          <li key={article.slug}>
            <BasicRow article={article} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function BasicRow({ article, locale }: { article: Article; locale: Locale }) {
  const content = getArticleContent(article, locale);
  return (
    <Link
      href={`/magazine/${article.slug}`}
      className="flex items-center gap-4 px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
    >
      <div className="relative size-[110px] shrink-0 overflow-hidden rounded-lg bg-brand-pink50">
        <Image
          src={article.cover}
          alt=""
          fill
          sizes="110px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-lg font-semibold leading-normal text-brand-gray900">{content.title}</p>
          <p className="text-sm leading-normal text-brand-gray700">{content.subtitle}</p>
        </div>
        <p className="text-xs text-brand-gray500">
          {formatPublishedAt(article.publishedAt, locale)}
        </p>
      </div>
    </Link>
  );
}
