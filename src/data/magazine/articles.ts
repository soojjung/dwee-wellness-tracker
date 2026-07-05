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
  | { kind: 'examples'; items: readonly ArticleExample[] };

export interface ArticleCta {
  readonly label: string;
  readonly href: string;
}

export interface ArticleContent {
  readonly title: string;
  // Optional emoji shown next to the title on the detail hero only.
  readonly heroEmoji?: string;
  readonly subtitle: string;
  readonly sections: readonly ArticleSection[];
  readonly cta?: ArticleCta;
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
  publishedAt: '2026-06-24',
  cover: '/magazine/personal-body-type/cover.png',
  en: {
    title: 'Personal body type',
    heroEmoji: '🚶🏻‍♀️',
    subtitle: 'Straight, Wave, and Natural — three frames, one gentle guide',
    sections: [
      {
        kind: 'heading',
        text: 'Why look at your body type?',
      },
      {
        kind: 'paragraph',
        text: 'Personal body type — sometimes called body-type analysis — looks at the natural shape of your skeleton and the texture of your body, not your weight or size. It groups people into three references: Straight, Wave, and Natural. Knowing your reference can make styling feel less like guesswork.',
      },
      {
        kind: 'heading',
        text: '1. Straight',
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
            image: '/magazine/personal-body-type/example-jisoo.png',
            imageAlt: 'Portrait of Jisoo of BLACKPINK',
            sourceUrl: 'https://en.wikipedia.org/wiki/Jisoo',
            reasoning: 'Even shoulders and a firm, three-dimensional upper body.',
          },
          {
            name: 'Sabrina Carpenter',
            image: '/magazine/personal-body-type/example-sabrina.png',
            imageAlt: 'Portrait of Sabrina Carpenter',
            sourceUrl: 'https://en.wikipedia.org/wiki/Sabrina_Carpenter',
            reasoning: 'Compact, defined upper body with a relatively high bust line.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '2. Wave',
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
            image: '/magazine/personal-body-type/example-winter.png',
            imageAlt: 'Portrait of Winter from aespa',
            sourceUrl: 'https://en.wikipedia.org/wiki/Winter_(singer)',
            reasoning: 'Soft features and a slim frame with gently sloping shoulders.',
          },
          {
            name: 'Taylor Swift',
            image: '/magazine/personal-body-type/example-taylor.png',
            imageAlt: 'Portrait of Taylor Swift',
            sourceUrl: 'https://en.wikipedia.org/wiki/Taylor_Swift',
            reasoning: 'Lighter upper-body lines with slim wrists and soft features.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '3. Natural',
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
            image: '/magazine/personal-body-type/example-lisa.png',
            imageAlt: 'Portrait of Lisa of BLACKPINK',
            sourceUrl: 'https://en.wikipedia.org/wiki/Lisa_(rapper)',
            reasoning: 'Sharp shoulder line and lean, long limbs.',
          },
          {
            name: 'Kendall Jenner',
            image: '/magazine/personal-body-type/example-kendall.png',
            imageAlt: 'Portrait of Kendall Jenner',
            sourceUrl: 'https://en.wikipedia.org/wiki/Kendall_Jenner',
            reasoning: 'Tall, lean silhouette with broad shoulders and long limbs.',
          },
        ],
      },
    ],
    cta: {
      label: 'Find my body type',
      href: '/magazine/personal-body-type/diagnose',
    },
  },
  ko: {
    title: '퍼스널 체형',
    heroEmoji: '🚶🏻‍♀️',
    subtitle: '스트레이트, 웨이브, 내추럴 — 3가지 골격 이야기',
    sections: [
      {
        kind: 'heading',
        text: '퍼스널 체형, 왜 알아야 할까?',
      },
      {
        kind: 'paragraph',
        text: '퍼스널 체형(골격 분석)은 몸무게나 사이즈가 아니라 타고난 골격의 형태와 살의 질감을 기준으로 분류하는 방식이에요. 크게 스트레이트, 웨이브, 내추럴 세 가지 참고 유형으로 나눠요. 자기 유형의 결을 알면 스타일링이 조금 덜 어려워질 수 있어요.',
      },
      {
        kind: 'heading',
        text: '1. 스트레이트',
      },
      {
        kind: 'paragraph',
        text: '균형 잡힌, 입체적인 실루엣이에요. 몸이 단단하고 탄력 있게 느껴지고, 상체 쪽에 볼륨이 자연스럽게 모이는 편이에요. 가슴 위치도 비교적 높게 보여요.',
      },
      {
        kind: 'list',
        items: ['어깨선이 곧고 쇄골이 또렷', '탄탄하고 입체적인 상반신', '손목·발목이 동그란 느낌'],
      },
      {
        kind: 'examples',
        items: [
          {
            name: '지수 (블랙핑크)',
            image: '/magazine/personal-body-type/example-jisoo.png',
            imageAlt: '블랙핑크 지수 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Jisoo',
            reasoning: '곧은 어깨선과 단단하고 입체적인 상체.',
          },
          {
            name: '사브리나 카펜터',
            image: '/magazine/personal-body-type/example-sabrina.png',
            imageAlt: '사브리나 카펜터 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Sabrina_Carpenter',
            reasoning: '컴팩트하고 또렷한 상체와 비교적 높은 가슴 위치.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '2. 웨이브',
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
            image: '/magazine/personal-body-type/example-winter.png',
            imageAlt: '에스파 윈터 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Winter_(singer)',
            reasoning: '부드러운 인상과 가벼운 상체 라인.',
          },
          {
            name: '테일러 스위프트',
            image: '/magazine/personal-body-type/example-taylor.png',
            imageAlt: '테일러 스위프트 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Taylor_Swift',
            reasoning: '가벼운 상체 라인과 얇은 손목.',
          },
        ],
      },
      {
        kind: 'heading',
        text: '3. 내추럴',
      },
      {
        kind: 'paragraph',
        text: '뼈대가 또렷한, 직선적인 실루엣이에요. 관절이 눈에 잘 들어오고 어깨가 넓게 느껴져요. 전체적으로 곡선보다는 일자로 떨어지는 느낌이에요.',
      },
      {
        kind: 'list',
        items: ['넓은 어깨, 도드라지는 관절', '길고 평평한 상반신', '각이 진 듯한 손목·발목'],
      },
      {
        kind: 'examples',
        items: [
          {
            name: '리사 (블랙핑크)',
            image: '/magazine/personal-body-type/example-lisa.png',
            imageAlt: '블랙핑크 리사 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Lisa_(rapper)',
            reasoning: '또렷한 어깨 라인과 길고 가는 팔다리.',
          },
          {
            name: '켄달 제너',
            image: '/magazine/personal-body-type/example-kendall.png',
            imageAlt: '켄달 제너 인물 사진',
            sourceUrl: 'https://en.wikipedia.org/wiki/Kendall_Jenner',
            reasoning: '큰 키와 길고 시원하게 떨어지는 라인.',
          },
        ],
      },
    ],
    cta: {
      label: '내 체형 알아보기',
      href: '/magazine/personal-body-type/diagnose',
    },
  },
};

