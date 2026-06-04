import type { DailyConditionLog, Mood, Energy, Pain, Bloating, Appetite, Skin } from '@/types';
import type {
  ConditionRepository,
  NewConditionInput,
} from '@/data/repositories/ConditionRepository';
import { supabase, requireUserId } from './client';

interface ConditionRow {
  id: string;
  user_id: string;
  date: string;
  mood: Mood | null;
  energy: Energy | null;
  pain: Pain | null;
  bloating: Bloating | null;
  appetite: Appetite | null;
  skin: Skin | null;
  memo: string | null;
  created_at: string;
}

function rowToLog(row: ConditionRow): DailyConditionLog {
  const log: DailyConditionLog = { id: row.id, date: row.date, createdAt: row.created_at };
  if (row.mood) log.mood = row.mood;
  if (row.energy) log.energy = row.energy;
  if (row.pain) log.pain = row.pain;
  if (row.bloating) log.bloating = row.bloating;
  if (row.appetite) log.appetite = row.appetite;
  if (row.skin) log.skin = row.skin;
  if (row.memo) log.memo = row.memo;
  return log;
}

export const supabaseConditionAdapter: ConditionRepository = {
  async getByDate(date) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('condition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToLog(data as ConditionRow) : null;
  },

  async upsert(input: NewConditionInput) {
    const userId = await requireUserId();
    const row = {
      user_id: userId,
      date: input.date,
      mood: input.mood ?? null,
      energy: input.energy ?? null,
      pain: input.pain ?? null,
      bloating: input.bloating ?? null,
      appetite: input.appetite ?? null,
      skin: input.skin ?? null,
      memo: input.memo ?? null,
    };
    const { data, error } = await supabase
      .from('condition_logs')
      .upsert(row, { onConflict: 'user_id,date' })
      .select('*')
      .single();
    if (error) throw error;
    return rowToLog(data as ConditionRow);
  },

  async range(fromDate, toDate) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('condition_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return (data as ConditionRow[]).map(rowToLog);
  },
};
