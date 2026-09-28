/** 다이어리에 공휴일을 얹을 수 있는 나라. 설정값과 도메인 계산이 함께 쓴다. */
export type HolidayCountry = 'KR' | 'US';

/** 화면·요약 표시 순서. 언어 목록과 맞춰 영어권(US) 먼저. */
export const HOLIDAY_COUNTRIES: readonly HolidayCountry[] = ['US', 'KR'];
