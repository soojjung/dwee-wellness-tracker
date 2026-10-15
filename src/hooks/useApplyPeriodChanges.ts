'use client';
import { usePeriodStore } from '@/store/periodStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { PeriodChange } from '@/domain/cycle/periodEdit';

/**
 * 생리 시트들의 제출 결과(`PeriodChange[]`)를 저장한다. 반영 순서(삭제 → 수정 → 추가)를
 * 여기 한 곳에 둔다 — 추가가 먼저 가면 지울 기록과
 * 겹쳐 `reconcileForNewStart` 가 엉뚱한 기록을 닫을 수 있다.
 */
export function useApplyPeriodChanges() {
  const addPeriod = usePeriodStore((s) => s.add);
  const updatePeriod = usePeriodStore((s) => s.update);
  const removePeriod = usePeriodStore((s) => s.remove);
  const onboardingCompleted = useSettingsStore((s) => s.settings.onboardingCompleted);
  const updateSettings = useSettingsStore((s) => s.update);

  return async function applyPeriodChanges(changes: PeriodChange[]) {
    for (const c of changes) {
      if (c.kind === 'remove') await removePeriod(c.id);
    }
    for (const c of changes) {
      if (c.kind === 'update') {
        await updatePeriod(c.id, { startDate: c.startDate, endDate: c.endDate });
      }
    }
    for (const c of changes) {
      if (c.kind === 'add') {
        await addPeriod({ startDate: c.startDate, endDate: c.endDate });
      }
    }
    if (changes.length > 0 && !onboardingCompleted) {
      await updateSettings({ onboardingCompleted: true });
    }
  };
}
