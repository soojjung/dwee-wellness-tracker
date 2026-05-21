// 개발/QA용 시드 데이터.
// 사용 시 NODE_ENV === 'development' 게이트 통과 후만 호출. 프로덕션 번들 동적 import 로 제외.
import { periodRepo, conditionRepo, settingsRepo, ensureMigrations, resetAllUserData } from '@/data';
import { todayISO, addDaysISO } from '@/lib/date';
import type {
  Mood,
  Energy,
  Pain,
  Bloating,
  Appetite,
  Skin,
} from '@/types';

// 가장 최근부터 과거 순. 합산 ~6개월치.
const PERIOD_DAYS_AGO = [12, 42, 69, 98, 127, 156] as const;
const PERIOD_DURATION = 5;
const CONDITION_LOOKBACK_DAYS = 30;
const MOOD_DIP_OFFSETS = [1, 2, 3] as const; // 생리 시작 N일 전

interface ConditionShape {
  mood?: Mood;
  energy?: Energy;
  pain?: Pain;
  bloating?: Bloating;
  appetite?: Appetite;
  skin?: Skin;
}

function shapeForDate(date: string, periodStarts: string[]): ConditionShape {
  // 패턴:
  // - period 시작일/+1 일: pain='moderate', mood='neutral'
  // - period 시작 -1,-2,-3 일: mood='down' 또는 'low' (moodTrendRule 트리거)
  // - 그 외: 가벼운 변주
  for (const start of periodStarts) {
    if (date === start || date === addDaysISO(start, 1)) {
      return { mood: 'neutral', energy: 'low', pain: 'moderate', bloating: 'mild', appetite: 'normal', skin: 'oily' };
    }
  }
  for (const start of periodStarts) {
    for (const offset of MOOD_DIP_OFFSETS) {
      if (date === addDaysISO(start, -offset)) {
        return {
          mood: offset === 1 ? 'low' : 'down',
          energy: 'low',
          pain: 'mild',
          bloating: 'mild',
          appetite: 'low',
          skin: 'breakout',
        };
      }
    }
  }
  // 기본 변주 (날짜 마지막 자리로 가벼운 결정성)
  const last = Number(date.slice(-1));
  const moodOptions: Mood[] = ['great', 'good', 'neutral'];
  const energyOptions: Energy[] = ['high', 'medium', 'low'];
  return {
    mood: moodOptions[last % moodOptions.length],
    energy: energyOptions[last % energyOptions.length],
    pain: 'none',
    bloating: 'none',
    appetite: 'normal',
    skin: 'clear',
  };
}

export async function seedDevData(): Promise<void> {
  await ensureMigrations();
  // 기존 데이터를 덮어쓰지 않도록 먼저 초기화. (settings/periods/conditions/media)
  await resetAllUserData();
  // migrations 는 schemaVersion 이 살아있어 재실행 안 됨. settings 는 default 로 재시작.

  const today = todayISO();
  const periodStarts = PERIOD_DAYS_AGO.map((d) => addDaysISO(today, -d));
  // 오래된 순으로 add (정렬은 list 시 startDate asc 로 보장됨).
  const ordered = [...periodStarts].reverse();
  for (const startDate of ordered) {
    await periodRepo.add({ startDate, endDate: addDaysISO(startDate, PERIOD_DURATION - 1) });
  }

  for (let i = 0; i < CONDITION_LOOKBACK_DAYS; i += 1) {
    const date = addDaysISO(today, -i);
    const shape = shapeForDate(date, periodStarts);
    await conditionRepo.upsert({ date, ...shape });
  }

  await settingsRepo.update({
    averageCycleLength: 28,
    averagePeriodLength: 5,
    onboardingCompleted: true,
  });
}
