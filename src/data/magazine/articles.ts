import type { Locale } from '@/types';

export interface ArticleExample {
  readonly name: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly sourceUrl: string;
  readonly reasoning: string;
}

export type ArticleSection =
  | { kind: 'paragraph'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: readonly string[] }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'callout'; text: string }
  | { kind: 'examples'; items: readonly ArticleExample[] }
  | { kind: 'cta'; label: string; href: string; lead?: string };

export interface ArticleContent {
  readonly title: string;
  readonly subtitle: string;
  readonly sections: readonly ArticleSection[];
}

export interface Article {
  readonly slug: string;
  readonly publishedAt: string;
  readonly cover: string;
  readonly en: ArticleContent;
  readonly ko: ArticleContent;
}

const personalBodyType: Article = {
  slug: 'personal-body-type',
  publishedAt: '2026-06-15',
  cover: '/magazine/personal-body-type/cover.png',
  en: {
    title: 'Personal Body Type',
    subtitle: 'A gentle intro to Straight, Wave, and Natural frames',
    sections: [
      {
        kind: 'paragraph',
        text: 'Personal body type — sometimes called body-type analysis — looks at the natural shape of your skeleton and the texture of your body, not your weight or size. It groups people into three references: Straight, Wave, and Natural. Knowing your reference can make styling feel less like guesswork.',
      },
      {
        kind: 'callout',
        text: 'These three patterns are guides — many people sit between two types.',
      },
      {
        kind: 'heading',
        text: 'Straight',
      },
      {
        kind: 'paragraph',
        text: 'A balanced, structured silhouette. The body looks firm and three-dimensional, with weight evenly distributed around the upper body. Skin tends to feel resilient and the bust line sits relatively high.',
      },
      {
        kind: 'list',
        items: [
          'Even shoulders, defined collarbones',
          'Firm, three-dimensional torso',
          'Wrists and ankles look round rather than bony',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: 'Jisoo (BLACKPINK)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_%2812%29.png/500px-Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_%2812%29.png',
            imageAlt: 'Portrait of Jisoo of BLACKPINK',
            sourceUrl: 'https://en.wikipedia.org/wiki/Jisoo',
            reasoning: 'Even shoulders and a firm, three-dimensional upper body.',
          },
          {
            name: 'Sabrina Carpenter',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sabrina_Carpenter_-_O2_Arena_2025_-_086_%28cropped_2%29.jpg/500px-Sabrina_Carpenter_-_O2_Arena_2025_-_086_%28cropped_2%29.jpg',
            imageAlt: 'Portrait of Sabrina Carpenter',
            sourceUrl: 'https://en.wikipedia.org/wiki/Sabrina_Carpenter',
            reasoning: 'Compact, defined upper body with a relatively high bust line.',
          },
        ],
      },
      {
        kind: 'heading',
        text: 'Wave',
      },
      {
        kind: 'paragraph',
        text: 'A soft, curved silhouette. The body feels lighter on top and curves softly around the lower body. Skin tends to feel soft, and small frames or sloping shoulders are common.',
      },
      {
        kind: 'list',
        items: [
          'Sloped shoulders, narrow collarbones',
          'Lower bust line, soft torso',
          'Slim wrists, the waist sits relatively low',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: 'Winter (aespa)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Winter_at_Kilian_Paris_event_on_27012026_%284%29.png/500px-Winter_at_Kilian_Paris_event_on_27012026_%284%29.png',
            imageAlt: 'Portrait of Winter from aespa',
            sourceUrl: 'https://en.wikipedia.org/wiki/Winter_(singer)',
            reasoning: 'Soft features and a slim frame with gently sloping shoulders.',
          },
          {
            name: 'Taylor Swift',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/500px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png',
            imageAlt: 'Portrait of Taylor Swift',
            sourceUrl: 'https://en.wikipedia.org/wiki/Taylor_Swift',
            reasoning: 'Lighter upper-body lines with slim wrists and soft features.',
          },
        ],
      },
      {
        kind: 'heading',
        text: 'Natural',
      },
      {
        kind: 'paragraph',
        text: 'A sturdy, naturally angular silhouette. Joints stand out and shoulders feel broad. The overall shape is straight up-and-down rather than curved.',
      },
      {
        kind: 'list',
        items: [
          'Broad shoulders, visible joints',
          'Long, flat torso',
          'Wrists and ankles look angular and defined',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: 'Lisa (BLACKPINK)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/20240314_Lisa_Manoban_07.jpg/500px-20240314_Lisa_Manoban_07.jpg',
            imageAlt: 'Portrait of Lisa of BLACKPINK',
            sourceUrl: 'https://en.wikipedia.org/wiki/Lisa_(rapper)',
            reasoning: 'Sharp shoulder line and lean, long limbs.',
          },
          {
            name: 'Kendall Jenner',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Kendall_Jenner_for_Adanola_2_%28cropped%29.jpg/500px-Kendall_Jenner_for_Adanola_2_%28cropped%29.jpg',
            imageAlt: 'Portrait of Kendall Jenner',
            sourceUrl: 'https://en.wikipedia.org/wiki/Kendall_Jenner',
            reasoning: 'Tall, lean silhouette with broad shoulders and long limbs.',
          },
        ],
      },
      {
        kind: 'cta',
        label: 'Try the body-type reading',
        href: '/magazine/personal-body-type/diagnose',
        lead: 'Not sure which type fits? Find your body type from a single photo.',
      },
    ],
  },
  ko: {
    title: '퍼스널 체형',
    subtitle: '스트레이트·웨이브·내추럴, 세 가지 골격 이야기',
    sections: [
      {
        kind: 'paragraph',
        text: '퍼스널 체형(골격 분석)은 몸무게나 사이즈가 아니라 타고난 골격의 형태와 살의 질감을 기준으로 분류하는 방식이에요. 크게 스트레이트, 웨이브, 내추럴 세 가지 참고 유형으로 나눠요. 자기 유형의 결을 알면 스타일링이 조금 덜 어려워질 수 있어요.',
      },
      {
        kind: 'callout',
        text: '세 가지 유형은 가이드예요. 두 유형 사이에 있는 분도 많아요.',
      },
      {
        kind: 'heading',
        text: '스트레이트',
      },
      {
        kind: 'paragraph',
        text: '균형 잡힌, 입체적인 실루엣이에요. 몸이 단단하고 탄력 있게 느껴지고, 상체 쪽에 볼륨이 자연스럽게 모이는 편이에요. 가슴 위치도 비교적 높게 보여요.',
      },
      {
        kind: 'list',
        items: [
          '어깨선이 곧고 쇄골이 또렷',
          '탄탄하고 입체적인 상반신',
          '손목·발목이 동그란 느낌',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: '지수 (블랙핑크)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_%2812%29.png/500px-Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_%2812%29.png',
            imageAlt: '블랙핑크 지수 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Jisoo',
            reasoning: '곧은 어깨선과 단단하고 입체적인 상체.',
          },
          {
            name: '사브리나 카펜터',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Sabrina_Carpenter_-_O2_Arena_2025_-_086_%28cropped_2%29.jpg/500px-Sabrina_Carpenter_-_O2_Arena_2025_-_086_%28cropped_2%29.jpg',
            imageAlt: '사브리나 카펜터 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Sabrina_Carpenter',
            reasoning: '컴팩트하고 또렷한 상체와 비교적 높은 가슴 위치.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '웨이브',
      },
      {
        kind: 'paragraph',
        text: '부드럽고 곡선적인 실루엣이에요. 상체는 가볍고 하체 쪽에 살이 부드럽게 모이는 편이에요. 피부가 보드라운 느낌이고, 어깨가 살짝 내려간 느낌도 흔해요.',
      },
      {
        kind: 'list',
        items: [
          '내려간 어깨, 좁은 쇄골',
          '낮은 가슴 위치, 부드러운 상체',
          '얇은 손목, 비교적 낮은 허리 위치',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: '윈터 (에스파)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Winter_at_Kilian_Paris_event_on_27012026_%284%29.png/500px-Winter_at_Kilian_Paris_event_on_27012026_%284%29.png',
            imageAlt: '에스파 윈터 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Winter_(singer)',
            reasoning: '부드러운 인상과 가벼운 상체 라인.',
          },
          {
            name: '테일러 스위프트',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png/500px-Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%283%29.png',
            imageAlt: '테일러 스위프트 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Taylor_Swift',
            reasoning: '가벼운 상체 라인과 얇은 손목.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '내추럴',
      },
      {
        kind: 'paragraph',
        text: '뼈대가 또렷한, 직선적인 실루엣이에요. 관절이 눈에 잘 들어오고 어깨가 넓게 느껴져요. 전체적으로 곡선보다는 일자로 떨어지는 느낌이에요.',
      },
      {
        kind: 'list',
        items: [
          '넓은 어깨, 도드라지는 관절',
          '길고 평평한 상반신',
          '각이 진 듯한 손목·발목',
        ],
      },
      {
        kind: 'examples',
        items: [
          {
            name: '리사 (블랙핑크)',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/20240314_Lisa_Manoban_07.jpg/500px-20240314_Lisa_Manoban_07.jpg',
            imageAlt: '블랙핑크 리사 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Lisa_(rapper)',
            reasoning: '또렷한 어깨 라인과 길고 가는 팔다리.',
          },
          {
            name: '켄달 제너',
            image:
              'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Kendall_Jenner_for_Adanola_2_%28cropped%29.jpg/500px-Kendall_Jenner_for_Adanola_2_%28cropped%29.jpg',
            imageAlt: '켄달 제너 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Kendall_Jenner',
            reasoning: '큰 키와 길고 시원하게 떨어지는 라인.',
          },
        ],
      },
      {
        kind: 'cta',
        label: '내 체형 알아보기',
        href: '/magazine/personal-body-type/diagnose',
        lead: '아직 내 체형을 모르겠다면, 사진 한 장으로 알아봐요.',
      },
    ],
  },
};

export const articles: readonly Article[] = [personalBodyType];

export function listArticles(): readonly Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleContent(article: Article, locale: Locale): ArticleContent {
  return article[locale];
}
