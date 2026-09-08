import { notFound } from 'next/navigation';
import { FoodArticleScreen } from '@/components/app/FoodArticleScreen';
import { FOOD_ARTICLES_KO } from '@/content/foods/articles-ko';

const IDS = Object.keys(FOOD_ARTICLES_KO);

// 음식 id 의 suffix 가 주기를 가리킨다 (`salmon-l` → luteal). 히어로 사진을 고르는 데 쓴다.
const PHASE_BY_SUFFIX: Record<string, string> = {
  m: 'menstrual',
  f: 'follicular',
  o: 'ovulation',
  l: 'luteal',
};

export function generateStaticParams() {
  return IDS.map((id) => ({ id }));
}

interface FoodArticlePageProps {
  params: Promise<{ id: string }>;
}

export default async function FoodArticlePage({ params }: FoodArticlePageProps) {
  const { id } = await params;
  if (!IDS.includes(id)) notFound();
  const suffix = id.slice(id.lastIndexOf('-') + 1);
  return <FoodArticleScreen id={id} phase={PHASE_BY_SUFFIX[suffix] ?? null} />;
}
