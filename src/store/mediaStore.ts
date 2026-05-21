'use client';
import { create } from 'zustand';
import { mediaRepo, ensureMigrations } from '@/data';

export interface OverlayDisplay {
  id: string;
  url: string;
  x: number;
  y: number;
}

interface MediaState {
  homeHeroUrl: string | null;
  overlays: OverlayDisplay[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  setHomeHero: (blob: Blob) => Promise<void>;
  clearHomeHero: () => Promise<void>;
  addOverlay: (blob: Blob) => Promise<void>;
  moveOverlay: (id: string, x: number, y: number) => Promise<void>;
  removeOverlay: (id: string) => Promise<void>;
}

function swapUrl(prev: string | null, next: string | null): string | null {
  if (prev && prev !== next) URL.revokeObjectURL(prev);
  return next;
}

function revokeAll(list: OverlayDisplay[]): void {
  for (const o of list) URL.revokeObjectURL(o.url);
}

export const useMediaStore = create<MediaState>()((set, get) => ({
  homeHeroUrl: null,
  overlays: [],
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const blob = await mediaRepo.getHomeHero();
      const heroUrl = blob ? URL.createObjectURL(blob) : null;
      const stored = await mediaRepo.listOverlays();
      revokeAll(get().overlays);
      const overlays = stored.map((o) => ({ id: o.id, url: URL.createObjectURL(o.blob), x: o.x, y: o.y }));
      set({
        homeHeroUrl: swapUrl(get().homeHeroUrl, heroUrl),
        overlays,
        hydrated: true,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async setHomeHero(blob) {
    try {
      await mediaRepo.setHomeHero(blob);
      const url = URL.createObjectURL(blob);
      set({ homeHeroUrl: swapUrl(get().homeHeroUrl, url) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async clearHomeHero() {
    try {
      await mediaRepo.clearHomeHero();
      set({ homeHeroUrl: swapUrl(get().homeHeroUrl, null) });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async addOverlay(blob) {
    try {
      const item = await mediaRepo.addOverlay(blob);
      const display: OverlayDisplay = { id: item.id, url: URL.createObjectURL(blob), x: item.x, y: item.y };
      set({ overlays: [...get().overlays, display] });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async moveOverlay(id, x, y) {
    set({ overlays: get().overlays.map((o) => (o.id === id ? { ...o, x, y } : o)) });
    try {
      await mediaRepo.updateOverlayPosition(id, x, y);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  async removeOverlay(id) {
    const target = get().overlays.find((o) => o.id === id);
    if (target) URL.revokeObjectURL(target.url);
    set({ overlays: get().overlays.filter((o) => o.id !== id) });
    try {
      await mediaRepo.removeOverlay(id);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
