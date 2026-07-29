'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useEventStore } from '@/store/eventStore';
import { useDiaryStickerStore } from '@/store/diaryStickerStore';
import {
  selectPlacementsForMonth,
  useDiaryPlacementStore,
  type DraftPlacement,
} from '@/store/diaryPlacementStore';
import { formatMonthLabel, todayISO } from '@/lib/date';
import {
  PLACEMENT_NOMINAL_WIDTH,
  type DiaryStickerPlacement,
  type DiarySticker,
} from '@/types';
import { BackIcon } from '@/components/ui/icons';
import { DiaryMonthGrid } from '@/components/diary/DiaryMonthGrid';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';
import { StickerLibrarySheet } from './StickerLibrarySheet';
import { PhotoImportModal } from './PhotoImportModal';
import { PlacedStickerLayer } from './PlacedStickerLayer';

const WEEK_STARTS_ON = 0;

function toDraft(p: DiaryStickerPlacement): DraftPlacement {
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

function draftsEqual(a: DraftPlacement[], b: DraftPlacement[]): boolean {
  if (a.length !== b.length) return false;
  const aMap = new Map(a.map((p) => [p.id, p]));
  for (const p of b) {
    const other = aMap.get(p.id);
    if (!other) return false;
    if (
      other.stickerId !== p.stickerId ||
      other.x !== p.x ||
      other.y !== p.y ||
      other.scale !== p.scale ||
      other.rotation !== p.rotation
    ) {
      return false;
    }
  }
  return true;
}

export function DiaryCustomizeScreen() {
  const t = useT();
  const router = useRouter();
  const today = todayISO();
  const locale = useSettingsStore((s) => s.settings.locale);

  const periods = usePeriodStore((s) => s.periods);
  const periodsHydrated = usePeriodStore((s) => s.hydrated);
  const hydratePeriods = usePeriodStore((s) => s.hydrate);

  const events = useEventStore((s) => s.events);
  const categories = useEventStore((s) => s.categories);
  const eventsHydrated = useEventStore((s) => s.hydrated);
  const hydrateEvents = useEventStore((s) => s.hydrate);
  const seedBuiltinsIfEmpty = useEventStore((s) => s.seedBuiltinsIfEmpty);

  const stickers = useDiaryStickerStore((s) => s.stickers);
  const urls = useDiaryStickerStore((s) => s.urls);
  const stickersHydrated = useDiaryStickerStore((s) => s.hydrated);
  const hydrateStickers = useDiaryStickerStore((s) => s.hydrate);
  const addSticker = useDiaryStickerStore((s) => s.addSticker);

  const [cursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), monthIndex: now.getMonth() };
  });
  const persistedPlacements = useDiaryPlacementStore(
    selectPlacementsForMonth(cursor.year, cursor.monthIndex),
  );
  const hydrateMonth = useDiaryPlacementStore((s) => s.hydrateMonth);
  const commit = useDiaryPlacementStore((s) => s.commit);

  const [importPickedFile, setImportPickedFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<DraftPlacement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (!periodsHydrated) hydratePeriods();
  }, [periodsHydrated, hydratePeriods]);
  useEffect(() => {
    if (!eventsHydrated) hydrateEvents();
  }, [eventsHydrated, hydrateEvents]);
  useEffect(() => {
    if (!stickersHydrated) hydrateStickers();
  }, [stickersHydrated, hydrateStickers]);
  useEffect(() => {
    hydrateMonth(cursor.year, cursor.monthIndex);
  }, [cursor.year, cursor.monthIndex, hydrateMonth]);

  useEffect(() => {
    if (initialized) return;
    setDraft(persistedPlacements.map(toDraft));
    setInitialized(true);
  }, [persistedPlacements, initialized]);

  const builtinNamer = useCallback(
    (key: BuiltinCategoryKey) => t.report.diary.eventCategory.builtin[key],
    [t],
  );
  useEffect(() => {
    if (!eventsHydrated) return;
    if (categories.length === 0) seedBuiltinsIfEmpty(builtinNamer);
  }, [eventsHydrated, categories.length, seedBuiltinsIfEmpty, builtinNamer]);

  const monthLabel = formatMonthLabel(
    new Date(cursor.year, cursor.monthIndex, 1),
    locale,
  );

  const isDirty = useMemo(() => {
    if (!initialized) return false;
    return !draftsEqual(draft, persistedPlacements.map(toDraft));
  }, [initialized, draft, persistedPlacements]);

  function handlePickSticker(sticker: DiarySticker) {
    const id = `draft-${crypto.randomUUID()}`;
    // Center the new placement with a small pseudo-random offset (spec item 8).
    const jitter = () => (Math.random() - 0.5) * 60;
    const next: DraftPlacement = {
      id,
      stickerId: sticker.id,
      year: cursor.year,
      monthIndex: cursor.monthIndex,
      x: PLACEMENT_NOMINAL_WIDTH / 2 + jitter(),
      y: PLACEMENT_NOMINAL_WIDTH / 2 + jitter(),
      scale: 1,
      rotation: 0,
    };
    setDraft((prev) => [...prev, next]);
    setSelectedId(id);
  }

  function handlePlacementChange(id: string, patch: Partial<DiaryStickerPlacement>) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function handlePlacementDelete(id: string) {
    setDraft((prev) => prev.filter((p) => p.id !== id));
    setSelectedId(null);
  }

  async function handleCommit() {
    if (committing || !isDirty) return;
    setCommitting(true);
    try {
      await commit(cursor.year, cursor.monthIndex, draft);
      router.push('/log');
    } finally {
      setCommitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <header className="flex items-center justify-between px-4 pb-2 pt-safe">
        <Link
          href="/log"
          aria-label={t.report.diary.customize.back}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <button
          type="button"
          onClick={handleCommit}
          disabled={!isDirty || committing}
          aria-label={t.report.diary.customize.done}
          className={
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
            (isDirty && !committing
              ? 'bg-brand-pink300 text-brand-white'
              : 'bg-brand-gray400/60 text-brand-gray50')
          }
        >
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
            <path
              d="M2 7l4 4 6-8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      </header>

      <div className="px-4 pb-3 pt-1">
        <span className="text-xl font-semibold leading-normal text-brand-gray900">
          {monthLabel}
        </span>
      </div>

      <div className="flex-1 px-4">
        <PlacedStickerLayer
          placements={draft as DiaryStickerPlacement[]}
          stickers={stickers}
          urls={urls}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={handlePlacementChange}
          onDelete={handlePlacementDelete}
        >
          <div className="rounded-2xl bg-brand-white/95 px-2 py-2 backdrop-blur-sm">
            <DiaryMonthGrid
              year={cursor.year}
              monthIndex={cursor.monthIndex}
              weekStartsOn={WEEK_STARTS_ON}
              today={today}
              periods={periods}
              events={events}
              categories={categories}
              onSelect={() => {
                /* Reserved for future day-focused customize UX */
              }}
            />
          </div>
        </PlacedStickerLayer>
      </div>

      <StickerLibrarySheet
        stickers={stickers}
        urls={urls}
        onPickFile={(file) => setImportPickedFile(file)}
        onPickSticker={handlePickSticker}
      />

      {importPickedFile ? (
        <PhotoImportModal
          file={importPickedFile}
          onClose={() => setImportPickedFile(null)}
          onSaved={async (blob, ratio) => {
            await addSticker({ blob, ratio, source: 'photo' });
            setImportPickedFile(null);
          }}
        />
      ) : null}
    </div>
  );
}
