import type { DiarySticker, StickerRatio, StickerSource } from '@/types';
import type {
  DiaryStickerRepository,
  NewDiaryStickerInput,
} from '@/data/repositories/DiaryStickerRepository';
import { supabase, requireUserId } from './client';

const BUCKET = 'media';

interface StickerRow {
  id: string;
  user_id: string;
  storage_path: string;
  ratio: StickerRatio;
  source: StickerSource;
  created_at: string;
}

function rowToSticker(row: StickerRow): DiarySticker {
  return {
    id: row.id,
    storageRef: row.storage_path,
    ratio: row.ratio,
    source: row.source,
    createdAt: row.created_at,
  };
}

function stickerPath(userId: string, id: string, ext: string): string {
  return `${userId}/diary_stickers/${id}.${ext}`;
}

async function uploadBlob(path: string, blob: Blob): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || 'image/png' });
  if (error) throw error;
}

async function downloadBlob(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) return null;
  return data;
}

export const supabaseDiaryStickerAdapter: DiaryStickerRepository = {
  async list() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('diary_stickers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as StickerRow[]).map(rowToSticker);
  },

  async getBlob(sticker: DiarySticker) {
    return downloadBlob(sticker.storageRef);
  },

  async add(input: NewDiaryStickerInput) {
    const userId = await requireUserId();
    const id = crypto.randomUUID();
    const ext = input.blob.type === 'image/jpeg' ? 'jpg' : 'png';
    const path = stickerPath(userId, id, ext);
    await uploadBlob(path, input.blob);
    const insert = {
      id,
      user_id: userId,
      storage_path: path,
      ratio: input.ratio,
      source: input.source,
    };
    const { data, error } = await supabase
      .from('diary_stickers')
      .insert(insert)
      .select('*')
      .single();
    if (error) throw error;
    return rowToSticker(data as StickerRow);
  },

  async remove(id: string) {
    const userId = await requireUserId();
    const { data: row } = await supabase
      .from('diary_stickers')
      .select('storage_path')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (row) {
      await supabase.storage.from(BUCKET).remove([(row as { storage_path: string }).storage_path]);
    }
    await supabase.from('diary_stickers').delete().eq('id', id);
  },
};
