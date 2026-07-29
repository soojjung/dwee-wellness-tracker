import type { EventCategory, ColorPaletteId } from '@/types';
import type {
  EventCategoryRepository,
  NewEventCategoryInput,
} from '@/data/repositories/EventCategoryRepository';
import { supabase, requireUserId } from './client';

interface EventCategoryRow {
  id: string;
  user_id: string;
  name: string;
  color_id: ColorPaletteId;
  is_built_in: boolean;
  order: number;
  created_at: string;
}

function rowToCategory(row: EventCategoryRow): EventCategory {
  return {
    id: row.id,
    name: row.name,
    colorId: row.color_id,
    isBuiltIn: row.is_built_in,
    order: row.order,
    createdAt: row.created_at,
  };
}

export const supabaseEventCategoryAdapter: EventCategoryRepository = {
  async list() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });
    if (error) throw error;
    return (data as EventCategoryRow[]).map(rowToCategory);
  },

  async add(input: NewEventCategoryInput) {
    const userId = await requireUserId();
    const insert = {
      user_id: userId,
      name: input.name,
      color_id: input.colorId,
      is_built_in: input.isBuiltIn ?? false,
      order: input.order ?? 0,
    };
    const { data, error } = await supabase
      .from('event_categories')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return rowToCategory(data as EventCategoryRow);
  },

  async update(id, patch) {
    const row: Partial<EventCategoryRow> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.colorId !== undefined) row.color_id = patch.colorId;
    if (patch.isBuiltIn !== undefined) row.is_built_in = patch.isBuiltIn;
    if (patch.order !== undefined) row.order = patch.order;
    const { data, error } = await supabase
      .from('event_categories')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data ? rowToCategory(data as EventCategoryRow) : null;
  },

  async remove(id) {
    const { error } = await supabase.from('event_categories').delete().eq('id', id);
    if (error) throw error;
  },
};
