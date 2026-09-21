'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
import { bookmarkRepo, ensureMigrations } from '@/data';

interface BookmarkState {
  slugs: readonly string[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  toggle: (slug: string) => Promise<void>;
  has: (slug: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()((set, get) => ({
  slugs: [],
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    if (get().hydrated || get().loading) return;
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const slugs = await bookmarkRepo.list();
      set({ slugs, hydrated: true, loading: false });
    } catch (e) {
      set({ error: errorMessage(e), loading: false });
    }
  },

  async toggle(slug) {
    const has = get().slugs.includes(slug);
    // Optimistic update — bookmark toggle needs to feel instant.
    set({ slugs: has ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] });
    try {
      const next = has ? await bookmarkRepo.remove(slug) : await bookmarkRepo.add(slug);
      set({ slugs: next });
    } catch (e) {
      set({ slugs: get().slugs, error: errorMessage(e) });
    }
  },

  has(slug) {
    return get().slugs.includes(slug);
  },
}));
