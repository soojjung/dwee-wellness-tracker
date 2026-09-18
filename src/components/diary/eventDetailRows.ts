import type { Dictionary } from '@/i18n';
import type { DailyConditionLog } from '@/types';

export interface ConditionRow {
  label: string;
  value: string;
}

// 편집 시트의 EventConditionSection 과 같은 순서. 값이 있는 항목만 보여 준다.
export function conditionRowsOf(c: DailyConditionLog | null, t: Dictionary): ConditionRow[] {
  if (!c) return [];
  const rows: ConditionRow[] = [];
  if (c.mood) rows.push({ label: t.log.todayMood, value: t.condition.mood[c.mood] });
  if (c.energy) rows.push({ label: t.log.todayEnergy, value: t.condition.energy[c.energy] });
  if (c.pain) rows.push({ label: t.log.todayPain, value: t.condition.pain[c.pain] });
  if (c.bloating)
    rows.push({ label: t.log.todayBloating, value: t.condition.bloating[c.bloating] });
  if (c.appetite)
    rows.push({ label: t.log.todayAppetite, value: t.condition.appetite[c.appetite] });
  if (c.skin) rows.push({ label: t.log.todaySkin, value: t.condition.skin[c.skin] });
  return rows;
}
