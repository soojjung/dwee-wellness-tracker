import type { Locale, StyleGuideContent } from '@/types';

/**
 * 내추럴 체형 스타일 가이드 고정 콘텐츠 (Figma 522-10258).
 * en 이 source-of-truth, ko 는 Figma 확정 카피(오타만 교정)를 그대로 반영.
 */
export const natural: Record<Locale, StyleGuideContent> = {
  en: {
    tops: {
      good: [
        {
          items: ['oversized button-up', 'loose-fit sweater', 'drop-shoulder tee'],
          reason: 'These skim over the frame naturally for a stylish, easy silhouette.',
        },
        {
          items: ['crewneck sweatshirt', 'hoodie'],
          reason: 'These bring out an easy, casual mood.',
        },
      ],
      avoid: [
        {
          items: ['slim-fit tee', 'tight sweater', 'puff-sleeve blouse'],
          reason: 'These can put more emphasis on the shoulders and frame.',
        },
        {
          items: ['super-cropped tee', 'small-collar shirt'],
          reason: 'These can feel tight and boxed-in on your frame.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['wide-leg pants', 'long flared skirt', 'maxi skirt'],
          reason: 'The relaxed silhouette works naturally with your frame.',
        },
        {
          items: ['bootcut pants', 'cargo pants'],
          reason: 'These give an easy proportion and a laid-back mood.',
        },
      ],
      avoid: [
        {
          items: ['skinny jeans', 'leggings', 'H-line skirt'],
          reason: 'These tend to draw attention to the frame.',
        },
        {
          items: ['tight trousers', 'super-short mini skirt'],
          reason: 'These can throw off your sense of balance and proportion.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['loose-fit dress', 'wrap dress', 'maxi skirt', 'shirt dress'],
          reason: 'These wrap around the frame gently for a relaxed, easy silhouette.',
        },
        {
          items: ['flared skirt'],
          reason: 'This adds natural volume for a well-balanced silhouette.',
        },
      ],
      avoid: [
        {
          items: ['bodycon dress', 'super-short dress'],
          reason: 'These can emphasize the frame and work against that easy, natural silhouette.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['oversized jacket', 'loose-fit cardigan', 'trench coat'],
          reason: 'These work with your frame for an easy, natural silhouette.',
        },
        {
          items: ['long coat'],
          reason: 'The long length keeps your proportions feeling balanced.',
        },
        {
          items: ['utility jacket'],
          reason: 'This brings out an easy, natural appeal.',
        },
      ],
      avoid: [
        {
          items: ['cropped jacket', 'short puffer jacket'],
          reason: 'These can make the upper body look boxed-in.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['linen', 'corduroy'],
          reason: 'These natural textures work well with your frame.',
        },
        {
          items: ['wool', 'tweed'],
          reason: 'Their weight adds a nice sense of balance.',
        },
        {
          items: ['denim', 'leather'],
          reason: 'These add an easy, natural mood.',
        },
      ],
      avoid: [
        {
          items: ['silk', 'satin', 'overly stretchy fabrics', 'thin rayon'],
          reason: "These follow the body's lines closely and can make the frame stand out more.",
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['loose fit', 'oversized fit', 'relaxed straight fit', 'semi-oversized fit'],
          reason: 'These bring out that easy, relaxed silhouette.',
        },
      ],
      avoid: [
        {
          items: ['slim fit', 'body-hugging fit', 'very tight fit'],
          reason: 'These sit close to the body and can emphasize the frame.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['V-neck', 'deep U-neck', 'boat neck', 'open-collar shirt'],
          reason:
            'These open up the neck and shoulders, letting your frame show naturally and easing that boxed-in feeling.',
        },
      ],
      avoid: [
        {
          items: ['turtleneck', 'small round neck', 'high neck'],
          reason: 'These can make the neck feel closed-in and the shoulders look wider.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['drop shoulders', 'rolled-up sleeves', 'loose sleeves', 'dolman sleeves'],
          reason: 'These soften the shoulder line.',
        },
      ],
      avoid: [
        {
          items: ['puff sleeves', 'cap sleeves', 'tight sleeves', 'ruffle sleeves'],
          reason: 'These can emphasize the frame through the shoulders and arms.',
        },
      ],
    },
    length: {
      good: [
        {
          items: [
            'hip-covering tops',
            'long shirts',
            'long coats',
            'maxi skirts',
            'full-length pants',
          ],
          reason: 'The long vertical line keeps your proportions feeling open and easy.',
        },
      ],
      avoid: [
        {
          items: [
            'very short tops',
            'cropped jacket',
            'mini skirts',
            'lengths that cut off at the ankle',
          ],
          reason: "These can make your long lines and frame stand out more than you'd like.",
        },
      ],
    },
    pattern: {
      good: [
        {
          items: [
            'stripes',
            'ethnic-inspired prints',
            'plaid',
            'large prints',
            'nature-inspired prints',
          ],
          reason: 'These hold their own against your frame for a polished, put-together look.',
        },
      ],
      avoid: [
        {
          items: ['very small prints', 'densely packed florals', 'overly delicate details'],
          reason: 'These can look too delicate next to your frame and feel a little fussy.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: [
            'large pockets',
            'stitch detailing',
            'belted accents',
            'button detailing',
            'layered styling',
          ],
          reason: 'These have enough presence to balance out your frame.',
        },
      ],
      avoid: [
        {
          items: ['small bows', 'delicate ruffles', 'thin trims', 'mini buttons'],
          reason:
            'These can look too small next to your frame and feel a little out of proportion.',
        },
      ],
    },
  },
  ko: {
    tops: {
      good: [
        {
          items: ['오버핏 셔츠', '루즈핏 니트', '드롭숄더 티셔츠'],
          reason: '골격을 자연스럽게 커버해 멋스러운 실루엣을 연출해요.',
        },
        {
          items: ['맨투맨', '후드티'],
          reason: '캐주얼한 무드를 살려줘요.',
        },
      ],
      avoid: [
        {
          items: ['슬림핏 티셔츠', '타이트한 니트', '퍼프 블라우스'],
          reason: '골격이 강조돼 보여요.',
        },
        {
          items: ['너무 짧은 크롭티', '작은 카라 셔츠'],
          reason: '체형이 답답해 보여요.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['와이드 팬츠', '롱 플레어 스커트', '맥시 스커트'],
          reason: '여유로운 실루엣으로 프레임과 조화를 이뤄요.',
        },
        {
          items: ['부츠컷 팬츠', '카고 팬츠'],
          reason: '시원한 비율과 내추럴한 무드를 살려줘요.',
        },
      ],
      avoid: [
        {
          items: ['스키니진', '레깅스', 'H라인 스커트'],
          reason: '골격이 부각되기 쉬워요.',
        },
        {
          items: ['타이트한 슬랙스', '너무 짧은 미니 스커트'],
          reason: '체형의 균형감이 줄어들어요.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['루즈핏 원피스', '랩 원피스', '맥시 스커트', '셔츠 원피스'],
          reason: '골격을 자연스럽게 감싸주며 여유로운 실루엣을 연출해요.',
        },
        {
          items: ['플레어 스커트'],
          reason: '자연스러운 볼륨감을 더해 균형 잡힌 실루엣을 연출해요.',
        },
      ],
      avoid: [
        {
          items: ['바디콘 원피스', '너무 짧은 원피스'],
          reason: '골격이 강조돼 내추럴한 실루엣이 줄어들어요.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['오버핏 자켓', '루즈핏 가디건', '트렌치 코트'],
          reason: '골격 프레임과 조화를 이루어 내추럴한 실루엣을 살려줘요.',
        },
        {
          items: ['롱 코트'],
          reason: '긴 기장이 체형의 균형감을 살려줘요.',
        },
        {
          items: ['야상'],
          reason: '편안하고 내추럴한 매력을 살려줘요.',
        },
      ],
      avoid: [
        {
          items: ['크롭 자켓', '숏 패딩'],
          reason: '상체 비율이 답답해 보여요.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['린넨', '코듀로이'],
          reason: '자연스러운 질감이 프레임과 조화를 이뤄요.',
        },
        {
          items: ['울', '트위드'],
          reason: '적당한 무게감으로 균형감을 더해줘요.',
        },
        {
          items: ['데님', '레더'],
          reason: '내추럴한 무드를 더해줘요.',
        },
      ],
      avoid: [
        {
          items: ['실크', '새틴', '지나치게 신축성 있는 소재', '얇은 레이온'],
          reason: '몸의 선을 따라 골격이 도드라져 보여요.',
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['루즈핏', '오버핏', '여유 있는 스트레이트 핏', '세미오버핏'],
          reason: '여유로운 실루엣을 살려줘요.',
        },
      ],
      avoid: [
        {
          items: ['슬림핏', '바디핏', '지나치게 타이트한 핏'],
          reason: '몸에 밀착돼 골격이 강조돼요.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['브이넥', '깊은 U넥', '보트넥', '오픈 카라 셔츠'],
          reason: '목과 어깨를 시원하게 열어 프레임을 자연스럽게 표현하고 답답한 느낌을 줄여줘요.',
        },
      ],
      avoid: [
        {
          items: ['터틀넥', '작은 라운드 넥', '하이넥'],
          reason: '목이 답답해보이고 어깨가 더 넓어 보일 수 있어요.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['드롭숄더', '롤업 소매', '루즈 소매', '돌먼 소매'],
          reason: '어깨 선을 부드럽게 정리해 줘요.',
        },
      ],
      avoid: [
        {
          items: ['퍼프 소매', '캡 소매', '타이트한 소매', '프릴 소매'],
          reason: '어깨와 팔의 골격이 강조돼요.',
        },
      ],
    },
    length: {
      good: [
        {
          items: ['힙 덮는 상의', '롱셔츠', '롱코트', '맥시 스커트', '발등까지 오는 팬츠'],
          reason: '긴 세로 라인으로 시원한 비율을 살려줘요.',
        },
      ],
      avoid: [
        {
          items: ['너무 짧은 상의', '크롭 자켓', '미니스커트', '발목에서 애매하게 끊기는 기장'],
          reason: '긴 팔·다리와 골격이 더 도드라져 보여요.',
        },
      ],
    },
    pattern: {
      good: [
        {
          items: ['스트라이프', '에스닉 패턴', '체크', '큰 패턴', '내추럴 프린트'],
          reason: '프레임감 있는 체형과 조화를 이루어 세련된 분위기를 연출해요.',
        },
      ],
      avoid: [
        {
          items: ['아주 작은 패턴', '촘촘한 플라워 패턴', '지나치게 섬세한 디테일'],
          reason: '골격에 비해 패턴이 작아 다소 답답해 보여요.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: ['큰 포켓', '스티치 디테일', '벨트 포인트', '버튼 디테일', '레이어드 스타일'],
          reason: '적당한 존재감의 디테일이 골격과 균형을 이뤄요.',
        },
      ],
      avoid: [
        {
          items: ['작은 리본', '섬세한 프릴', '얇은 장식', '미니 버튼'],
          reason: '체형에 비해 디테일이 작아 조화가 떨어질 수 있어요.',
        },
      ],
    },
  },
};
