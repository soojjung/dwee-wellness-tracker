// Blob 은 Storage bucket('media'), 메타데이터(경로/슬롯/텍스트)는 DB.
import type { MediaRepository } from '@/data/repositories/MediaRepository';
import {
  MAX_PHOTO_SLOTS,
  TEXT_ORDERS,
  TEXT_POSITIONS,
  isPhotoTransform,
  type PhotoCount,
  type PhotoSlot,
  type PhotoTransform,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';
import { supabase, requireUserId } from './client';
import { downloadWithCache, forgetCachedBlob, writeCachedBlob } from './blobCache';

const BUCKET = 'media';

// A new path per upload (not `${slot}.jpg` overwritten in place) so the
// on-device blob cache can trust that a path's content never changes.
function photoPath(userId: string, slot: PhotoSlot, ext: string): string {
  return `${userId}/home_photos/${slot}-${Date.now().toString(36)}.${ext}`;
}

function downloadBlob(path: string): Promise<Blob | null> {
  return downloadWithCache(path, async () => {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) return null;
    return data;
  });
}

async function fetchPhotoPath(userId: string, slot: PhotoSlot): Promise<string | null> {
  const { data: row } = await supabase
    .from('home_photos')
    .select('storage_path')
    .eq('user_id', userId)
    .eq('slot', slot)
    .maybeSingle();
  return (row as PhotoRow | null)?.storage_path ?? null;
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
  transform?: unknown;
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

  async getHomeDecor() {
    const userId = await requireUserId();
    const [settings, photoRows] = await Promise.all([
      fetchSettings(userId),
      supabase.from('home_photos').select('slot, storage_path, transform').eq('user_id', userId),
    ]);
    if (photoRows.error) throw photoRows.error;

    const photos: (Blob | null)[] = Array<Blob | null>(MAX_PHOTO_SLOTS).fill(null);
    const transforms: (PhotoTransform | null)[] = Array<PhotoTransform | null>(
      MAX_PHOTO_SLOTS,
    ).fill(null);
    await Promise.all(
      (photoRows.data as PhotoRow[]).map(async (row) => {
        if (!Number.isInteger(row.slot) || row.slot < 0 || row.slot >= MAX_PHOTO_SLOTS) return;
        transforms[row.slot] = isPhotoTransform(row.transform) ? row.transform : null;
        photos[row.slot] = await downloadBlob(row.storage_path);
      }),
    );

    const count = settings?.photo_count;
    return {
      photoCount: count === 1 || count === 2 || count === 4 ? count : null,
      photos,
      transforms,
      textPosition: isTextPosition(settings?.text_position) ? settings.text_position : null,
      mainText: settings?.main_text ?? '',
      subText: settings?.sub_text ?? '',
      textOrder: isTextOrder(settings?.text_order) ? settings.text_order : null,
    };
  },

  async getHomePhoto(slot: PhotoSlot) {
    const userId = await requireUserId();
    const path = await fetchPhotoPath(userId, slot);
    return path ? downloadBlob(path) : null;
  },

  async setHomePhoto(slot: PhotoSlot, blob: Blob) {
    const userId = await requireUserId();
    const previousPath = await fetchPhotoPath(userId, slot);
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
    await writeCachedBlob(path, blob);
    if (previousPath && previousPath !== path) {
      // Best effort: an orphaned object only costs storage, not correctness.
      await supabase.storage
        .from(BUCKET)
        .remove([previousPath])
        .catch(() => undefined);
      await forgetCachedBlob(previousPath);
    }
  },

  async clearHomePhoto(slot: PhotoSlot) {
    const userId = await requireUserId();
    const path = await fetchPhotoPath(userId, slot);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
      await forgetCachedBlob(path);
    }
    await supabase.from('home_photos').delete().eq('user_id', userId).eq('slot', slot);
  },

  async getPhotoTransform(slot: PhotoSlot) {
    const userId = await requireUserId();
    const { data } = await supabase
      .from('home_photos')
      .select('transform')
      .eq('user_id', userId)
      .eq('slot', slot)
      .maybeSingle();
    const raw = (data as { transform?: unknown } | null)?.transform;
    return isPhotoTransform(raw) ? raw : null;
  },

  async setPhotoTransform(slot: PhotoSlot, transform: PhotoTransform) {
    const userId = await requireUserId();
    // Requires a home_photos row to exist (photo must be uploaded first);
    // callers always upload the blob before persisting a transform.
    const { error } = await supabase
      .from('home_photos')
      .update({ transform })
      .eq('user_id', userId)
      .eq('slot', slot);
    if (error) throw error;
  },

  async clearPhotoTransform(slot: PhotoSlot) {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('home_photos')
      .update({ transform: null })
      .eq('user_id', userId)
      .eq('slot', slot);
    if (error) throw error;
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