const cyclePhases: Article = {
  slug: 'cycle-phases',
  publishedAt: '2026-07-06',
  cover: '/magazine/cycle-phases/cover.jpg',
  en: {
    title: 'Your cycle in 4 phases',
    heroEmoji: '🌙',
    subtitle: 'Menstrual, follicular, ovulation, luteal — a soft map of what your body may be doing',
    sections: [
      {
        kind: 'heading',
        text: 'Why think in phases?',
      },
      {
        kind: 'paragraph',
        text: 'The menstrual cycle isn’t one long stretch — it moves through phases, each with its own rhythm. Knowing roughly where you are can help you plan and rest without pushing when your body needs a softer pace. Cycle length varies from person to person; a common reference is around 28 days, but anywhere from 21 to 35 days is a familiar pattern.',
      },
      {
        kind: 'heading',
        text: '1. Menstrual phase — the period days',
      },
      {
        kind: 'paragraph',
        text: 'The first stretch of the cycle: the days you’re bleeding. Energy tends to dip and the body can feel a little more tender. It’s a good stretch to let yourself slow down.',
      },
      {
        kind: 'list',
        items: [
          'Typically the first 4–5 days of the cycle',
          'Cramping, low energy, or a heavier feeling may show up',
          'A slower pace and warmth tend to feel supportive',
        ],
      },
      {
        kind: 'heading',
        text: '2. Follicular phase — energy building up',
      },
      {
        kind: 'paragraph',
        text: 'After bleeding ends, the body gently ramps back up. Motivation and focus often return, and this stretch can feel like a lighter, more open window.',
      },
      {
        kind: 'list',
        items: [
          'Roughly the week after your period ends',
          'Curiosity, focus, and stamina often build',
          'A good stretch for starting something or trying a new routine',
        ],
      },
      {
        kind: 'heading',
        text: '3. Ovulation phase — the energy peak',
      },
      {
        kind: 'paragraph',
        text: 'Around the middle of the cycle, energy tends to sit near its highest. Many people notice they feel more social, expressive, and steady in themselves.',
      },
      {
        kind: 'list',
        items: [
          'A short window of about 3 days near mid-cycle',
          'Stamina and mood often feel steadier',
          'A natural stretch for connection and outward moments',
        ],
      },
      {
        kind: 'heading',
        text: '4. Luteal phase — winding down',
      },
      {
        kind: 'paragraph',
        text: 'In the second half of the cycle, the body starts winding down toward the next period. Sensitivity may rise, sleep can feel more precious, and it’s okay to lean into rest.',
      },
      {
        kind: 'list',
        items: [
          'Roughly the two weeks before the next period',
          'Sensitivity, bloating, or mood shifts may show up',
          'Gentle routines and a lighter schedule tend to help',
        ],
      },
      {
        kind: 'heading',
        text: 'A gentle note',
      },
      {
        kind: 'paragraph',
        text: 'Cycles are patterns, not schedules — the timing shifts from person to person and month to month. Use these phases as a soft reference, not a rule. If something feels off for you, that’s worth listening to.',
      },
    ],
  },
  ko: {
    title: '생리 주기의 4단계',
    heroEmoji: '🌙',
    subtitle: '월경기·난포기·배란기·황체기 — 몸의 리듬을 가볍게 이해하기',
    sections: [
      {
        kind: 'heading',
        text: '단계로 나눠 보는 이유',
      },
      {
        kind: 'paragraph',
        text: '생리 주기는 하나의 긴 흐름이 아니라 각기 다른 결을 가진 몇 단계로 이어져요. 지금 내가 어디쯤에 있는지 어렴풋이 알아두면, 몸이 조금 부드러운 속도를 원할 때 무리하지 않고 계획을 세우기 좋아요. 주기 길이는 사람마다 달라요. 흔히 28일을 기준으로 이야기하지만, 21~35일 사이면 익숙한 패턴이에요.',
      },
      {
        kind: 'heading',
        text: '1. 월경기 — 생리를 하는 시기',
      },
      {
        kind: 'paragraph',
        text: '주기의 첫 구간이에요. 출혈이 있는 며칠 동안 에너지가 조금 낮아지고, 몸이 평소보다 예민하게 느껴질 수 있어요. 속도를 늦춰도 괜찮은 시기예요.',
      },
      {
        kind: 'list',
        items: [
          '보통 주기의 처음 4~5일',
          '생리통, 나른함, 무거운 느낌이 함께 올 수 있어요',
          '따뜻하게, 천천히 지내면 몸이 편안해질 수 있어요',
        ],
      },
      {
        kind: 'heading',
        text: '2. 난포기 — 에너지가 차오르는 시기',
      },
      {
        kind: 'paragraph',
        text: '생리가 끝난 뒤 몸이 서서히 회복하며 다시 리듬을 찾아가요. 집중력과 의욕이 조금씩 돌아오는, 가볍고 트인 느낌의 구간이에요.',
      },
      {
        kind: 'list',
        items: [
          '보통 생리가 끝난 뒤 한 주 정도',
          '호기심, 집중력, 체력이 조금씩 올라와요',
          '뭔가 새로 시작해보기 좋은 시기예요',
        ],
      },
      {
        kind: 'heading',
        text: '3. 배란기 — 에너지의 정점',
      },
      {
        kind: 'paragraph',
        text: '주기의 중간 즈음, 에너지가 가장 높게 느껴지는 시기예요. 감정도 조금 더 밝고, 사람들과의 만남이 자연스럽게 느껴질 수 있어요.',
      },
      {
        kind: 'list',
        items: [
          '주기 중간에 3일 정도의 짧은 구간',
          '체력과 기분이 안정적으로 유지되는 편',
          '연결과 표현이 자연스럽게 다가오는 시기',
        ],
      },
      {
        kind: 'heading',
        text: '4. 황체기 — 서서히 잦아드는 시기',
      },
      {
        kind: 'paragraph',
        text: '주기의 후반부에 접어들면 몸이 다음 생리를 향해 천천히 속도를 줄여가요. 예민함이 올라오고 잠이 더 소중하게 느껴질 수 있어요. 쉬어가는 시간을 허락해도 좋아요.',
      },
      {
        kind: 'list',
        items: [
          '다음 생리 전까지의 약 2주',
          '예민함, 붓기, 감정 변화가 올 수 있어요',
          '가벼운 루틴과 여유 있는 일정이 도움이 될 수 있어요',
        ],
      },
      {
        kind: 'heading',
        text: '작은 안내',
      },
      {
        kind: 'paragraph',
        text: '주기는 정해진 시간표가 아니라 반복되는 패턴에 가까워요. 사람마다, 매달 조금씩 달라질 수 있으니 이 단계들은 참고용으로 가볍게 봐주세요. 내 몸이 보내는 신호가 있다면 그 감각을 먼저 믿어도 괜찮아요.',
      },
    ],
  },
};

