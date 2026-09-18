import type { Locale } from '@/types';
import { FOOD_ARTICLES_EN } from './articles-en';
import { FOOD_ARTICLES_KO } from './articles-ko';
import type { FoodArticle } from './types';

export type { FoodArticle, FoodArticleSection, FoodArticleTip } from './types';

const ARTICLES: Readonly<Record<Locale, Readonly<Record<string, FoodArticle>>>> = {
  en: FOOD_ARTICLES_EN,
  ko: FOOD_ARTICLES_KO,
};

/** 정적 라우트 생성용. en 이 source-of-truth 라 en 의 키를 기준으로 삼는다. */
export const FOOD_ARTICLE_IDS: readonly string[] = Object.keys(FOOD_ARTICLES_EN);

export function foodArticle(id: string, locale: Locale): FoodArticle | null {
  return ARTICLES[locale][id] ?? null;
}
