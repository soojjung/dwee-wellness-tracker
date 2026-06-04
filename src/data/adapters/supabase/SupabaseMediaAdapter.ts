// 초안. MediaRepository 구현.
// 정책: Blob 자체는 Storage bucket('media') 에 저장, 메타데이터(좌표·경로)는 DB에 저장.
import type { MediaRepository, HomeOverlay } from '@/data/repositories/MediaRepository';
import { supabase, requireUserId } from './client';

const BUCKET = 'media';
const HERO_FILENAME = 'home_hero/current'; // 확장자는 contentType 기반 결정
const OVERLAY_DIR = 'overlays';

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

interface HeroRow {
  user_id: string;
  storage_path: string;
}
interface OverlayRow {
  id: string;
  user_id: string;
  storage_path: string;
  position_x: number;
  position_y: number;
  order_index: number;
}

export const supabaseMediaAdapter: MediaRepository = {
  async getHomeHero() {
    const userId = await requireUserId();
    const { data: row } = await supabase
      .from('home_hero')
      .select('storage_path')
      .eq('user_id', userId)
      .maybeSingle();
    if (!row) return null;
    return downloadBlob((row as HeroRow).storage_path);
  },

  async setHomeHero(blob: Blob) {
    const userId = await requireUserId();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/${HERO_FILENAME}.${ext}`;
    await uploadBlob(path, blob);
    const { error } = await supabase
      .from('home_hero')
      .upsert({ user_id: userId, storage_path: path }, { onConflict: 'user_id' });
    if (error) throw error;
  },

  async clearHomeHero() {
    const userId = await requireUserId();
    const { data: row } = await supabase
      .from('home_hero')
      .select('storage_path')
      .eq('user_id', userId)
      .maybeSingle();
    if (row) await supabase.storage.from(BUCKET).remove([(row as HeroRow).storage_path]);
    await supabase.from('home_hero').delete().eq('user_id', userId);
  },

  async listOverlays() {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('home_overlays')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    const result: HomeOverlay[] = [];
    for (const r of (data as OverlayRow[])) {
      const blob = await downloadBlob(r.storage_path);
      if (!blob) continue;
      result.push({ id: r.id, blob, x: r.position_x, y: r.position_y });
    }
    return result;
  },

  async addOverlay(blob: Blob) {
    const userId = await requireUserId();
    const id = crypto.randomUUID();
    const ext = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/${OVERLAY_DIR}/${id}.${ext}`;
    await uploadBlob(path, blob);
    const { data, error } = await supabase
      .from('home_overlays')
      .insert({ id, user_id: userId, storage_path: path, position_x: 0.5, position_y: 0.5 })
      .select('*')
      .single();
    if (error) throw error;
    return { id: data.id, blob, x: data.position_x, y: data.position_y };
  },

  async updateOverlayPosition(id, x, y) {
    const { error } = await supabase
      .from('home_overlays')
      .update({ position_x: x, position_y: y })
      .eq('id', id);
    if (error) throw error;
  },

  async removeOverlay(id) {
    const { data: row } = await supabase
      .from('home_overlays')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();
    if (row) await supabase.storage.from(BUCKET).remove([(row as OverlayRow).storage_path]);
    await supabase.from('home_overlays').delete().eq('id', id);
  },
};
