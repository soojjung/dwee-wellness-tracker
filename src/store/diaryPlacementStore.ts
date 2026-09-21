'use client';
import { create } from 'zustand';
import { errorMessage } from '@/lib/errorMessage';
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

/** Converts a persisted placement into its editable draft shape. */
export function toDraft(p: DiaryStickerPlacement): DraftPlacement {
  return {
    id: p.id,
    stickerId: p.stickerId,
    year: p.year,
    monthIndex: p.monthIndex,
    x: p.x,
    y: p.y,
    scale: p.scale,
    rotation: p.rotation,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

/** Creates a new draft placement for a freshly picked sticker, centered on
 * `basePosition` with a small pseudo-random offset (spec item 8). */
export function createDraftPlacement(
  stickerId: string,
  year: number,
  monthIndex: number,
  basePosition: { x: number; y: number },
): DraftPlacement {
  const jitter = () => (Math.random() - 0.5) * 60;
  return {
    id: `draft-${crypto.randomUUID()}`,
    stickerId,
    year,
    monthIndex,
    x: basePosition.x + jitter(),
    y: basePosition.y + jitter(),
    scale: 1,
    rotation: 0,
  };
}

interface DiaryPlacementState {
  byMonth: Record<MonthKey, DiaryStickerPlacement[]>;
  loadingMonths: Record<MonthKey, boolean>;
  error: string | null;
  hydrateMonth: (year: number, monthIndex: number) => Promise<void>;
  /** Replace all placements for a month with the supplied draft list. */
  commit: (year: number, monthIndex: number, draft: DraftPlacement[]) => Promise<void>;
}

/** The fields that determine whether two placements render identically —
 * shared structurally by both `DiaryStickerPlacement` and `DraftPlacement`. */
interface PlacementShape {
  stickerId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

function sameShape(a: PlacementShape, b: PlacementShape): boolean {
  return (
    a.stickerId === b.stickerId &&
    a.x === b.x &&
    a.y === b.y &&
    a.scale === b.scale &&
    a.rotation === b.rotation
  );
}

/** True when two draft lists contain the same placements in the same
 * shape (id-matched, order-independent). Used to gate the customize
 * screen's dirty state and "Done" button. */
export function draftsEqual(a: DraftPlacement[], b: DraftPlacement[]): boolean {
  if (a.length !== b.length) return false;
  const aMap = new Map(a.map((p) => [p.id, p]));
  for (const p of b) {
    const other = aMap.get(p.id);
    if (!other) return false;
    if (!sameShape(other, p)) return false;
  }
  return true;
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
        error: errorMessage(e),
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
      set({ error: errorMessage(e) });
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