const cycleLengthThirtyFive: Article = {
  slug: 'cycle-length-35-days',
  publishedAt: '2026-07-06',
  cover: '/magazine/cycle-length-35-days/cover.jpg',
  en: {
    title: 'Is a 35-day cycle too long?',
    heroEmoji: '⏳',
    subtitle: 'What a longer cycle usually means, and why it may be a familiar pattern for your body',
    sections: [
      {
        kind: 'heading',
        text: 'Many people wonder if their cycle is too long',
      },
      {
        kind: 'paragraph',
        text: 'If your cycle runs to 35 days, it’s easy to worry. We grow up hearing "28 days" as the default, so anything else can feel out of step. The truth is gentler: your body has its own rhythm, and a longer cycle is often just how it works for you.',
      },
      {
        kind: 'heading',
        text: 'What counts as a familiar range?',
      },
      {
        kind: 'paragraph',
        text: 'A 28-day cycle is an average, not a rule. Health references often point to 21–35 days as a familiar reference range for adults. A 35-day cycle sits at the longer edge of that band — closer to the end, but still inside a familiar pattern.',
      },
      {
        kind: 'heading',
        text: 'What happens in a longer cycle?',
      },
      {
        kind: 'paragraph',
        text: 'When a cycle is longer, the shift usually happens in the follicular phase — the stretch from your period through ovulation. The body simply takes a bit more time before ovulation. The luteal phase (after ovulation, before the next period) tends to stay roughly the same, around 14 days. So a 35-day cycle may just mean ovulation happens around day 21 instead of day 14.',
      },
      {
        kind: 'list',
        items: [
          'Ovulation tends to shift later in the cycle',
          'The follicular phase is longer; the luteal phase stays steady',
          'The rhythm is still there — it’s just on your timeline',
        ],
      },
      {
        kind: 'heading',
        text: 'Why cycles drift',
      },
      {
        kind: 'paragraph',
        text: 'Cycle length isn’t fixed. Stress, sleep shifts, intense exercise, travel, or bigger life changes can nudge your timeline. Season and mood can ripple through, too. These shifts are a familiar part of many people’s patterns — one month rarely tells the whole story.',
      },
      {
        kind: 'list',
        items: [
          'Sleep disruption or stress',
          'Changes in exercise intensity',
          'Travel or big life shifts',
        ],
      },
      {
        kind: 'heading',
        text: 'When it may be worth checking in',
      },
      {
        kind: 'paragraph',
        text: 'A 35-day cycle on its own isn’t something to worry about. But if your cycle regularly falls outside 21–35 days, or swings widely from month to month, a light conversation with a healthcare provider can be a good next step. Not because something is wrong — just to understand your pattern with more confidence.',
      },
      {
        kind: 'heading',
        text: 'Your cycle is yours',
      },
      {
        kind: 'paragraph',
        text: 'The 28-day reference is a starting point, not a requirement. If 35 days is your pattern, it’s still your pattern. The signals you notice month to month are often the best guide.',
      },
    ],
  },
  ko: {
    title: '생리 주기가 35일이면 너무 늦는 건가요?',
    heroEmoji: '⏳',
    subtitle: '평균보다 조금 긴 주기가 왜 흔한 패턴일 수 있는지',
    sections: [
      {
        kind: 'heading',
        text: '주기가 길어서 걱정하는 분들이 많아요',
      },
      {
        kind: 'paragraph',
        text: '생리 주기가 35일까지 늘어나면 불안한 마음이 들 수 있어요. "28일"을 기준처럼 배워왔으니 그럴 만해요. 그런데 사실은 조금 더 부드러워요. 사람마다 몸의 리듬이 있고, 주기가 길다면 그게 지금의 내 몸이 움직이는 방식일 수 있어요.',
      },
      {
        kind: 'heading',
        text: '흔히 참고하는 범위는 어디까지일까요?',
      },
      {
        kind: 'paragraph',
        text: '28일은 평균이지 규칙이 아니에요. 흔히 성인의 참고 범위로 21~35일이 소개돼요. 35일 주기는 그 범위의 끝자락에 있는 패턴이에요. 길긴 하지만, 익숙한 참고 범위 안에 들어있어요.',
      },
      {
        kind: 'heading',
        text: '주기가 길면 몸에서 뭐가 달라져요?',
      },
      {
        kind: 'paragraph',
        text: '주기가 길어질 때 달라지는 구간은 보통 난포기예요. 생리가 끝나고 배란까지 가는 시간이 조금 더 길어지는 거예요. 배란 이후 다음 생리까지 이어지는 황체기는 약 14일 정도로 대체로 비슷하게 유지돼요. 그래서 35일 주기라면 배란이 14일차가 아니라 21일차 즈음에 일어나는 흐름일 수 있어요.',
      },
      {
        kind: 'list',
        items: [
          '배란이 주기의 뒷쪽으로 밀리는 편이에요',
          '난포기가 길어지고, 황체기는 그대로예요',
          '리듬은 그대로예요, 그저 나만의 타이밍일 뿐이에요',
        ],
      },
      {
        kind: 'heading',
        text: '주기가 조금씩 흔들리는 이유',
      },
      {
        kind: 'paragraph',
        text: '주기 길이는 고정된 게 아니에요. 스트레스, 수면 변화, 운동 강도, 여행, 큰 생활 변화 같은 것들이 타이밍을 살짝 밀거나 당길 수 있어요. 계절이나 기분도 영향을 줄 수 있고요. 이런 변화는 많은 분들의 패턴에서 흔히 보이는 결이에요. 한 달만 보고 판단하기보다 몇 달의 흐름을 함께 보는 게 좋아요.',
      },
      {
        kind: 'list',
        items: [
          '수면 부족이나 스트레스',
          '운동 강도의 변화',
          '여행이나 큰 생활 변화',
        ],
      },
      {
        kind: 'heading',
        text: '전문가와 얘기해보면 좋은 순간',
      },
      {
        kind: 'paragraph',
        text: '35일 주기 자체는 걱정할 일이 아니에요. 다만 주기가 21~35일 범위를 자주 벗어나거나, 달마다 크게 들쑥날쑥한다면 전문가와 가볍게 얘기해보는 것도 좋은 선택이에요. 뭔가 잘못돼서가 아니라, 내 패턴을 조금 더 편안하게 이해하기 위해서요.',
      },
      {
        kind: 'heading',
        text: '내 주기는 내 것이에요',
      },
      {
        kind: 'paragraph',
        text: '28일은 참고를 위한 출발점이지 반드시 지켜야 하는 숫자가 아니에요. 35일이 내 패턴이라면, 그것도 내 리듬이에요. 매달 몸이 보내는 신호를 살펴보는 것, 그게 가장 좋은 안내가 될 수 있어요.',
      },
    ],
  },
};

