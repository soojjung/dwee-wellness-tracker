import type { Mood, Energy, Pain, Bloating, Appetite, Skin, Sleep, Exercise } from '@/types';

export const MOOD_VALUES: readonly Mood[] = ['great', 'good', 'neutral', 'down', 'low'];
export const ENERGY_VALUES: readonly Energy[] = ['high', 'medium', 'low'];
export const PAIN_VALUES: readonly Pain[] = ['none', 'mild', 'moderate', 'severe'];
export const BLOATING_VALUES: readonly Bloating[] = ['none', 'mild', 'severe'];
export const APPETITE_VALUES: readonly Appetite[] = ['low', 'normal', 'high'];
export const SKIN_VALUES: readonly Skin[] = ['clear', 'oily', 'dry', 'breakout'];
export const SLEEP_VALUES: readonly Sleep[] = ['good', 'fair', 'poor'];
export const EXERCISE_VALUES: readonly Exercise[] = ['none', 'light', 'active'];
