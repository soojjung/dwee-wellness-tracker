'use client';
import { create } from 'zustand';
import { diaryStickerPlacementRepo, ensureMigrations } from '@/data';
import type { DiaryStickerPlacement } from '@/types';

type MonthKey = `${number}-${number}`;

function monthKey(year: number, monthIndex: number): MonthKey {
  return `${year}-${monthIndex}` as MonthKey;
}

/** Draft placement that hasn't been persisted yet. Local id prefixed with `draft-`. */
export interface DraftPlacement extends Omit<DiaryStickerPlacement, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

interface DiaryPlacementState {
  byMonth: Record<MonthKey, DiaryStickerPlacement[]>;
  loadingMonths: Record<MonthKey, boolean>;
  error: string | null;
  hydrateMonth: (year: number, monthIndex: number) => Promise<void>;
  /** Replace all placements for a month with the supplied draft list. */
  commit: (
    year: number,
    monthIndex: number,
    draft: DraftPlacement[],
  ) => Promise<void>;
}

function sameShape(a: DiaryStickerPlacement, b: DraftPlacement): boolean {
  return (
    a.stickerId === b.stickerId &&
    a.x === b.x &&
    a.y === b.y &&
    a.scale === b.scale &&
    a.rotation === b.rotation
  );
}

export const useDiaryPlacementStore = create<DiaryPlacementState>()((set, get) => ({
  byMonth: {},
  loadingMonths: {},
  error: null,

  async hydrateMonth(year, monthIndex) {
    const key = monthKey(year, monthIndex);
    if (get().loadingMonths[key]) return;
    set({ loadingMonths: { ...get().loadingMonths, [key]: true }, error: null });
    try {
      await ensureMigrations();
      const list = await diaryStickerPlacementRepo.listByMonth(year, monthIndex);
      set({
        byMonth: { ...get().byMonth, [key]: list },
        loadingMonths: { ...get().loadingMonths, [key]: false },
      });
    } catch (e) {
      set({
        error: (e as Error).message,
        loadingMonths: { ...get().loadingMonths, [key]: false },
      });
    }
  },

  async commit(year, monthIndex, draft) {
    const key = monthKey(year, monthIndex);
    const persisted = get().byMonth[key] ?? [];
    const persistedById = new Map(persisted.map((p) => [p.id, p]));
    const draftIds = new Set(draft.map((d) => d.id));

    try {
      const created: DiaryStickerPlacement[] = [];
      const updated: DiaryStickerPlacement[] = [];
      const kept: DiaryStickerPlacement[] = [];

      for (const d of draft) {
        const existing = persistedById.get(d.id);
        if (!existing) {
          const row = await diaryStickerPlacementRepo.add({
            stickerId: d.stickerId,
            year,
            monthIndex,
            x: d.x,
            y: d.y,
            scale: d.scale,
            rotation: d.rotation,
          });
          created.push(row);
        } else if (!sameShape(existing, d)) {
          const next = await diaryStickerPlacementRepo.update(existing.id, {
            x: d.x,
            y: d.y,
            scale: d.scale,
            rotation: d.rotation,
          });
          if (next) updated.push(next);
          else kept.push(existing);
        } else {
          kept.push(existing);
        }
      }

      for (const p of persisted) {
        if (!draftIds.has(p.id)) {
          await diaryStickerPlacementRepo.remove(p.id);
        }
      }

      set({
        byMonth: {
          ...get().byMonth,
          [key]: [...kept, ...updated, ...created],
        },
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));

// Stable empty-array reference for months with no placements yet. Returning
// a fresh `[]` from the selector each render would give Zustand's
// useSyncExternalStore a new getSnapshot value every time, triggering an
// infinite re-render loop ("The result of getSnapshot should be cached").
const EMPTY_PLACEMENTS: DiaryStickerPlacement[] = [];

export function selectPlacementsForMonth(year: number, monthIndex: number) {
  return (s: DiaryPlacementState): DiaryStickerPlacement[] =>
    s.byMonth[monthKey(year, monthIndex)] ?? EMPTY_PLACEMENTS;
}
