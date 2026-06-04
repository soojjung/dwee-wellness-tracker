import type { PeriodLog } from '@/types';
import type { PeriodRepository, NewPeriodInput } from '@/data/repositories/PeriodRepository';
import { supabase, requireUserId } from './client';

interface PeriodRow {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

function rowToLog(row: PeriodRow): PeriodLog {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    createdAt: row.created_at,
  };
}

export const supabasePeriodAdapter: PeriodRepository = {
  async list() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('period_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    if (error) throw error;
    return (data as PeriodRow[]).map(rowToLog);
  },

  async add(input: NewPeriodInput) {
    const userId = await requireUserId();
    const insert = {
      user_id: userId,
      start_date: input.startDate,
      end_date: input.endDate ?? null,
    };
    // (user_id, start_date) unique → 같은 날 재기록은 upsert 로 처리
    const { data, error } = await supabase
      .from('period_logs')
      .upsert(insert, { onConflict: 'user_id,start_date' })
      .select('*')
      .single();
    if (error) throw error;
    return rowToLog(data as PeriodRow);
  },

  async update(id, patch) {
    const row: Partial<PeriodRow> = {};
    if (patch.startDate !== undefined) row.start_date = patch.startDate;
    if (patch.endDate !== undefined) row.end_date = patch.endDate ?? null;
    const { data, error } = await supabase
      .from('period_logs')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data ? rowToLog(data as PeriodRow) : null;
  },

  async remove(id) {
    const { error } = await supabase.from('period_logs').delete().eq('id', id);
    if (error) throw error;
  },
};
