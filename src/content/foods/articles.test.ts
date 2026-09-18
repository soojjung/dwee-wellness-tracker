import { describe, expect, it } from 'vitest';
import { FOOD_ARTICLES_EN } from './articles-en';
import { FOOD_ARTICLES_KO } from './articles-ko';
import { splitBody } from './splitBody';

// en 과 ko 는 같은 화면에 같은 구조로 그려지므로, 키·섹션·불릿·팁 수가 어긋나면
// 한쪽 locale 만 레이아웃이 깨진다. 번역 시 `라벨: ` 불릿 패턴이 빠지는 실수를 잡는다.
describe('food articles en/ko parity', () => {
  const ids = Object.keys(FOOD_ARTICLES_EN);

  it('has the same 20 ids in both locales', () => {
    expect(ids).toHaveLength(20);
    expect(Object.keys(FOOD_ARTICLES_KO).sort()).toEqual([...ids].sort());
  });

  it.each(ids)('%s: same section / bullet / tip / closing counts', (id) => {
    const en = FOOD_ARTICLES_EN[id]!;
    const ko = FOOD_ARTICLES_KO[id]!;

    expect(en.sections).toHaveLength(ko.sections.length);
    en.sections.forEach((section, i) => {
      const koSection = ko.sections[i]!;
      expect(splitBody(section.body).bullets.map((b) => b.label)).toHaveLength(
        splitBody(koSection.body).bullets.length,
      );
    });

    expect(en.tips).toHaveLength(ko.tips.length);
    en.tips.forEach((tip, i) => expect(tip.emoji).toBe(ko.tips[i]!.emoji));
    expect(en.closing).toHaveLength(ko.closing.length);
  });

  it.each(ids)('%s: headline ends with the same emoji as ko', (id) => {
    const last = (s: string) => Array.from(s).at(-1);
    expect(last(FOOD_ARTICLES_EN[id]!.headline)).toBe(last(FOOD_ARTICLES_KO[id]!.headline));
  });
});
