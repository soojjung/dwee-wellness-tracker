import type { Page } from '@playwright/test';

/**
 * 스냅샷 baseline 이 실행 날짜에 따라 깨지지 않도록 시계를 한 시점에 고정한다.
 *
 * 앱은 `todayISO()` → `new Date()` 로 오늘을 구하고, `seedForPhase` 도 오늘 기준
 * 상대 날짜로 기록을 만든다. 그래서 이 한 곳만 고정하면 날짜 헤딩·주간 스트립·
 * 캘린더·D-day 가 전부 결정적으로 렌더된다.
 *
 * 2026-05-13(수) 12:00 KST 로 잡은 이유:
 * - 월 중순이라 주간 스트립이 달 경계를 걸치지 않는다
 * - 주 중간이라 요일 정렬이 한쪽으로 쏠리지 않는다
 * - 정오라 자정 롤오버로 날짜가 하루 밀릴 여지가 없다
 *
 * 타임존은 `playwright.config.ts` 에서 Asia/Seoul 로 고정한다 — 같은 순간이라도
 * 실행 머신의 타임존이 다르면 렌더되는 날짜가 달라지기 때문.
 */
export const FROZEN_NOW = new Date('2026-05-13T03:00:00.000Z');

/**
 * 반드시 첫 `page.goto` 이전에 호출해야 페이지가 고정된 시계로 뜬다.
 *
 * `setFixedTime` 은 `Date.now()` / `new Date()` 만 고정하고 타이머는 그대로
 * 돌려보낸다. `clock.install()` 과 달리 토스트 자동 닫힘 같은 `setTimeout` 이
 * 멈추지 않으므로, 화면 동작은 평소와 같고 날짜만 결정적이다.
 */
export async function freezeClock(page: Page) {
  await page.clock.setFixedTime(FROZEN_NOW);
}
