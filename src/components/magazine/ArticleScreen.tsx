'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { PageContainer } from '@/components/ui/PageContainer';
import { getArticleBySlug, getArticleContent } from '@/data/magazine/articles';
import { ArticleSectionView } from './ArticleSectionView';
import { formatPublishedAt } from './formatPublishedAt';

interface ArticleScreenProps {
  slug: string;
}

export function ArticleScreen({ slug }: ArticleScreenProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <PageContainer className="gap-4">
        <p className="text-sm text-brand-gray600">{t.magazine.notFound}</p>
        <Link href="/magazine" className="text-sm font-medium text-brand-pink800">
          ← {t.magazine.backToList}
        </Link>
      </PageContainer>
    );
  }

  const content = getArticleContent(article, locale);

  return (
    <PageContainer className="gap-5 pb-24">
      <Link
        href="/magazine"
        className="-ml-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-0.5 text-sm font-medium text-brand-gray600 hover:text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        ← {t.magazine.backToList}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-brand-gray900">{content.title}</h1>
        <p className="text-sm text-brand-gray600">{content.subtitle}</p>
        <p className="text-xs text-brand-gray500">
          {t.magazine.publishedPrefix}
          {formatPublishedAt(article.publishedAt, locale)}
        </p>
      </header>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-pink50">
        <Image
          src={article.cover}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, 480px"
          className="object-contain p-4"
          priority
        />
      </div>

      <article className="flex flex-col gap-4">
        {content.sections.map((section, index) => (
          <ArticleSectionView key={index} section={section} />
        ))}
      </article>
    </PageContainer>
  );
}
