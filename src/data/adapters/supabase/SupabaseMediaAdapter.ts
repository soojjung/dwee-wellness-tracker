// Blob 은 Storage bucket('media'), 메타데이터(경로/슬롯/텍스트)는 DB.
import type { MediaRepository } from '@/data/repositories/MediaRepository';
import {
  TEXT_ORDERS,
  TEXT_POSITIONS,
  type PhotoCount,
  type PhotoSlot,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';
import { supabase, requireUserId } from './client';

const BUCKET = 'media';

function photoPath(userId: string, slot: PhotoSlot, ext: string): string {
  return `${userId}/home_photos/${slot}.${ext}`;
}

async function downloadBlob(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error) return null;
  return data;
}

async function uploadBlob(path: string, blob: Blob): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg' });
  if (error) throw error;
}

function isTextPosition(v: unknown): v is TextPosition {
  return typeof v === 'string' && (TEXT_POSITIONS as readonly string[]).includes(v);
}

function isTextOrder(v: unknown): v is TextOrder {
  return typeof v === 'string' && (TEXT_ORDERS as readonly string[]).includes(v);
}

interface PhotoRow {
  user_id: string;
  slot: number;
  storage_path: string;
}

interface SettingsRow {
  user_id: string;
  photo_count: number | null;
  text_position: string | null;
  text_order: string | null;
  main_text: string | null;
  sub_text: string | null;
}

async function upsertSettings(userId: string, patch: Partial<Omit<SettingsRow, 'user_id'>>) {
  const { error } = await supabase
    .from('home_decor_settings')
    .upsert({ user_id: userId, ...patch }, { onConflict: 'user_id' });
  if (error) throw error;
}

async function fetchSettings(userId: string): Promise<SettingsRow | null> {
  const { data } = await supabase
    .from('home_decor_settings')
    .select('user_id, photo_count, text_position, text_order, main_text, sub_text')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as SettingsRow | null) ?? null;
}

export const supabaseMediaAdapter: MediaRepository = {
  async getPhotoCount() {
    const userId = await requireUserId();
    const row = await fetchSettings(userId);
    const v = row?.photo_count;
    if (v === 1 || v === 2 || v === 4) return v;
    return null;
  },

  async setPhotoCount(count: PhotoCount) {
    const userId = await requireUserId();
    await upsertSettings(userId, { photo_count: count });
  },

  async getHomePhoto(slot: PhotoSlot) {
    const userId = await requireUserId();
    const { data: row } = await supabase
      .from('home_photos')
      .select('storage_path')
      .eq('user_id', userId)
      .eq('slot', slot)
      .maybeSingle();
    if (!row) return null;
    return downloadBlob((row as PhotoRow).storage_path);
  },

  async setHomePhoto(slot: PhotoSlot, blob: Blob) {
    const userId = await requireUserId();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = photoPath(userId, slot, ext);
    await uploadBlob(path, blob);
    const { error } = await supabase
      .from('home_photos')
      .upsert(
        { user_id: userId, slot, storage_path: path },
        { onConflict: 'user_id,slot' },
      );
    if (error) throw error;
  },

  async clearHomePhoto(slot: PhotoSlot) {
    const userId = await requireUserId();
    const { data: row } = await supabase
      .from('home_photos')
      .select('storage_path')
      .eq('user_id', userId)
      .eq('slot', slot)
      .maybeSingle();
    if (row) await supabase.storage.from(BUCKET).remove([(row as PhotoRow).storage_path]);
    await supabase.from('home_photos').delete().eq('user_id', userId).eq('slot', slot);
  },

  async getTextPosition() {
    const userId = await requireUserId();
    const row = await fetchSettings(userId);
    return isTextPosition(row?.text_position) ? row.text_position : null;
  },

  async setTextPosition(position: TextPosition) {
    const userId = await requireUserId();
    await upsertSettings(userId, { text_position: position });
  },

  async getMainText() {
    const userId = await requireUserId();
    const row = await fetchSettings(userId);
    return row?.main_text ?? '';
  },

  async setMainText(text: string) {
    const userId = await requireUserId();
    await upsertSettings(userId, { main_text: text });
  },

  async getSubText() {
    const userId = await requireUserId();
    const row = await fetchSettings(userId);
    return row?.sub_text ?? '';
  },

  async setSubText(text: string) {
    const userId = await requireUserId();
    await upsertSettings(userId, { sub_text: text });
  },

  async getTextOrder() {
    const userId = await requireUserId();
    const row = await fetchSettings(userId);
    return isTextOrder(row?.text_order) ? row.text_order : null;
  },

  async setTextOrder(order: TextOrder) {
    const userId = await requireUserId();
    await upsertSettings(userId, { text_order: order });
  },
};
