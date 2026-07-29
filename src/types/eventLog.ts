export interface EventLog {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  memo: string;
  categoryId: string;
  hasPeriodMark: boolean;
  /** id of the PeriodLog auto-created when the 생리 toggle was enabled. */
  linkedPeriodId?: string;
  createdAt: string;
  updatedAt: string;
}
