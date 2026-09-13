import type { Locale, PrimaryBodyType, StyleGuideContent } from '@/types';
import { straight } from './styleGuide/straight';
import { wave } from './styleGuide/wave';
import { natural } from './styleGuide/natural';

/**
 * 결과 화면 "스타일 가이드" 탭의 고정 콘텐츠.
 *
 * 체형 탭은 사진마다 LLM 이 새로 읽지만, 스타일 가이드는 유형이 정해지면 내용이
 * 같다. Figma 에 적힌 문안을 그대로 보여주기 위해 사전처럼 코드에 둔다 —
 * `articles.ts` 와 같은 방식.
 */
const CONTENT: Record<PrimaryBodyType, Record<Locale, StyleGuideContent>> = {
  straight,
  wave,
  natural,
};

export function getStyleGuideContent(type: PrimaryBodyType, locale: Locale): StyleGuideContent {
  return CONTENT[type][locale];
}
