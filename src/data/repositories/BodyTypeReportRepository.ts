import type { BodyTypeReport } from '@/types';

/**
 * 체형 리딩 결과 보관소. 최신 결과 하나만 들고 있으면 되므로 목록이 없다 —
 * 다시 진단하면 이전 결과를 덮어쓴다.
 */
export interface BodyTypeReportRepository {
  get(): Promise<BodyTypeReport | null>;
  save(report: BodyTypeReport): Promise<void>;
  clear(): Promise<void>;
}
