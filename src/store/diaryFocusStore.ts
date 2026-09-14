'use client';
import { create } from 'zustand';

export interface DiaryMonth {
  year: number;
  monthIndex: number;
}

// 다이어리 화면들이 공유하는 가벼운 UI 상태.
// - focusPing: BottomTabNav 가 log 탭을 누를 때 올리는 카운터. DiaryScreen 이 구독해
//   보이는 달을 오늘로 되돌리고 오늘 셀을 펄스시킨다. boolean 이 아니라 카운터인 건
//   연속 탭에도 애니메이션이 다시 돌게 하려는 것.
// - visibleMonth: 다이어리가 마지막으로 보여준 달. `/log/customize` 가 같은 달로
//   열리고, 돌아왔을 때도 그 달이 유지된다 (예전엔 둘 다 오늘 달로 리셋됐다).
//   새로고침이면 null → 오늘 달. 영속화하지 않는다.
// - focusPlacementId: 다이어리에서 스티커를 탭해 꾸미기로 넘어올 때 그 스티커를
//   바로 선택 상태로 열기 위한 1회용 값. 꾸미기 화면이 읽고 나면 지운다.
interface DiaryFocusState {
  focusPing: number;
  visibleMonth: DiaryMonth | null;
  focusPlacementId: string | null;
  pingToday: () => void;
  setVisibleMonth: (month: DiaryMonth) => void;
  setFocusPlacementId: (id: string | null) => void;
}

export const useDiaryFocusStore = create<DiaryFocusState>()((set) => ({
  focusPing: 0,
  visibleMonth: null,
  focusPlacementId: null,
  // 탭 탭 = "오늘로". 보이는 달도 함께 오늘로 돌려 두어야, 다른 탭에서 넘어오며
  // 새로 마운트되는 DiaryScreen 이 초기값으로 오늘 달을 읽는다.
  pingToday: () => set((s) => ({ focusPing: s.focusPing + 1, visibleMonth: currentMonth() })),
  setFocusPlacementId: (id) => set({ focusPlacementId: id }),
  setVisibleMonth: (month) =>
    set((s) =>
      s.visibleMonth?.year === month.year && s.visibleMonth.monthIndex === month.monthIndex
        ? s
        : { visibleMonth: { ...month } },
    ),
}));

export function currentMonth(): DiaryMonth {
  const now = new Date();
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}
