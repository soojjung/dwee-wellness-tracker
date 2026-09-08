export const ACTIVITY_CATEGORY_KEYS = ['emotion', 'exercise', 'work', 'selfcare'] as const;
export type ActivityCategoryKey = (typeof ACTIVITY_CATEGORY_KEYS)[number];

interface Visual {
  emoji: string;
  bg: string;
}

const FALLBACK: Visual = { emoji: '🌿', bg: 'bg-brand-pink50' };

export function activityVisual(id: string): Visual {
  return ACTIVITY_VISUAL[id] ?? FALLBACK;
}

export function foodVisual(id: string): Visual {
  return FOOD_VISUAL[id] ?? FALLBACK;
}

const ACTIVITY_VISUAL: Record<string, Visual> = {
  'calm-journal-m': { emoji: '📝', bg: 'bg-brand-pink50' },
  'self-kindness-m': { emoji: '💕', bg: 'bg-brand-pink50' },
  'light-stretch-m': { emoji: '🧘', bg: 'bg-brand-pink50' },
  'restorative-walk-m': { emoji: '🚶', bg: 'bg-brand-pink50' },
  'warm-cup-m': { emoji: '☕', bg: 'bg-brand-pink50' },
  'heating-pad-m': { emoji: '🛁', bg: 'bg-brand-pink50' },
  'connect-friend-f': { emoji: '💬', bg: 'bg-brand-pink50' },
  'curiosity-spark-f': { emoji: '💡', bg: 'bg-brand-pink50' },
  'morning-walk-f': { emoji: '🌞', bg: 'bg-brand-pink50' },
  'light-cardio-f': { emoji: '💃', bg: 'bg-brand-pink50' },
  'new-hobby-f': { emoji: '🎨', bg: 'bg-brand-pink50' },
  'digital-exploring-f': { emoji: '📚', bg: 'bg-brand-pink50' },
  'group-hangout-o': { emoji: '👥', bg: 'bg-brand-pink50' },
  'speak-up-o': { emoji: '🎤', bg: 'bg-brand-pink50' },
  'group-workout-o': { emoji: '🏃', bg: 'bg-brand-pink50' },
  'outdoor-adventure-o': { emoji: '🏞️', bg: 'bg-brand-pink50' },
  'try-new-place-o': { emoji: '🗺️', bg: 'bg-brand-pink50' },
  'celebration-o': { emoji: '✨', bg: 'bg-brand-pink50' },
  'feelings-journal-l': { emoji: '🖊️', bg: 'bg-brand-pink50' },
  'breath-pause-l': { emoji: '🫁', bg: 'bg-brand-pink50' },
  'gentle-yoga-l': { emoji: '🧘‍♀️', bg: 'bg-brand-pink50' },
  'solo-walk-l': { emoji: '🚶‍♀️', bg: 'bg-brand-pink50' },
  'reading-corner-l': { emoji: '📖', bg: 'bg-brand-pink50' },
  'digital-rest-l': { emoji: '🌙', bg: 'bg-brand-pink50' },
  'easy-breathing-u': { emoji: '💨', bg: 'bg-brand-pink50' },
  'notice-moment-u': { emoji: '👀', bg: 'bg-brand-pink50' },
  'light-walk-u': { emoji: '🌿', bg: 'bg-brand-pink50' },
  'gentle-move-u': { emoji: '🕊️', bg: 'bg-brand-pink50' },
  'favorite-moment-u': { emoji: '🎁', bg: 'bg-brand-pink50' },
  'warm-drink-u': { emoji: '🍵', bg: 'bg-brand-pink50' },
  'focus-simple-m': { emoji: '🗂️', bg: 'bg-brand-pink50' },
  'admin-inbox-m': { emoji: '📥', bg: 'bg-brand-pink50' },
  'brainstorm-f': { emoji: '💭', bg: 'bg-brand-pink50' },
  'plan-week-f': { emoji: '🗓️', bg: 'bg-brand-pink50' },
  'present-idea-o': { emoji: '🎤', bg: 'bg-brand-pink50' },
  'lead-meeting-o': { emoji: '🤝', bg: 'bg-brand-pink50' },
  'organize-task-l': { emoji: '🗃️', bg: 'bg-brand-pink50' },
  'review-week-l': { emoji: '📓', bg: 'bg-brand-pink50' },
  'light-task-u': { emoji: '✅', bg: 'bg-brand-pink50' },
  'review-list-u': { emoji: '📋', bg: 'bg-brand-pink50' },
};

