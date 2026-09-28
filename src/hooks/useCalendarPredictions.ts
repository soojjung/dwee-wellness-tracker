'use client';
import { useMemo } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { predictNextPeriod } from '@/domain/cycle/predictor';
import { calendarPredictions, type CalendarPredictions } from '@/domain/cycle/cellState';
import type { PeriodLog } from '@/types';

/**
 * 다이어리 달력에 얹을 다음 예상 생리·가임기. 마이페이지 "달력에 예측 표시"가 꺼져 있으면 null.
 * 홈 주간 스트립과 같은 계산(`calendarPredictions`)이라 두 화면의 표시가 어긋나지 않는다.
 */
export function useCalendarPredictions(periods: PeriodLog[]): CalendarPredictions | null {
  const settings = useSettingsStore((s) => s.settings);
  return useMemo(() => {
    if (!settings.showCalendarPredictions) return null;
    const { predictedDate, confidence } = predictNextPeriod(periods, settings);
    return calendarPredictions(predictedDate, settings.averagePeriodLength, confidence);
  }, [periods, settings]);
}
