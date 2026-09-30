'use client';
import { useState } from 'react';
import type {
  Appetite,
  Bloating,
  ConditionSelection,
  DailyConditionLog,
  Energy,
  Exercise,
  Mood,
  Pain,
  Skin,
  Sleep,
} from '@/types';

interface ConditionSelectionState {
  mood: Mood | null;
  energy: Energy | null;
  pain: Pain | null;
  bloating: Bloating | null;
  appetite: Appetite | null;
  skin: Skin | null;
  sleep: Sleep | null;
  exercise: Exercise | null;
}

interface UseConditionSelectionResult extends ConditionSelectionState {
  setMood: (v: Mood) => void;
  setEnergy: (v: Energy) => void;
  setPain: (v: Pain) => void;
  setBloating: (v: Bloating) => void;
  setAppetite: (v: Appetite) => void;
  setSkin: (v: Skin) => void;
  setSleep: (v: Sleep) => void;
  setExercise: (v: Exercise) => void;
  /** Re-seeds every field from a log that arrived after mount (e.g. once an
   * async hydrate resolves). Overwrites whatever is currently picked. */
  seed: (log: DailyConditionLog | null) => void;
  /** `undefined` when nothing is picked — matches `NewConditionInput`'s
   * "only send what changed" contract for `conditionStore.upsert`. */
  toSelection: () => ConditionSelection | undefined;
}

function toState(log: DailyConditionLog | null): ConditionSelectionState {
  return {
    mood: log?.mood ?? null,
    energy: log?.energy ?? null,
    pain: log?.pain ?? null,
    bloating: log?.bloating ?? null,
    appetite: log?.appetite ?? null,
    skin: log?.skin ?? null,
    sleep: log?.sleep ?? null,
    exercise: log?.exercise ?? null,
  };
}

/** Local edit state for the optional condition chips shared by sheets that
 * embed `EventConditionSection` (currently `PeriodRecordSheet`). Seeds from
 * an existing log if one is passed in, and exposes a `toSelection()`
 * snapshot for saving. */
export function useConditionSelection(
  initial: DailyConditionLog | null,
): UseConditionSelectionResult {
  const [state, setState] = useState<ConditionSelectionState>(() => toState(initial));

  function toSelection(): ConditionSelection | undefined {
    const { mood, energy, pain, bloating, appetite, skin, sleep, exercise } = state;
    if (!mood && !energy && !pain && !bloating && !appetite && !skin && !sleep && !exercise) {
      return undefined;
    }
    return {
      ...(mood ? { mood } : {}),
      ...(energy ? { energy } : {}),
      ...(pain ? { pain } : {}),
      ...(bloating ? { bloating } : {}),
      ...(appetite ? { appetite } : {}),
      ...(skin ? { skin } : {}),
      ...(sleep ? { sleep } : {}),
      ...(exercise ? { exercise } : {}),
    };
  }

  return {
    ...state,
    setMood: (v) => setState((s) => ({ ...s, mood: v })),
    setEnergy: (v) => setState((s) => ({ ...s, energy: v })),
    setPain: (v) => setState((s) => ({ ...s, pain: v })),
    setBloating: (v) => setState((s) => ({ ...s, bloating: v })),
    setAppetite: (v) => setState((s) => ({ ...s, appetite: v })),
    setSkin: (v) => setState((s) => ({ ...s, skin: v })),
    setSleep: (v) => setState((s) => ({ ...s, sleep: v })),
    setExercise: (v) => setState((s) => ({ ...s, exercise: v })),
    seed: (log) => setState(toState(log)),
    toSelection,
  };
}
