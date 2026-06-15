import { ArticleScreen } from '@/components/magazine/ArticleScreen';
import { articles } from '@/data/magazine/articles';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  return <ArticleScreen slug={slug} />;
}
