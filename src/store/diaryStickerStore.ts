'use client';
import { create } from 'zustand';
import { diaryStickerRepo, ensureDefaultStickersSeeded, ensureMigrations } from '@/data';
import type { NewDiaryStickerInput } from '@/data';
import type { DiarySticker } from '@/types';

interface DiaryStickerState {
  stickers: DiarySticker[];
  /** Blob URLs keyed by sticker id, generated on hydrate/add and revoked on remove/rehydrate. */
  urls: Record<string, string>;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  rehydrate: () => Promise<void>;
  addSticker: (input: NewDiaryStickerInput) => Promise<DiarySticker | null>;
  removeSticker: (id: string) => Promise<void>;
}

function revokeAll(urls: Record<string, string>): void {
  for (const url of Object.values(urls)) URL.revokeObjectURL(url);
}

export const useDiaryStickerStore = create<DiaryStickerState>()((set, get) => ({
  stickers: [],
  urls: {},
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      await ensureDefaultStickersSeeded();
      const stickers = await diaryStickerRepo.list();
      const urls: Record<string, string> = {};
      for (const s of stickers) {
        const blob = await diaryStickerRepo.getBlob(s);
        if (blob) urls[s.id] = URL.createObjectURL(blob);
      }
      revokeAll(get().urls);
      set({ stickers, urls, hydrated: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async rehydrate() {
    revokeAll(get().urls);
    set({ hydrated: false, urls: {} });
    await get().hydrate();
  },

  async addSticker(input) {
    try {
      const record = await diaryStickerRepo.add(input);
      const url = URL.createObjectURL(input.blob);
      set({
        stickers: [record, ...get().stickers],
        urls: { ...get().urls, [record.id]: url },
      });
      return record;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    }
  },

  async removeSticker(id) {
    try {
      await diaryStickerRepo.remove(id);
      const nextUrls = { ...get().urls };
      const url = nextUrls[id];
      if (url) URL.revokeObjectURL(url);
      delete nextUrls[id];
      set({
        stickers: get().stickers.filter((s) => s.id !== id),
        urls: nextUrls,
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
