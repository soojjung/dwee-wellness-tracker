import type { DiaryStickerPlacement } from '@/types';
import type {
  DiaryStickerPlacementRepository,
  NewDiaryStickerPlacementInput,
} from '@/data/repositories/DiaryStickerPlacementRepository';
import { supabase, requireUserId } from './client';

interface PlacementRow {
  id: string;
  user_id: string;
  sticker_id: string;
  year: number;
  month_index: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  created_at: string;
  updated_at: string;
}

function rowToPlacement(row: PlacementRow): DiaryStickerPlacement {
  return {
    id: row.id,
    stickerId: row.sticker_id,
    year: row.year,
    monthIndex: row.month_index,
    x: row.x,
    y: row.y,
    scale: row.scale,
    rotation: row.rotation,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseDiaryStickerPlacementAdapter: DiaryStickerPlacementRepository = {
  async listByMonth(year, monthIndex) {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('diary_sticker_placements')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month_index', monthIndex);
    if (error) throw error;
    return (data as PlacementRow[]).map(rowToPlacement);
  },

  async add(input: NewDiaryStickerPlacementInput) {
    const userId = await requireUserId();
    const insert = {
      user_id: userId,
      sticker_id: input.stickerId,
      year: input.year,
      month_index: input.monthIndex,
      x: input.x,
      y: input.y,
      scale: input.scale,
      rotation: input.rotation,
    };
    const { data, error } = await supabase
      .from('diary_sticker_placements')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return rowToPlacement(data as PlacementRow);
  },

  async update(id, patch) {
    const row: Partial<PlacementRow> = { updated_at: new Date().toISOString() };
    if (patch.stickerId !== undefined) row.sticker_id = patch.stickerId;
    if (patch.year !== undefined) row.year = patch.year;
    if (patch.monthIndex !== undefined) row.month_index = patch.monthIndex;
    if (patch.x !== undefined) row.x = patch.x;
    if (patch.y !== undefined) row.y = patch.y;
    if (patch.scale !== undefined) row.scale = patch.scale;
    if (patch.rotation !== undefined) row.rotation = patch.rotation;
    const { data, error } = await supabase
      .from('diary_sticker_placements')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data ? rowToPlacement(data as PlacementRow) : null;
  },

  async remove(id) {
    const { error } = await supabase
      .from('diary_sticker_placements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