const FOOD_VISUAL: Record<string, Visual> = {
  'beef-m': { emoji: '🥩', bg: 'bg-brand-pink50' },
  'oyster-m': { emoji: '🦪', bg: 'bg-brand-pink50' },
  'pumpkin-m': { emoji: '🎃', bg: 'bg-brand-pink50' },
  'seaweed-m': { emoji: '🌿', bg: 'bg-brand-pink50' },
  'dark-choco-m': { emoji: '🍫', bg: 'bg-brand-pink50' },
  'walnut-f': { emoji: '🌰', bg: 'bg-brand-pink50' },
  'tomato-f': { emoji: '🍅', bg: 'bg-brand-pink50' },
  'tofu-f': { emoji: '🍥', bg: 'bg-brand-pink50' },
  'broccoli-f': { emoji: '🥦', bg: 'bg-brand-pink50' },
  'spinach-f': { emoji: '🥬', bg: 'bg-brand-pink50' },
  'blueberry-o': { emoji: '🫐', bg: 'bg-brand-pink50' },
  'almond-o': { emoji: '🥜', bg: 'bg-brand-pink50' },
  'olive-oil-o': { emoji: '🫒', bg: 'bg-brand-pink50' },
  'mackerel-o': { emoji: '🐟', bg: 'bg-brand-pink50' },
  'kale-o': { emoji: '🥬', bg: 'bg-brand-pink50' },
  'sweet-potato-l': { emoji: '🍠', bg: 'bg-brand-pink50' },
  'herbal-tea-l': { emoji: '🍵', bg: 'bg-brand-pink50' },
  'salmon-l': { emoji: '🍣', bg: 'bg-brand-pink50' },
  'avocado-l': { emoji: '🥑', bg: 'bg-brand-pink50' },
  'banana-l': { emoji: '🍌', bg: 'bg-brand-pink50' },
  // unknown 주기는 아직 사진 시안이 없어 이모지 렌더링을 유지한다.
  'cooked-warm-u': { emoji: '🍚', bg: 'bg-brand-pink50' },
  'fresh-simple-u': { emoji: '🍎', bg: 'bg-brand-pink50' },
  'hydration-u': { emoji: '💧', bg: 'bg-brand-pink50' },
  'vegetables-u': { emoji: '🥦', bg: 'bg-brand-pink50' },
};

/**
 * 주기별 음식 사진. Figma `필요한 이미지 모음` 에서 내보낸 합성 이미지로,
 * 그릇과 식재료가 한 장에 들어 있다. unknown 주기는 시안이 아직 없어 빠져 있고,
 * 그 경우 화면이 기존 이모지 + CSS 그릇 렌더링으로 폴백한다.
 */
export const FOOD_BOWL_IMAGE: Partial<Record<string, string>> = {
  menstrual: '/home/foods/menstrual.png',
  follicular: '/home/foods/follicular.png',
  ovulation: '/home/foods/ovulation.png',
  luteal: '/home/foods/luteal.png',
};

/**
 * 라벨 pill 이 놓일 자리 — 사진 안에서 그 음식이 실제로 있는 위치에 붙인다.
 * 값은 이미지 박스 대비 %(좌상단 기준)라 이미지가 리사이즈돼도 따라간다.
 *
 * luteal 은 Figma 홈 시안(256:24709)의 좌표를 그대로 환산한 값이고,
 * 나머지 주기는 라벨 배치 시안이 아직 없어 사진 속 식재료 위치에 맞춰 잡았다.
 * 시안이 나오면 이 표의 값만 교체하면 된다.
 */
export const FOOD_LABEL_POSITION: Record<string, { left: string; top: string }> = {
  // 월경기
  'dark-choco-m': { left: '19%', top: '1%' },
  'oyster-m': { left: '68%', top: '5%' },
  'beef-m': { left: '0%', top: '26%' },
  'pumpkin-m': { left: '30%', top: '41%' },
  'seaweed-m': { left: '69%', top: '41%' },
  // 난포기
  'broccoli-f': { left: '2%', top: '10%' },
  'spinach-f': { left: '52%', top: '0%' },
  'walnut-f': { left: '10%', top: '41%' },
  'tomato-f': { left: '40%', top: '41%' },
  'tofu-f': { left: '71%', top: '38%' },
  // 배란기
  'kale-o': { left: '49%', top: '0%' },
  'mackerel-o': { left: '5%', top: '13%' },
  'blueberry-o': { left: '0%', top: '43%' },
  'olive-oil-o': { left: '36%', top: '47%' },
  'almond-o': { left: '69%', top: '43%' },
  // 황체기 — Figma 좌표 환산
  'salmon-l': { left: '17.5%', top: '7.8%' },
  'banana-l': { left: '74.2%', top: '23.2%' },
  'sweet-potato-l': { left: '0%', top: '38.2%' },
  'herbal-tea-l': { left: '18.9%', top: '47.1%' },
  'avocado-l': { left: '45%', top: '49.8%' },
};