const periodSupplements: Article = {
  slug: 'period-supplements',
  publishedAt: '2026-07-06',
  cover: '/magazine/period-supplements/cover.jpg',
  en: {
    title: 'Supplements that may help during your period',
    heroEmoji: '🌿',
    subtitle: 'A gentle look at nutrients people often reach for during period days',
    sections: [
      {
        kind: 'heading',
        text: 'Why think about nutrients during your period?',
      },
      {
        kind: 'paragraph',
        text: 'The menstrual phase asks a lot of the body — mild fatigue, cramping, and mood shifts are all part of what many people feel. Certain nutrients come up often in conversations about period comfort, whether from food or as a supplement. This isn’t medical advice, just a soft reference to what many people find helpful.',
      },
      {
        kind: 'heading',
        text: 'Iron',
      },
      {
        kind: 'paragraph',
        text: 'Iron often comes up first, since some is lost through bleeding. Replenishing it may help with the heavier or more tired feeling that shows up on period days. Food sources are usually a gentle first step.',
      },
      {
        kind: 'list',
        items: [
          'Lean red meat, poultry, and fish',
          'Beans, lentils, and tofu',
          'Leafy greens like spinach and kale',
        ],
      },
      {
        kind: 'heading',
        text: 'Magnesium',
      },
      {
        kind: 'paragraph',
        text: 'Magnesium is commonly mentioned for cramp comfort and a steadier mood around the period. Many people are a little low in this mineral without realizing, so keeping it in mind can be a gentle support.',
      },
      {
        kind: 'list',
        items: [
          'Pumpkin seeds, almonds, and other nuts',
          'Dark chocolate and cocoa',
          'Whole grains and leafy greens',
        ],
      },
      {
        kind: 'heading',
        text: 'Omega-3',
      },
      {
        kind: 'paragraph',
        text: 'Some people find that omega-3 fats may help with cramp discomfort and mood on heavier days. These fats are easy to weave into everyday meals, not just around your period.',
      },
      {
        kind: 'list',
        items: [
          'Fatty fish like salmon, mackerel, and sardines',
          'Flaxseeds, chia seeds, and walnuts',
          'Plant oils like canola and soybean oil',
        ],
      },
      {
        kind: 'heading',
        text: 'Vitamin B6',
      },
      {
        kind: 'paragraph',
        text: 'Vitamin B6 is sometimes brought up for mood balance around the period. It shows up in a lot of everyday foods, which is a small reminder that food is often the easiest place to start.',
      },
      {
        kind: 'list',
        items: [
          'Poultry, fish, and eggs',
          'Chickpeas, potatoes, and bananas',
          'Avocados and whole grains',
        ],
      },
      {
        kind: 'heading',
        text: 'Vitamin D',
      },
      {
        kind: 'paragraph',
        text: 'Vitamin D isn’t specific to the cycle, but many people run a little low on it. Keeping it steady may help support overall mood and energy through the month, not just on period days.',
      },
      {
        kind: 'list',
        items: [
          'Fatty fish and egg yolks',
          'Fortified milk or plant milks',
          'A little daily sunlight (the body makes vitamin D naturally)',
        ],
      },
      {
        kind: 'heading',
        text: 'A gentle note before starting anything new',
      },
      {
        kind: 'paragraph',
        text: 'Supplements aren’t a substitute for professional guidance. If you’re pregnant, nursing, taking medication, or managing an existing condition, a quick chat with a doctor or pharmacist can help you figure out what fits your body and your day. When in doubt, that conversation is a kind first step.',
      },
      {
        kind: 'heading',
        text: 'Food first, rest always',
      },
      {
        kind: 'paragraph',
        text: 'Most of the nutrients above show up more gently through food than through pills. When it feels possible, eating well tends to be the softer path — but the real basics are warmth, rest, and listening to what your body is asking for. Notice what actually helps you feel steadier. Every body is a little different.',
      },
    ],
  },
  ko: {
    title: '생리 기간에 챙기면 좋을 영양제',
    heroEmoji: '🌿',
    subtitle: '생리 중에 자주 이야기되는 영양 성분들을 가볍게 살펴봐요',
    sections: [
      {
        kind: 'heading',
        text: '생리 기간, 영양을 챙겨보는 이유',
      },
      {
        kind: 'paragraph',
        text: '월경기 동안 몸은 평소보다 많은 일을 하고 있어요. 나른함이나 생리통, 감정 기복이 함께 오는 경우도 많고요. 이 시기의 편안함을 위해 자주 이야기되는 영양 성분들이 있어요. 음식으로든, 영양제로든요. 의학적 조언이 아니라, 많은 분들이 도움을 느끼는 참고 정보로 가볍게 봐주세요.',
      },
      {
        kind: 'heading',
        text: '철분',
      },
      {
        kind: 'paragraph',
        text: '생리 중에는 출혈로 철분이 함께 빠져나가서 가장 먼저 이야기되는 영양소예요. 철분을 채워주면 이 시기의 피로감이 조금 가벼워지는 걸 느끼는 분들이 많아요. 음식에서 먼저 시작해보는 것도 부드러운 방법이에요.',
      },
      {
        kind: 'list',
        items: [
          '소고기, 닭고기, 생선',
          '콩, 렌틸콩, 두부',
          '시금치, 케일 같은 초록 잎채소',
        ],
      },
      {
        kind: 'heading',
        text: '마그네슘',
      },
      {
        kind: 'paragraph',
        text: '마그네슘은 생리통의 편안함이나 감정의 안정에 도움이 될 수 있다고 종종 이야기돼요. 자기도 모르게 조금씩 부족한 분들이 많아서, 함께 챙겨두면 부드러운 지지가 될 수 있어요.',
      },
      {
        kind: 'list',
        items: [
          '호박씨, 아몬드 같은 견과와 씨앗',
          '다크초콜릿과 코코아',
          '통곡물과 초록 잎채소',
        ],
      },
      {
        kind: 'heading',
        text: '오메가-3',
      },
      {
        kind: 'paragraph',
        text: '오메가-3 지방은 생리통의 불편함이나 기분에 도움이 될 수 있다고 느끼는 분들이 있어요. 생리 기간뿐 아니라 평소 식단에 자연스럽게 녹여두면 좋아요.',
      },
      {
        kind: 'list',
        items: [
          '연어, 고등어, 정어리 같은 등푸른 생선',
          '아마씨, 치아씨, 호두',
          '카놀라유, 콩기름 같은 식물성 기름',
        ],
      },
      {
        kind: 'heading',
        text: '비타민 B6',
      },
      {
        kind: 'paragraph',
        text: '비타민 B6는 생리 전후의 감정 변화에 도움이 될 수 있다고 이야기돼요. 일상적인 음식에도 두루 들어 있어서, 음식으로 자연스럽게 챙기는 것이 가장 쉬운 시작이에요.',
      },
      {
        kind: 'list',
        items: [
          '닭고기, 생선, 계란',
          '병아리콩, 감자, 바나나',
          '아보카도, 통곡물',
        ],
      },
      {
        kind: 'heading',
        text: '비타민 D',
      },
      {
        kind: 'paragraph',
        text: '비타민 D는 생리 주기에 한정된 영양소는 아니지만, 부족한 분들이 꽤 많아요. 꾸준히 유지해두면 생리 기간뿐 아니라 한 달 전체의 기분과 컨디션이 좀 더 안정적으로 느껴질 수 있어요.',
      },
      {
        kind: 'list',
        items: [
          '등푸른 생선과 계란 노른자',
          '강화 우유나 두유',
          '가벼운 햇빛 (몸이 자연스럽게 비타민 D를 만들어요)',
        ],
      },
      {
        kind: 'heading',
        text: '시작하기 전, 가볍게 알아두면 좋은 것',
      },
      {
        kind: 'paragraph',
        text: '영양제는 전문가의 조언을 대신할 수 없어요. 임신 중이거나 수유 중, 약을 드시고 있거나 이미 관리 중인 건강 상태가 있다면 시작하기 전에 의사나 약사와 가볍게 이야기해보는 게 좋아요. 내 몸과 지금의 생활에 맞는 방식을 함께 찾아볼 수 있어요.',
      },
      {
        kind: 'heading',
        text: '음식이 먼저, 휴식은 언제나',
      },
      {
        kind: 'paragraph',
        text: '위의 영양소들은 대부분 알약보다 일상의 음식에서 더 부드럽게 만날 수 있어요. 여유가 있다면 잘 먹는 쪽이 더 자연스러운 시작이에요. 그리고 무엇보다 따뜻함과 충분한 휴식, 몸의 신호에 귀 기울이는 것이 가장 큰 기본이에요. 오늘의 나에게 무엇이 편안했는지 천천히 살펴봐요. 모두가 조금씩 다르니까요.',
      },
    ],
  },
};

export const articles: readonly Article[] = [
  personalBodyType,
  cyclePhases,
  cycleLengthThirtyFive,
  periodSupplements,
];

export function listArticles(): readonly Article[] {
  return articles;
}

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticleContent(article: Article, locale: Locale): ArticleContent {
  return article[locale];
}
