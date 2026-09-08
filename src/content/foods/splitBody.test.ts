import { describe, it, expect } from 'vitest';
import { splitBody } from './splitBody';

describe('splitBody', () => {
  it('returns the whole trimmed body as lead when no bullet pattern is found', () => {
    const body = '평범한 문단입니다. 콜론이 전혀 없어요.';

    expect(splitBody(body)).toEqual({
      lead: '평범한 문단입니다. 콜론이 전혀 없어요.',
      bullets: [],
    });
  });

  it('splits a lead sentence and a single bullet', () => {
    const body = '오늘은 컨디션이 좋아요. 수분 섭취: 물을 많이 마시면 좋아요.';

    expect(splitBody(body)).toEqual({
      lead: '오늘은 컨디션이 좋아요.',
      bullets: [{ label: '수분 섭취', text: '물을 많이 마시면 좋아요.' }],
    });
  });

  it('splits a lead sentence and two bullets (real article body shape)', () => {
    const body =
      '월경을 하면 혈액과 함께 철분도 함께 손실되기 때문에 평소보다 피로감이나 무기력함을 느끼기 쉬워요. ' +
      '흡수율 높은 철분: 소고기에는 식물성 식품에 들어 있는 철분보다 우리 몸에 흡수되기 쉬운 헴철이 풍부해요. ' +
      '월경 중 손실된 철분을 보충하는 데 도움을 줄 수 있어요. ' +
      '산소를 온몸에 전달: 철분은 혈액 속 헤모글로빈을 만드는 데 필요한 영양소예요. ' +
      '충분한 철분 섭취는 몸 구석구석에 산소를 전달하고 일상적인 활력을 유지하는 데 도움을 줘요.';

    expect(splitBody(body)).toEqual({
      lead: '월경을 하면 혈액과 함께 철분도 함께 손실되기 때문에 평소보다 피로감이나 무기력함을 느끼기 쉬워요.',
      bullets: [
        {
          label: '흡수율 높은 철분',
          text:
            '소고기에는 식물성 식품에 들어 있는 철분보다 우리 몸에 흡수되기 쉬운 헴철이 풍부해요. ' +
            '월경 중 손실된 철분을 보충하는 데 도움을 줄 수 있어요.',
        },
        {
          label: '산소를 온몸에 전달',
          text:
            '철분은 혈액 속 헤모글로빈을 만드는 데 필요한 영양소예요. ' +
            '충분한 철분 섭취는 몸 구석구석에 산소를 전달하고 일상적인 활력을 유지하는 데 도움을 줘요.',
        },
      ],
    });
  });

  it('splits three or more bullets in order', () => {
    const body =
      '첫 문장이에요. 라벨 하나: 텍스트 하나. 라벨 둘: 텍스트 둘. 라벨 셋: 텍스트 셋.';

    expect(splitBody(body)).toEqual({
      lead: '첫 문장이에요.',
      bullets: [
        { label: '라벨 하나', text: '텍스트 하나.' },
        { label: '라벨 둘', text: '텍스트 둘.' },
        { label: '라벨 셋', text: '텍스트 셋.' },
      ],
    });
  });

  it('returns an empty lead when the body starts directly with a bullet', () => {
    const body = '라벨: 설명입니다. 다음 라벨: 설명2입니다.';

    expect(splitBody(body)).toEqual({
      lead: '',
      bullets: [
        { label: '라벨', text: '설명입니다.' },
        { label: '다음 라벨', text: '설명2입니다.' },
      ],
    });
  });

  it('does not treat a colon without a following space as a bullet start', () => {
    const body = '약을 먹을 때는 오전 9:30에 드세요. 그리고 저녁에도 챙기세요.';

    expect(splitBody(body)).toEqual({
      lead: '약을 먹을 때는 오전 9:30에 드세요. 그리고 저녁에도 챙기세요.',
      bullets: [],
    });
  });

  it('does not treat a label containing a period as a bullet start', () => {
    const body = '문장이 끝났다. 라벨.끝: 설명이어요.';

    expect(splitBody(body)).toEqual({
      lead: '문장이 끝났다. 라벨.끝: 설명이어요.',
      bullets: [],
    });
  });

  it('does not match a 1-character label (below the minimum length)', () => {
    const body = 'A: 이것은 라벨이 아니에요.';

    expect(splitBody(body)).toEqual({
      lead: 'A: 이것은 라벨이 아니에요.',
      bullets: [],
    });
  });

  it('matches a 2-character label (minimum length boundary)', () => {
    const body = 'AB: 설명입니다.';

    expect(splitBody(body)).toEqual({
      lead: '',
      bullets: [{ label: 'AB', text: '설명입니다.' }],
    });
  });

  it('matches a 24-character label (maximum length boundary)', () => {
    const label = 'A'.repeat(24);
    const body = `${label}: 설명입니다.`;

    expect(splitBody(body)).toEqual({
      lead: '',
      bullets: [{ label, text: '설명입니다.' }],
    });
  });

  it('does not match a 25-character label (over the maximum length)', () => {
    const label = 'A'.repeat(25);
    const body = `${label}: 설명입니다.`;

    expect(splitBody(body)).toEqual({
      lead: body,
      bullets: [],
    });
  });

  it('returns empty lead and no bullets for an empty string', () => {
    expect(splitBody('')).toEqual({ lead: '', bullets: [] });
  });

  it('trims leading and trailing whitespace from the lead', () => {
    const body = '  단순한 문장입니다.  ';

    expect(splitBody(body)).toEqual({
      lead: '단순한 문장입니다.',
      bullets: [],
    });
  });

  it('returns the same result when called twice with the same input (lastIndex regression)', () => {
    const body =
      '월경을 하면 피곤해요. 철분 섭취: 소고기가 좋아요. 산소 전달: 헤모글로빈에 필요해요.';

    const first = splitBody(body);
    const second = splitBody(body);

    expect(second).toEqual(first);
    expect(second).toEqual({
      lead: '월경을 하면 피곤해요.',
      bullets: [
        { label: '철분 섭취', text: '소고기가 좋아요.' },
        { label: '산소 전달', text: '헤모글로빈에 필요해요.' },
      ],
    });
  });
});
