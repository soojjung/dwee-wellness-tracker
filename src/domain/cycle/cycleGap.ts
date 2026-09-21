/**
 * 두 생리 시작일 사이의 간격(일)을 "주기"로 셀 수 있는 범위.
 *
 * 범위 밖 간격은 실제 주기라기보다 기록이 어긋난 흔적일 가능성이 크다 — 15일 미만은 같은
 * 생리를 나눠 적었거나 연달아 입력한 경우, 60일 초과는 중간 기록이 빠진 경우. 그래서 평균·
 * 상태 판정·차트 어디에서도 세지 않는다. 의학적 기준이 아니라 입력 이상치를 거르는 선이다.
 *
 * 평균(`aggregate.ts`), 상태 판정(`status.ts`), 차트 축(`chartScale.ts`), 리포트 화면이 전부
 * 이 값을 쓴다 — 한 곳이라도 다른 선을 쓰면 같은 기록을 두고 화면마다 말이 달라진다.
 */
export const CYCLE_GAP_MIN_DAYS = 15;
export const CYCLE_GAP_MAX_DAYS = 60;

export function isCountableCycleGap(days: number): boolean {
  return days >= CYCLE_GAP_MIN_DAYS && days <= CYCLE_GAP_MAX_DAYS;
}
