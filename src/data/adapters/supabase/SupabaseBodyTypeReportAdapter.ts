import type { BodyTypeReport } from '@/types';
import type { BodyTypeReportRepository } from '@/data/repositories/BodyTypeReportRepository';
import { supabase, requireUserId } from './client';

interface BodyTypeReportRow {
  user_id: string;
  primary_type: string;
  report: BodyTypeReport;
  updated_at: string;
}

export const supabaseBodyTypeReportAdapter: BodyTypeReportRepository = {
  async get() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('body_type_reports')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? (data as BodyTypeReportRow).report : null;
  },

  async save(report) {
    const userId = await requireUserId();
    // 사용자당 한 행이라 upsert 로 덮어쓴다. primary_type 은 jsonb 를 파싱하지
    // 않고도 타입만 읽을 수 있게 따로 둔 사본이다.
    const { error } = await supabase.from('body_type_reports').upsert(
      {
        user_id: userId,
        primary_type: report.summary.primaryType,
        report,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    if (error) throw error;
  },

  async clear() {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('body_type_reports')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  },
};
