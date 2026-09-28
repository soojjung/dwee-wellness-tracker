export interface EventLog {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  memo: string;
  categoryId: string;
  /**
   * 일정 시트의 생리 토글(R4-10, 2026-09-28 제거)이 남긴 값. 앱은 더 이상 읽거나 쓰지 않지만
   * 기존 데이터(`event_logs.has_period_mark` / `linked_period_id`, 0007) 때문에 필드와 DB
   * 컬럼을 남겨 둔다. 지우려면 컬럼 drop 마이그레이션과 어댑터 매핑을 함께 정리할 것.
   */
  hasPeriodMark: boolean;
  /** 위와 같음 — 토글이 켜졌을 때 자동 생성된 PeriodLog 의 id. */
  linkedPeriodId?: string;
  createdAt: string;
  updatedAt: string;
}
