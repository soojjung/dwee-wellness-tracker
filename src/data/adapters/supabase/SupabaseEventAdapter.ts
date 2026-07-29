import type { EventLog } from '@/types';
import type {
  EventRepository,
  NewEventInput,
} from '@/data/repositories/EventRepository';
import { supabase, requireUserId } from './client';

interface EventRow {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  title: string;
  memo: string | null;
  category_id: string;
  has_period_mark: boolean;
  linked_period_id: string | null;
  created_at: string;
  updated_at: string;
}

function rowToLog(row: EventRow): EventLog {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    title: row.title,
    memo: row.memo ?? '',
    categoryId: row.category_id,
    hasPeriodMark: row.has_period_mark,
    ...(row.linked_period_id ? { linkedPeriodId: row.linked_period_id } : {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseEventAdapter: EventRepository = {
  async list() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('event_logs')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    if (error) throw error;
    return (data as EventRow[]).map(rowToLog);
  },

  async add(input: NewEventInput) {
    const userId = await requireUserId();
    const insert = {
      user_id: userId,
      start_date: input.startDate,
      end_date: input.endDate,
      title: input.title,
      memo: input.memo || null,
      category_id: input.categoryId,
      has_period_mark: input.hasPeriodMark ?? false,
      linked_period_id: input.linkedPeriodId ?? null,
    };
    const { data, error } = await supabase
      .from('event_logs')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return rowToLog(data as EventRow);
  },

  async update(id, patch) {
    const row: Partial<EventRow> = { updated_at: new Date().toISOString() };
    if (patch.startDate !== undefined) row.start_date = patch.startDate;
    if (patch.endDate !== undefined) row.end_date = patch.endDate;
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.memo !== undefined) row.memo = patch.memo || null;
    if (patch.categoryId !== undefined) row.category_id = patch.categoryId;
    if (patch.hasPeriodMark !== undefined) row.has_period_mark = patch.hasPeriodMark;
    if (patch.linkedPeriodId !== undefined) row.linked_period_id = patch.linkedPeriodId ?? null;
    const { data, error } = await supabase
      .from('event_logs')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data ? rowToLog(data as EventRow) : null;
  },

  async remove(id) {
    const { error } = await supabase.from('event_logs').delete().eq('id', id);
    if (error) throw error;
  },
};
