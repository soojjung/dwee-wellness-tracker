import { notFound } from 'next/navigation';
import { FoodArticleScreen } from '@/components/app/FoodArticleScreen';
import { FOOD_ARTICLES_KO } from '@/content/foods/articles-ko';

const IDS = Object.keys(FOOD_ARTICLES_KO);

export function generateStaticParams() {
  return IDS.map((id) => ({ id }));
}

interface FoodArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function FoodArticlePage({ params }: FoodArticlePageProps) {
  const { id } = await params;
  if (!IDS.includes(id)) notFound();
  return <FoodArticleScreen id={id} />;
}
