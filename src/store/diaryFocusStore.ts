'use client';
import { create } from 'zustand';

// Cross-component ping for "focus today" — BottomTabNav fires it on log-tab
// tap, DiaryScreen subscribes to reset the visible month to today's month and
// pulse the today cell. Counter, not a boolean, so consecutive taps re-trigger
// the animation without needing a manual reset.
interface DiaryFocusState {
  focusPing: number;
  pingToday: () => void;
}

export const useDiaryFocusStore = create<DiaryFocusState>()((set) => ({
  focusPing: 0,
  pingToday: () => set((s) => ({ focusPing: s.focusPing + 1 })),
}));
