'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
import { ensureMigrations, introRepo } from '@/data';

interface IntroState {
  seen: boolean;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  markSeen: () => Promise<void>;
}

export const useIntroStore = create<IntroState>()((set, get) => ({
  seen: false,
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    if (get().hydrated || get().loading) return;
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const seen = await introRepo.isSeen();
      set({ seen, hydrated: true, loading: false });
    } catch (e) {
      // AuthGuard waits on this flag before it can route a signed-out visitor,
      // so a storage failure must still resolve — straight to /login rather
      // than a splash that never goes away.
      set({ seen: true, hydrated: true, loading: false, error: errorMessage(e) });
    }
  },

  async markSeen() {
    if (get().seen) return;
    try {
      await introRepo.markSeen();
      set({ seen: true });
    } catch (e) {
      // Still let the person through; worst case the intro shows once more.
      set({ seen: true, error: errorMessage(e) });
    }
  },
}));
