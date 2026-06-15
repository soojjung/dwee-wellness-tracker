'use client';
import { useT } from '@/i18n/useT';
import { PageContainer } from '@/components/ui/PageContainer';
import { listArticles } from '@/data/magazine/articles';
import { ArticleCard } from './ArticleCard';

export function MagazineScreen() {
  const t = useT();
  const articles = listArticles();

  return (
    <PageContainer className="gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-brand-gray900">{t.magazine.listTitle}</h1>
        <p className="text-sm text-brand-gray600">{t.magazine.listSubtitle}</p>
      </header>

      {articles.length === 0 ? (
        <p className="rounded-2xl bg-brand-pink50 p-4 text-sm text-brand-gray600">
          {t.magazine.listEmpty}
        </p>
      ) : (
        <section className="flex flex-col gap-4">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </section>
      )}
    </PageContainer>
  );
}
