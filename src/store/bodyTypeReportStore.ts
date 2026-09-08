'use client';
import { create } from 'zustand';
import { bodyTypeReportRepo, ensureMigrations } from '@/data';
import { readLegacyLocalReport, clearLegacyLocalReport } from '@/data/bodyTypeReportStorage';
import type { BodyTypeReport } from '@/types';

interface BodyTypeReportState {
  report: BodyTypeReport | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  /** repo mode(로컬↔원격)가 바뀐 뒤 현재 어댑터에서 다시 읽는다. */
  rehydrate: () => Promise<void>;
  save: (report: BodyTypeReport) => Promise<void>;
  clear: () => Promise<void>;
}

export const useBodyTypeReportStore = create<BodyTypeReportState>()((set, get) => ({
  report: null,
  hydrated: false,
  loading: false,
  error: null,

  async hydrate() {
    if (get().hydrated || get().loading) return;
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      let report = await bodyTypeReportRepo.get();
      // 이 기능은 원래 브라우저 저장소에만 결과를 뒀다. 저장소를 옮기기 전에
      // 진단해 둔 사용자가 결과를 잃지 않도록 한 번 끌어올린다.
      if (!report) {
        const legacy = readLegacyLocalReport();
        if (legacy) {
          await bodyTypeReportRepo.save(legacy);
          clearLegacyLocalReport();
          report = legacy;
        }
      }
      set({ report, hydrated: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async rehydrate() {
    set({ loading: true, error: null });
    try {
      await ensureMigrations();
      const report = await bodyTypeReportRepo.get();
      set({ report, hydrated: true, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  async save(report) {
    // 진단 직후 결과 화면으로 넘어가므로 먼저 메모리에 올린다.
    set({ report, hydrated: true });
    try {
      await bodyTypeReportRepo.save(report);
    } catch (e) {
      // 저장에 실패해도 이번 결과는 보여준다 — 다시 진단하게 만드는 것보다 낫다.
      set({ error: (e as Error).message });
    }
  },

  async clear() {
    set({ report: null, hydrated: true });
    try {
      await bodyTypeReportRepo.clear();
      clearLegacyLocalReport();
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
