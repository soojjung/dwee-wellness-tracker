import type { Locale, StyleGuideContent } from '@/types';

/**
 * 웨이브 체형 스타일 가이드 고정 콘텐츠 (Figma 522-9391).
 * en 이 source-of-truth, ko 는 Figma 확정 카피(오타만 교정)를 그대로 반영.
 */
export const wave: Record<Locale, StyleGuideContent> = {
  en: {
    tops: {
      good: [
        {
          items: ['puff-sleeve blouse', 'ruffle blouse'],
          reason: 'These add soft volume to the upper body for a balanced look.',
        },
        {
          items: ['cropped sweater', 'slim-fit sweater', 'wrap blouse'],
          reason: 'These highlight the waist for a feminine look and make the legs look longer.',
        },
      ],
      avoid: [
        {
          items: ['oversized button-up', 'boxy tee', 'drop-shoulder top'],
          reason:
            'These can make the upper body look smaller, drop the shoulder line, and erase the waist — which can throw off your proportions.',
        },
        {
          items: ['long, loose sweater'],
          reason: 'This can look bulky overall and shorten your proportions.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['A-line skirt', 'flared skirt'],
          reason: 'These skim over the lower body naturally and highlight the waist.',
        },
        {
          items: ['semi-bootcut pants', 'high-rise pants'],
          reason: 'These make the legs look longer and balance out the lower body.',
        },
        {
          items: ['slim-fit trousers'],
          reason: 'These pair well with your soft curves.',
        },
      ],
      avoid: [
        {
          items: ['low-rise pants'],
          reason: 'These can lengthen the waist and make the legs look shorter.',
        },
        {
          items: ['extra-wide pants', 'relaxed straight-leg denim', 'cargo pants'],
          reason: 'These can make the lower body look heavier or flatten your shape overall.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['A-line dress', 'flared dress', 'wrap dress', 'fit-and-flare dress'],
          reason: 'These play up your feminine curves.',
        },
        {
          items: ['waist-seam dress'],
          reason: 'This creates a well-balanced silhouette.',
        },
      ],
      avoid: [
        {
          items: ['boxy dress', 'H-line dress'],
          reason: 'These erase the waistline and can flatten your shape.',
        },
        {
          items: ['oversized shirt dress'],
          reason: 'This can make the upper body look even smaller.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['cropped jacket', 'short tweed jacket', 'short cardigan'],
          reason: 'These balance your proportions and add a little volume up top.',
        },
        {
          items: ['belted coat', 'slim-fit jacket'],
          reason: 'These cinch in and highlight the waist.',
        },
      ],
      avoid: [
        {
          items: ['long oversized coat', 'drop-shoulder coat'],
          reason:
            'These can make your frame look smaller and the shoulders droop, throwing off your proportions.',
        },
        {
          items: ['boxy jacket', 'oversized blazer'],
          reason: 'These can hide your natural curves.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['chiffon', 'silk', 'satin', 'lace'],
          reason:
            'These bring an elegant, feminine feel, and their natural sheen adds a soft sense of volume.',
        },
        {
          items: ['angora', 'lightweight knits'],
          reason: 'These add gentle volume and keep the line soft.',
        },
      ],
      avoid: [
        {
          items: ['heavy denim', 'stiff cotton', 'heavy leather', 'coarse linen'],
          reason: 'These can hide your curves and feel stiff or heavy on your frame.',
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['slim fit', 'semi-slim fit', 'fit with a waist seam'],
          reason: 'These play up your curves and keep your proportions balanced.',
        },
      ],
      avoid: [
        {
          items: ['oversized fit', 'boxy fit', 'straight-cut fit'],
          reason: 'These can erase your line and make you look smaller or bulkier than you are.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['square neck', 'U-neck', 'sweetheart neck', 'boat neck'],
          reason:
            'These open up the collarbones and neckline, add a little volume up top, and feel feminine.',
        },
      ],
      avoid: [
        {
          items: ['deep V-neck', 'wide open collar', 'wide neckline'],
          reason: 'These can make a slim upper body look even more bare.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['puff sleeves', 'cap sleeves', 'shirred sleeves', 'balloon sleeves'],
          reason: 'These add gentle volume at the shoulders and upper body for balance.',
        },
      ],
      avoid: [
        {
          items: ['drop shoulders', 'straight oversized sleeves', 'long loose sleeves'],
          reason: 'These can make the shoulders droop and the upper body look smaller.',
        },
      ],
    },
    length: {
      good: [
        {
          items: [
            'crop tops above the waist',
            'hip-length tops',
            'mini-to-midi skirts',
            'ankle-length pants',
          ],
          reason:
            'These raise the visual waistline, making the legs look longer and the whole proportion feel balanced.',
        },
      ],
      avoid: [
        {
          items: [
            'tops that fully cover the hips',
            'long oversized outerwear',
            'low-rise pants',
            'pants that pool at the ankle',
          ],
          reason: 'These can make the lower body look heavier and shorten your proportions.',
        },
      ],
    },
    pattern: {
      good: [
        {
          items: ['floral prints', 'curved prints', 'subtle prints', 'small plaid', 'polka dots'],
          reason: 'These suit your soft, feminine shape naturally.',
        },
      ],
      avoid: [
        {
          items: ['large geometric prints', 'bold stripes', 'large plaid', 'high-contrast prints'],
          reason: 'These can overpower your shape and throw off the balance.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: ['ruffles', 'shirring', 'bows', 'lace', 'pearl buttons'],
          reason: 'These add natural volume up top and play up a feminine feel.',
        },
      ],
      avoid: [
        {
          items: ['thick belts', 'chunky zippers', 'heavy metal hardware', 'large pockets'],
          reason: 'These can look heavier than your frame and dull that delicate impression.',
        },
      ],
    },
  },
  ko: {
    tops: {
      good: [
        {
          items: ['퍼프 블라우스', '프릴 블라우스'],
          reason: '상체에 자연스러운 볼륨을 더해 균형을 맞춰요.',
        },
        {
          items: ['크롭 니트', '슬림핏 니트', '랩 블라우스'],
          reason: '허리선을 강조해 여성스럽고 다리가 길어보여요.',
        },
      ],
      avoid: [
        {
          items: ['오버핏 셔츠', '박시 티셔츠', '드롭 숄더'],
          reason:
            '상체가 왜소해 보이거나 어깨선이 처져 보이며 허리선이 사라져 비율이 무너질 수 있어요.',
        },
        {
          items: ['긴 루즈핏 니트'],
          reason: '전체적으로 부해 보이고 비율이 짧아질 수 있어요.',
        },
      ],
    },
    bottoms: {
      good: [
        {
          items: ['A라인 스커트', '플레어 스커트'],
          reason: '하체를 자연스럽게 커버하고 허리를 강조해요.',
        },
        {
          items: ['세미 부츠컷 팬츠', '하이웨이스트 팬츠'],
          reason: '다리가 길어 보이고 하체를 균형 있게 보완해요.',
        },
        {
          items: ['슬림핏 슬랙스'],
          reason: '부드러운 체형과 조화로워요.',
        },
      ],
      avoid: [
        {
          items: ['로우라이즈 팬츠'],
          reason: '허리가 길어 보이고 다리가 짧아 보일 수 있어요.',
        },
        {
          items: ['지나친 와이드 팬츠', '여유 있는 일자핏 데님', '카고 팬츠'],
          reason: '하체가 무거워 보이거나 전체적으로 밋밋해져요.',
        },
      ],
    },
    dresses: {
      good: [
        {
          items: ['A라인 원피스', '플레어 원피스', '랩 원피스', '핏앤플레어 원피스'],
          reason: '여성스러운 곡선을 살려줘요.',
        },
        {
          items: ['허리 절개 원피스'],
          reason: '비율이 좋아보여요.',
        },
      ],
      avoid: [
        {
          items: ['박시 원피스', 'H라인 원피스'],
          reason: '허리선이 사라져 체형이 밋밋해 보여요.',
        },
        {
          items: ['오버핏 셔츠 원피스'],
          reason: '상체가 더 왜소해 보일 수 있어요.',
        },
      ],
    },
    outerwear: {
      good: [
        {
          items: ['크롭 자켓', '숏 트위드 자켓', '짧은 카디건'],
          reason: '비율이 좋아 보이며 상체에 볼륨감을 더해줘요.',
        },
        {
          items: ['허리 벨트 코트', '슬림핏 자켓'],
          reason: '잘록한 허리선을 강조해요.',
        },
      ],
      avoid: [
        {
          items: ['롱 오버핏 코트', '드롭숄더 코트'],
          reason: '체형이 작고 상체가 처져 보여 비율이 무너질 수 있어요.',
        },
        {
          items: ['박시 자켓', '오버핏 블레이저'],
          reason: '체형의 곡선이 사라져요.',
        },
      ],
    },
    materials: {
      good: [
        {
          items: ['쉬폰', '실크', '새틴', '레이스'],
          reason: '여성스럽고 우아한 분위기를 주며 자연스러운 광택으로 볼륨감을 더해요.',
        },
        {
          items: ['앙고라', '얇은 니트'],
          reason: '볼륨감을 더해주고 부드러운 라인을 살려요.',
        },
      ],
      avoid: [
        {
          items: ['두꺼운 데님', '뻣뻣한 코튼', '두꺼운 레더', '거친 질감의 린넨'],
          reason: '곡선이 살아나지 않아 체형이 답답하거나 무거워 보일 수 있어요.',
        },
      ],
    },
    fit: {
      good: [
        {
          items: ['슬림핏', '세미 슬림핏', '허리가 들어간 핏'],
          reason: '곡선미를 살리고 비율이 좋아보여요.',
        },
      ],
      avoid: [
        {
          items: ['오버핏', '박시핏', '직선적인 핏'],
          reason: '라인이 사라져 왜소해 보이거나 부해 보일 수 있어요.',
        },
      ],
    },
    neckline: {
      good: [
        {
          items: ['스퀘어넥', 'U넥', '하트넥', '보트넥'],
          reason:
            '쇄골과 목선을 자연스럽게 드러내 상체에 볼륨감을 더하고 여성스러운 분위기를 줘요.',
        },
      ],
      avoid: [
        {
          items: ['깊은 브이넥', '큰 오픈카라', '넓은 넥라인'],
          reason: '얇은 상체가 더 비어 보일 수 있어요.',
        },
      ],
    },
    sleeves: {
      good: [
        {
          items: ['퍼프 소매', '캡 소매', '셔링 소매', '벌룬 소매'],
          reason: '어깨와 상체에 적당한 볼륨을 더해 균형감을 줘요.',
        },
      ],
      avoid: [
        {
          items: ['드롭 숄더', '일자 오버핏 소매', '긴 루즈 소매'],
          reason: '어깨가 처져 보이고 상체가 왜소해 보일 수 있어요.',
        },
      ],
    },
    length: {
      good: [
        {
          items: [
            '허리 선 위 크롭 기장',
            '골반 정도의 상의',
            '미니-미디 스커트',
            '발목이 보이는 팬츠',
          ],
          reason: '허리 위치를 높아 보이게 해 다리가 길어 보이고 전체 비율이 좋아져요.',
        },
      ],
      avoid: [
        {
          items: [
            '힙을 완전히 덮는 긴 상의',
            '롱 오버핏 아우터',
            '로우라이즈 팬츠',
            '발등을 덮는 긴 팬츠',
          ],
          reason: '하체가 무거워 보이고 비율이 짧아질 수 있어요.',
        },
      ],
    },
    pattern: {
      good: [
        {
          items: ['플라워 패턴', '곡선적인 패턴', '잔잔한 패턴', '작은 체크', '도트'],
          reason: '부드럽고 여성적인 체형과 자연스럽게 어울려요.',
        },
      ],
      avoid: [
        {
          items: ['큰 기하학 패턴', '굵은 스트라이프', '큰 체크', '강한 대비의 패턴'],
          reason: '체형보다 패턴이 강해 보여 균형이 깨질 수 있어요.',
        },
      ],
    },
    decoration: {
      good: [
        {
          items: ['프릴', '셔링', '리본', '레이스', '진주 버튼'],
          reason: '상체에 자연스러운 볼륨을 더하고 여성스러운 분위기를 강조해요.',
        },
      ],
      avoid: [
        {
          items: ['굵은 벨트', '투박한 지퍼', '과한 메탈 장식', '큰 포켓'],
          reason: '체형보다 장식이 무거워 보여 섬세한 인상이 약해질 수 있어요.',
        },
      ],
    },
  },
};
