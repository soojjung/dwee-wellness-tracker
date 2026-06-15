'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSettingsStore } from '@/store/settingsStore';
import { getArticleContent, type Article } from '@/data/magazine/articles';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const locale = useSettingsStore((s) => s.settings.locale);
  const content = getArticleContent(article, locale);

  return (
    <Link
      href={`/magazine/${article.slug}`}
      className="group block overflow-hidden rounded-2xl bg-brand-pink50 transition-colors hover:bg-brand-pink100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
    >
      <div className="relative aspect-[16/9] w-full bg-brand-pink50">
        <Image
          src={article.cover}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-contain p-3"
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h2 className="text-base font-semibold text-brand-gray900">{content.title}</h2>
        <p className="text-sm text-brand-gray600">{content.subtitle}</p>
      </div>
    </Link>
  );
}
