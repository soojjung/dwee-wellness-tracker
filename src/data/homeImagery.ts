export const ACTIVITY_CATEGORY_KEYS = ['selfcare', 'exercise', 'emotion'] as const;
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
};

const FOOD_VISUAL: Record<string, Visual> = {
  'warm-soup-m': { emoji: '🍲', bg: 'bg-brand-pink50' },
  'iron-rich-m': { emoji: '🥬', bg: 'bg-brand-pink50' },
  'ginger-brew-m': { emoji: '🫖', bg: 'bg-brand-pink50' },
  'whole-grain-m': { emoji: '🌾', bg: 'bg-brand-pink50' },
  'fresh-leafy-f': { emoji: '🥗', bg: 'bg-brand-pink50' },
  'ferment-f': { emoji: '🥒', bg: 'bg-brand-pink50' },
  'citrus-berries-f': { emoji: '🍊', bg: 'bg-brand-pink50' },
  'protein-simple-f': { emoji: '🥚', bg: 'bg-brand-pink50' },
  'avocado-o': { emoji: '🥑', bg: 'bg-brand-pink50' },
  'bright-fruit-o': { emoji: '🫐', bg: 'bg-brand-pink50' },
  'nuts-seeds-o': { emoji: '🥜', bg: 'bg-brand-pink50' },
  'hydration-o': { emoji: '💧', bg: 'bg-brand-pink50' },
  'dark-choco-l': { emoji: '🍫', bg: 'bg-brand-pink50' },
  'sweet-potato-l': { emoji: '🍠', bg: 'bg-brand-pink50' },
  'fiber-banana-l': { emoji: '🍌', bg: 'bg-brand-pink50' },
  'calm-tea-l': { emoji: '🌼', bg: 'bg-brand-pink50' },
  'cooked-warm-u': { emoji: '🍚', bg: 'bg-brand-pink50' },
  'fresh-simple-u': { emoji: '🍎', bg: 'bg-brand-pink50' },
  'hydration-u': { emoji: '💧', bg: 'bg-brand-pink50' },
  'vegetables-u': { emoji: '🥦', bg: 'bg-brand-pink50' },
};
