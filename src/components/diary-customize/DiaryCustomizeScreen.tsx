'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
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
  type StickerRatio,
} from '@/types';
import { BackIcon } from '@/components/ui/icons';
import { DiaryMonthGrid } from '@/components/diary/DiaryMonthGrid';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';
import { StickerLibrarySheet } from './StickerLibrarySheet';
import { PhotoImportModal } from './PhotoImportModal';
import { PlacedStickerLayer } from './PlacedStickerLayer';
import { DraggableBottomSheet, type SheetSnap } from '@/components/ui/DraggableBottomSheet';
import { CameraSheet, type CameraCapture } from './CameraSheet';
import { StickerScanScreen } from './StickerScanScreen';
import { CutoutConfirmScreen } from './CutoutConfirmScreen';

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
  const removeSticker = useDiaryStickerStore((s) => s.removeSticker);

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
  // Library sheet starts at `medium` so the calendar + one row of stickers
  // are visible at once (matches 013_1 main state). Picking a sticker
  // auto-collapses to `peek` per spec 9.
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>('medium');
  // Camera flow (013_2/3/4). `mode: 'idle'` is the default library view;
  // capture flows through camera → scan → confirm → back to idle.
  const [cameraMode, setCameraMode] = useState<'idle' | 'camera' | 'scan' | 'confirm'>(
    'idle',
  );
  const [captured, setCaptured] = useState<CameraCapture | null>(null);
  // Populated by StickerScanScreen once the cutout API returns a PNG.
  // CutoutConfirmScreen then shows and (on confirm) persists this blob
  // as source: 'sticker'.
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  // Session-scoped: the id of the sticker most recently added via this
  // customize session, used to paint the "just added" red dot (spec 12).
  const [newStickerId, setNewStickerId] = useState<string | null>(null);
  // Session-scoped: any add/remove on the library this session. Used to
  // enable the header "done" check even when the calendar placements
  // themselves are unchanged (library edits are already persisted, so
  // confirming just navigates back).
  const [libraryTouched, setLibraryTouched] = useState(false);

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
    // Spec 9: sheet auto-collapses to peek so the freshly placed sticker
    // is visible on the calendar. Peek is the hard minimum ("이것보다 더
    // 내려가지 않기") — the sheet component pins there.
    setSheetSnap('peek');
  }

  function handlePlacementChange(id: string, patch: Partial<DiaryStickerPlacement>) {
    setDraft((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function handlePlacementDelete(id: string) {
    setDraft((prev) => prev.filter((p) => p.id !== id));
    setSelectedId(null);
  }

  // ---- Camera flow ---------------------------------------------------------
  const cameraFallbackFileRef = useRef<HTMLInputElement>(null);

  function openCamera() {
    setCameraMode('camera');
  }

  function closeCameraFlow() {
    setCameraMode('idle');
    setCaptured(null);
    setCutoutBlob(null);
  }

  function handleAlbumFromCamera() {
    // Spec 4 — camera's album icon triggers the OS picker. We reuse the
    // existing PhotoImportModal path (crop → save) via importPickedFile.
    cameraFallbackFileRef.current?.click();
  }

  async function saveAndClose(input: {
    blob: Blob;
    ratio: StickerRatio;
    source: 'photo' | 'sticker';
  }) {
    const created = await addSticker(input);
    setCameraMode('idle');
    setCaptured(null);
    setCutoutBlob(null);
    if (created?.id) {
      setNewStickerId(created.id);
      setLibraryTouched(true);
      setSheetSnap('medium');
    }
  }

  async function handleCapture(cap: CameraCapture) {
    // Photo mode skips the scan/confirm dance entirely — the raw capture
    // becomes a source: 'photo' sticker immediately. Sticker mode runs
    // the cutout API via the scan overlay.
    if (cap.mode === 'photo') {
      await saveAndClose({ blob: cap.blob, ratio: cap.ratio, source: 'photo' });
      return;
    }
    setCaptured(cap);
    setCameraMode('scan');
  }

  async function handleCutoutConfirm() {
    if (!captured || !cutoutBlob) return;
    await saveAndClose({
      blob: cutoutBlob,
      ratio: captured.ratio,
      source: 'sticker',
    });
  }

  async function handleDeleteStickers(ids: readonly string[]) {
    // Library deletes are committed immediately (option A from spec review):
    // the sticker rows and their storage blobs are removed via the repo,
    // and any pending draft placement that references a just-deleted
    // sticker is dropped from local state so it can't reference a phantom.
    const doomed = new Set(ids);
    for (const id of ids) {
      await removeSticker(id);
    }
    setDraft((prev) => prev.filter((p) => !doomed.has(p.stickerId)));
    if (selectedId && draft.some((p) => p.id === selectedId && doomed.has(p.stickerId))) {
      setSelectedId(null);
    }
    // Any freshly-added sticker that just got deleted shouldn't keep
    // wearing the red "just added" dot the next mount either.
    setNewStickerId((prev) => (prev && doomed.has(prev) ? null : prev));
    setLibraryTouched(true);
  }

  // "Done" is meaningful when either the calendar placements changed OR
  // the library was touched (add/remove) this session — library edits
  // are already persisted via the sticker repo, so the commit itself is
  // skipped in that path and we just navigate back.
  const canConfirm = isDirty || libraryTouched;

  async function handleCommit() {
    if (committing || !canConfirm) return;
    setCommitting(true);
    try {
      if (isDirty) {
        await commit(cursor.year, cursor.monthIndex, draft);
      }
      router.push('/log');
    } finally {
      setCommitting(false);
    }
  }

  // Back button intent:
  //   - clean (no dirty draft) → straight back to /log
  //   - dirty → ask before dropping the sticker placements
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  function handleBack() {
    if (isDirty) setShowDiscardDialog(true);
    else router.push('/log');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      <header className="flex items-center justify-between px-4 pb-2 pt-safe">
        <button
          type="button"
          onClick={handleBack}
          aria-label={t.report.diary.customize.back}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gray400/40 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <BackIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleCommit}
          disabled={!canConfirm || committing}
          aria-label={t.report.diary.customize.done}
          className={
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
            (canConfirm && !committing
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

      {/* Peek is intentionally very shallow (top edge at 85dvh) so the
          calendar's last week stays visible for sticker placement previews;
          the sheet default of 70dvh covered the 5th/6th rows on tall
          months. Users still see the drag handle + toolbar and can pull
          the sheet up when they want the full library. */}
      <DraggableBottomSheet
        snap={sheetSnap}
        onSnapChange={setSheetSnap}
        snapHeightsDvh={{ peek: 85, medium: 45, full: 10 }}
      >
        <StickerLibrarySheet
          stickers={stickers}
          urls={urls}
          onPickFile={(file) => setImportPickedFile(file)}
          onPickSticker={handlePickSticker}
          onOpenCamera={openCamera}
          onDeleteStickers={handleDeleteStickers}
          newStickerId={newStickerId}
        />
      </DraggableBottomSheet>

      {cameraMode === 'camera' ? (
        <CameraSheet
          onClose={closeCameraFlow}
          onOpenAlbum={handleAlbumFromCamera}
          onCapture={handleCapture}
        />
      ) : null}
      {cameraMode === 'scan' && captured ? (
        <StickerScanScreen
          blob={captured.blob}
          mediaType={
            captured.blob.type === 'image/png' || captured.blob.type === 'image/webp'
              ? captured.blob.type
              : 'image/jpeg'
          }
          onCutoutReady={(png) => {
            setCutoutBlob(png);
            setCameraMode('confirm');
          }}
          onSaveAsPhoto={async () => {
            await saveAndClose({
              blob: captured.blob,
              ratio: captured.ratio,
              source: 'photo',
            });
          }}
          onCancel={closeCameraFlow}
        />
      ) : null}
      {cameraMode === 'confirm' && captured && cutoutBlob ? (
        <CutoutConfirmScreen
          blob={cutoutBlob}
          onClose={closeCameraFlow}
          onRetake={() => {
            setCaptured(null);
            setCutoutBlob(null);
            setCameraMode('camera');
          }}
          onConfirm={handleCutoutConfirm}
        />
      ) : null}

      {/* Hidden file input for the in-camera "album" fallback. Reuses the
          same PhotoImportModal path as the library's + menu. */}
      <input
        ref={cameraFallbackFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setCameraMode('idle');
          setCaptured(null);
          setImportPickedFile(file);
        }}
      />

      {importPickedFile ? (
        <PhotoImportModal
          file={importPickedFile}
          onClose={() => setImportPickedFile(null)}
          onSaved={async (blob, ratio, mode) => {
            setImportPickedFile(null);
            if (mode === 'photo') {
              await saveAndClose({ blob, ratio, source: 'photo' });
              return;
            }
            // Cutout mode: reuse the camera scan/confirm overlay by
            // staging the cropped blob as `captured` and jumping to
            // scan. The scan screen calls the API, then hands the PNG
            // to CutoutConfirmScreen.
            setCaptured({ blob, ratio, mode: 'sticker' });
            setCameraMode('scan');
          }}
        />
      ) : null}

      {showDiscardDialog ? (
        <DiscardDialog
          onCancel={() => setShowDiscardDialog(false)}
          onConfirm={() => {
            setShowDiscardDialog(false);
            router.push('/log');
          }}
        />
      ) : null}
    </div>
  );
}

interface DiscardDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Whole-session discard confirmation for the diary customize flow. Fired
 * from the header back button when the sticker draft has any dirty
 * change — confirming drops every placement change made in this session.
 */
function DiscardDialog({ onCancel, onConfirm }: DiscardDialogProps) {
  const t = useT();
  useBodyScrollLock();
  useEscToClose(onCancel);
  const copy = t.report.diary.customize.discardDialog;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="diary-discard-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-brand-white shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 px-6 pb-5 pt-6">
          <span
            aria-hidden
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink50 text-brand-pink300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M12 6v8" />
              <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p
            id="diary-discard-dialog-title"
            className="text-center text-sm font-medium leading-[1.5] text-brand-gray900"
          >
            {copy.title}
          </p>
          <p className="text-center text-xs leading-[1.5] text-brand-gray800">
            {copy.body}
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-brand-gray300">
          <button
            type="button"
            onClick={onCancel}
            className="bg-brand-gray300 py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-gray900"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-brand-gray900 py-3.5 text-sm font-medium text-brand-white transition-colors hover:bg-brand-gray800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-white"
          >
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
