export type Mood = 'great' | 'good' | 'neutral' | 'down' | 'low';
export type Energy = 'high' | 'medium' | 'low';
export type Pain = 'none' | 'mild' | 'moderate' | 'severe';
export type Bloating = 'none' | 'mild' | 'severe';
export type Appetite = 'low' | 'normal' | 'high';
export type Skin = 'clear' | 'oily' | 'dry' | 'breakout';
export type Sleep = 'good' | 'fair' | 'poor';
export type Exercise = 'none' | 'light' | 'active';

export interface DailyConditionLog {
  id: string;
  date: string;
  mood?: Mood;
  energy?: Energy;
  pain?: Pain;
  bloating?: Bloating;
  appetite?: Appetite;
  skin?: Skin;
  sleep?: Sleep;
  exercise?: Exercise;
  memo?: string;
  createdAt: string;
}

/** Subset of `DailyConditionLog` a form can set without asserting a full
 * log — used by `EventConditionSection` and anything that embeds it
 * (`EventFormSheet`, `PeriodRecordSheet`). Only present keys are meant to be
 * written; an empty object means "nothing picked". */
export type ConditionSelection = Partial<
  Pick<
    DailyConditionLog,
    'mood' | 'energy' | 'pain' | 'bloating' | 'appetite' | 'skin' | 'sleep' | 'exercise'
  >
>;
