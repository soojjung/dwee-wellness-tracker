import type { Locale, StyleGuideContent } from '@/types';

/**
 * 스트레이트 체형 스타일 가이드 고정 콘텐츠 (Figma 522-8571).
 * en 이 source-of-truth, ko 는 Figma 확정 카피(오타만 교정)를 그대로 반영.
 */
export const straight: Record<Locale, StyleGuideContent> = {
  en: {
    tops: {
      good: [
        {
          items: ['button-up shirt', 'basic tee'],
          reason:
            'Structured pieces like these tend to streamline your shape for a clean, polished look.',
        },
        {
          items: ['slim-fit sweater', 'wrap top'],
          reason: 'These skim your frame and bring out a soft waistline for a balanced look.',
        },
      ],
      avoid: [
        {
          items: ['off-the-shoulder top', 'oversized tee', 'oversized hoodie'],
          reason: 'These can widen the shoulders and add bulk to the upper body.',
        },
        {
          items: ['super-cropped tee'],
          reason: 'This can shorten the waist even more and throw off your proportions.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['straight-leg pants', 'trousers'],
          reason: 'These are an easy match for your shape — the slight ease keeps things balanced.',
        },
        {
          items: ['H-line skirt', 'pencil skirt'],
          reason: 'These follow your natural shape for a polished, elevated feel.',
        },
      ],
      avoid: [
        {
          items: ['wide-leg pants', 'jogger pants', 'full skirts'],
          reason: 'These can add bulk and make the silhouette feel heavier.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['H-line dress', 'shirt dress', 'slip dress'],
          reason: 'These play up your straight, athletic lines.',
        },
        {
          items: ['wrap dress'],
          reason: 'This brings out a soft waistline without overdoing it.',
        },
        {
          items: ['I-line dress'],
          reason: 'This gives a sleek, streamlined look.',
        },
      ],
      avoid: [
        {
          items: ['full, voluminous dress'],
          reason: 'This can add bulk and make the silhouette feel heavier.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['tailored blazer', 'slim-fit coat', 'single-breasted coat'],
          reason: 'These highlight your straight shoulder line for a clean, put-together look.',
        },
        {
          items: ['leather jacket'],
          reason: 'This pairs naturally with your structured frame.',
        },
      ],
      avoid: [
        {
          items: ['oversized coat', 'puffer jacket', 'cape'],
          reason: 'These can add bulk and make the silhouette feel heavier.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['denim', 'tweed', 'leather', 'cashmere', 'cotton', 'wool'],
          reason: 'These hold their shape well for a neat, polished finish.',
        },
      ],
      avoid: [
        {
          items: ['organza', 'heavy velvet', 'very thin knits', 'chiffon'],
          reason: 'These can drape heavily or cling more than feels comfortable.',
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['true-to-size fit', 'semi-slim fit', 'straight fit'],
          reason: 'These keep a natural balance and a clean line.',
        },
      ],
      avoid: [
        {
          items: ['oversized fit', 'very tight fit', 'voluminous fit'],
          reason: 'These can feel bulky or overwhelming on your frame.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['V-neck', 'U-neck', 'square neck', 'shallow collar'],
          reason: 'These elongate the neckline and keep the upper body looking open and tidy.',
        },
      ],
      avoid: [
        {
          items: ['turtleneck', 'boat neck', 'high neck', 'ruffled collar'],
          reason: 'These can add bulk around the neck and shoulders.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['shirt sleeves', 'straight sleeves', 'slim long sleeves', 'short sleeves'],
          reason: 'These keep the shoulder line clean and neat.',
        },
      ],
      avoid: [
        {
          items: ['puff sleeves', 'balloon sleeves', 'flared sleeves', 'ruffle sleeves'],
          reason: 'These can add bulk and feel like a lot around the arms.',
        },
      ],
    },
    length: {
      good: [
        {
          items: ['hip-length basics', 'waist-length tops', 'midi skirt', 'ankle-length pants'],
          reason: 'These lengthen the legs and balance your overall proportions.',
        },
      ],
      avoid: [
        {
          items: ['mid-calf lengths', 'tops that fully cover the hips'],
          reason: 'These can shorten the waist and make your proportions feel heavier.',
        },
      ],
    },
    pattern: {
      good: [
        {
          items: ['stripes', 'solid colors', 'plaid', 'geometric prints', 'small prints'],
          reason: 'These suit your straight lines and read as polished.',
        },
      ],
      avoid: [
        {
          items: [
            'large floral prints',
            'busy prints',
            'elaborate lace',
            'oversized embellishments',
          ],
          reason: 'These can pull focus and add extra volume to the upper body.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: ['minimal buttons', 'simple pockets', 'thin belts', 'seam-detailed designs'],
          reason: 'These keep the shape neat and pulled-together.',
        },
      ],
      avoid: [
        {
          items: [
            'heavy shirring',
            'ruffle details',
            'cancan-style ruffles',
            'large pockets',
            'large bows',
          ],
          reason: 'These can add extra bulk and make the silhouette look bigger than it is.',
        },
      ],
    },
  },
  ko: {
    tops: {
      good: [
        {
          items: ['기본 셔츠', '기본 티셔츠'],
          reason: '몸의 입체감을 정돈해 단정하고 깔끔해 보여요.',
        },
        {
          items: ['슬림 니트', '랩 스타일 상의'],
          reason: '탄탄한 몸을 자연스럽게 살려주고 허리선을 살짝 만들어 균형감을 부여해요.',
        },
      ],
      avoid: [
        {
          items: ['오프숄더', '오버핏 티셔츠', '오버핏 후드'],
          reason: '상체가 넓게 강조되거나 부해져요.',
        },
        {
          items: ['너무 짧은 크롭티'],
          reason: '짧은 허리가 더 짧아보여 균형이 깨져요.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['스트레이트 팬츠', '슬랙스'],
          reason: '체형과 가장 잘 어울리며 적당한 여유가 균형감을 줘요.',
        },
        {
          items: ['H라인 스커트', '펜슬 스커트'],
          reason: '몸매를 자연스럽게 살려 고급스러운 느낌이에요.',
        },
      ],
      avoid: [
        {
          items: ['와이드 팬츠', '조거 팬츠', '풍성한 스커트'],
          reason: '몸이 크고 둔해 보일 수 있어요.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['H라인 원피스', '셔츠 원피스', '슬립 원피스'],
          reason: '직선적이고 건강한 라인을 살려줘요.',
        },
        {
          items: ['랩 원피스'],
          reason: '허리선을 적당히 살려줘요.',
        },
        {
          items: ['I라인 원피스'],
          reason: '세련되고 날씬해 보여요.',
        },
      ],
      avoid: [
        {
          items: ['풍성한 원피스'],
          reason: '몸이 크고 둔해 보일 수 있어요.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['테일러드 자켓', '슬림 핏 코트', '싱글 코트'],
          reason: '직선적인 어깨를 살리며 심플하고 세련된 인상을 줘요.',
        },
        {
          items: ['가죽 자켓'],
          reason: '탄탄한 체형과 잘 어울려요.',
        },
      ],
      avoid: [
        {
          items: ['오버핏 코트', '빵빵한 패딩', '케이프'],
          reason: '몸이 크고 둔해 보일 수 있어요.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['데님', '트위드', '레더', '캐시미어', '면', '울'],
          reason: '단정하고 깔끔해 보이며 세련된 느낌을 줘요.',
        },
      ],
      avoid: [
        {
          items: ['오간자', '두꺼운 벨벳', '너무 얇은 니트', '쉬폰'],
          reason: '몸이 부하고 무거워 보이거나 굴곡이 과하게 드러나요.',
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['정사이즈', '세미 슬림핏', '스트레이트 핏'],
          reason: '자연스러운 균형감과 깔끔한 라인을 유지할 수 있어요.',
        },
      ],
      avoid: [
        {
          items: ['오버핏', '너무 타이트한 핏', '풍성한 핏'],
          reason: '몸이 부해보이고 부담스러운 느낌을 줄 수 있어요.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['브이넥', 'U넥', '스퀘어넥', '깊지 않은 카라'],
          reason: '목이 길어 보이고 상체가 시원하게 정리돼요.',
        },
      ],
      avoid: [
        {
          items: ['터틀넥', '보트넥', '하이넥', '프릴 카라'],
          reason: '몸이 부하고 무거워 보이거나 굴곡이 과하게 드러나요.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['셔츠 소매', '일자 소매', '슬림 롱슬리브', '반소매'],
          reason: '어깨 선을 깔끔하게 정리해 줘요.',
        },
      ],
      avoid: [
        {
          items: ['퍼프 소매', '벌룬 소매', '플레어 소매', '프릴 소매'],
          reason: '몸이 부해보이고 부담스러운 느낌을 줄 수 있어요.',
        },
      ],
    },
    length: {
      good: [
        {
          items: [
            '골반 정도의 기본 기장',
            '허리선 정도의 숏 상의',
            '미디 스커트',
            '발목이 보이는 팬츠',
          ],
          reason: '다리가 길어 보이고 전체 비율이 좋아져요.',
        },
      ],
      avoid: [
        {
          items: ['종아리 중간에서 끊기는 애매한 기장', '엉덩이를 완전히 덮는 긴 상의'],
          reason: '허리가 짧아 보이고 전체 비율이 무거워질 수 있어요.',
        },
      ],
    },
    pattern: {
      good: [
        {
          items: ['스트라이프', '무지', '체크', '기하학 패턴', '작은 패턴'],
          reason: '직선적인 체형과 조화를 이루며 세련되어 보여요.',
        },
      ],
      avoid: [
        {
          items: ['큰 꽃무늬', '과한 프린트', '화려한 레이스', '큼직한 장식'],
          reason: '시선이 분산되고 상체 볼륨이 더 강조될 수 있어요.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: ['미니멀한 버튼', '심플한 포켓', '얇은 벨트', '절개선이 있는 디자인'],
          reason: '체형을 정돈해 깔끔한 인상을 줘요.',
        },
      ],
      avoid: [
        {
          items: ['과한 셔링', '프릴 장식', '캉캉 디테일', '빅 포켓', '큰 리본'],
          reason: '불필요한 볼륨이 더해져 체형이 커 보일 수 있어요.',
        },
      ],
    },
  },
};
