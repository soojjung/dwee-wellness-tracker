import { notFound } from 'next/navigation';
import { FoodArticleScreen } from '@/components/app/FoodArticleScreen';
import { FOOD_ARTICLE_IDS } from '@/content/foods';

export function generateStaticParams() {
  return FOOD_ARTICLE_IDS.map((id) => ({ id }));
}

interface FoodArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function FoodArticlePage({ params }: FoodArticlePageProps) {
  const { id } = await params;
  if (!FOOD_ARTICLE_IDS.includes(id)) notFound();
  return <FoodArticleScreen id={id} />;
}
