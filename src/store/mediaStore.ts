'use client';
import { create } from 'zustand';
import { mediaRepo, ensureMigrations } from '@/data';
import {
  DEFAULT_TEXT_ORDER,
  MAX_PHOTO_SLOTS,
  PHOTO_SLOTS,
  type PhotoCount,
  type PhotoSlot,
  type TextOrder,
  type TextPosition,
} from '@/domain/home/decor';

type PhotoUrls = (string | null)[];

interface MediaState {
  photoCount: PhotoCount | null;
  photoUrls: PhotoUrls;
  textPosition: TextPosition | null;
  mainText: string;
  subText: string;
  textOrder: TextOrder | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  rehydrate: () => Promise<void>;
  setPhotoCount: (count: PhotoCount) => Promise<void>;
  setPhoto: (slot: PhotoSlot, blob: Blob) => Promise<void>;
  clearPhoto: (slot: PhotoSlot) => Promise<void>;
  setTextPosition: (position: TextPosition) => Promise<void>;
  setMainText: (text: string) => Promise<void>;
  setSubText: (text: string) => Promise<void>;
  swapTexts: () => Promise<void>;
}

function emptyUrls(): PhotoUrls {
  return Array<string | null>(MAX_PHOTO_SLOTS).fill(null);
}

function replaceUrl(prev: PhotoUrls, slot: PhotoSlot, next: string | null): PhotoUrls {
  const old = prev[slot];
  if (old && old !== next) URL.revokeObjectURL(old);
  const out = prev.slice();
  out[slot] = next;
  return out;
}

function revokeAll(urls: PhotoUrls): void {
  urls.forEach((u) => {
    if (u) URL.revokeObjectURL(u);
  });
}

export const useMediaStore = create<MediaState>()((set, get) => ({
  photoCount: null,
  photoUrls: emptyUrls(),
  textPosition: null,
  mainText: '',
  subText: '',
  textOrder: null,
  hydrated: false,
  loading: false,
  error: null,

  async rehydrate() {
    set({ hydrated: false });
    await get().hydrate();
  },

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const [count, blobs, textPosition, mainText, subText, textOrder] = await Promise.all([
        mediaRepo.getPhotoCount(),
        Promise.all(PHOTO_SLOTS.map((s) => mediaRepo.getHomePhoto(s))),
        mediaRepo.getTextPosition(),
        mediaRepo.getMainText(),
        mediaRepo.getSubText(),
        mediaRepo.getTextOrder(),
      ]);
      revokeAll(get().photoUrls);
      const urls: PhotoUrls = blobs.map((b) => (b ? URL.createObjectURL(b) : null));
      set({
        photoCount: count ?? 1,
        photoUrls: urls,
        textPosition,
        mainText,
        subText,
        textOrder,
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async setPhotoCount(count: PhotoCount) {
    if (get().photoCount === count) return;
    try {
      await mediaRepo.setPhotoCount(count);
      set({ photoCount: count });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setPhoto(slot: PhotoSlot, blob: Blob) {
    try {
      await mediaRepo.setHomePhoto(slot, blob);
      const url = URL.createObjectURL(blob);
      set({ photoUrls: replaceUrl(get().photoUrls, slot, url) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async clearPhoto(slot: PhotoSlot) {
    try {
      await mediaRepo.clearHomePhoto(slot);
      set({ photoUrls: replaceUrl(get().photoUrls, slot, null) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setTextPosition(position: TextPosition) {
    try {
      await mediaRepo.setTextPosition(position);
      set({ textPosition: position });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setMainText(text: string) {
    try {
      await mediaRepo.setMainText(text);
      set({ mainText: text });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async setSubText(text: string) {
    try {
      await mediaRepo.setSubText(text);
      set({ subText: text });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async swapTexts() {
    const current = get().textOrder ?? DEFAULT_TEXT_ORDER;
    const next: TextOrder = current === 'mainFirst' ? 'subFirst' : 'mainFirst';
    try {
      await mediaRepo.setTextOrder(next);
      set({ textOrder: next });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

}));
