'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { usePeriodStore } from '@/store/periodStore';
import { useEventStore } from '@/store/eventStore';
import { useDiaryStickerStore } from '@/store/diaryStickerStore';
import { currentMonth, useDiaryFocusStore } from '@/store/diaryFocusStore';
import {
  selectPlacementsForMonth,
  useDiaryPlacementStore,
  toDraft,
  draftsEqual,
  createDraftPlacement,
  type DraftPlacement,
} from '@/store/diaryPlacementStore';
import { formatMonthLabel, todayISO } from '@/lib/date';
import {
  PLACEMENT_NOMINAL_WIDTH,
  type DiaryStickerPlacement,
  type DiarySticker,
  type StickerRatio,
} from '@/types';
import { BackIcon, HeaderCheckGlyph } from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DiaryMonthGrid } from '@/components/diary/DiaryMonthGrid';
import type { BuiltinCategoryKey } from '@/domain/event/builtins';
import { resolveHolidayCountries } from '@/domain/holiday';
import { useDiaryHydration } from '@/hooks/useDiaryHydration';
import { StickerLibrarySheet } from './StickerLibrarySheet';
import { usePhotoLibraryPicker } from '@/hooks/usePhotoLibraryPicker';
import { PhotoImportModal } from './PhotoImportModal';
import { PlacedStickerLayer } from './PlacedStickerLayer';
import { DraggableBottomSheet, type SheetSnap } from '@/components/ui/DraggableBottomSheet';
import { CameraSheet, type CameraCapture } from './CameraSheet';
import { StickerScanScreen } from './StickerScanScreen';
import { CutoutConfirmScreen } from './CutoutConfirmScreen';
import { CapturedPhotoRatioStep } from './CapturedPhotoRatioStep';
import { ratioForImage, trimTransparentMargins } from '@/lib/image/stickerCrop';

const WEEK_STARTS_ON = 0;
// Collapsed sheet shows only the drag handle (14px) + title row (16px padding
// around a 40px row) — no sticker grid peeking through.
const STICKER_SHEET_HEADER_PX = 86;

export function DiaryCustomizeScreen() {
  const t = useT();
  const router = useRouter();
  const today = todayISO();
  const locale = useSettingsStore((s) => s.settings.locale);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);
  const holidaySetting = useSettingsStore((s) => s.settings.holidayCountries);
  const holidayCountries = useMemo(
    () => resolveHolidayCountries(holidaySetting, locale),
    [holidaySetting, locale],
  );

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

  // 다이어리에서 보던 달로 연다. 10월을 보다가 꾸미기에 들어왔는데 9월(오늘 달)이
  // 열리던 버그의 수정. 새로고침·딥링크처럼 기록이 없으면 오늘 달.
  const [cursor] = useState(() => useDiaryFocusStore.getState().visibleMonth ?? currentMonth());
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
  const [cameraMode, setCameraMode] = useState<'idle' | 'camera' | 'ratio' | 'scan' | 'confirm'>(
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

  const builtinNamer = useCallback(
    (key: BuiltinCategoryKey) => t.report.diary.eventCategory.builtin[key],
    [t],
  );
  useDiaryHydration({
    cursor,
    periodsHydrated,
    hydratePeriods,
    eventsHydrated,
    hydrateEvents,
    stickersHydrated,
    hydrateStickers,
    hydratePlacementMonth: hydrateMonth,
    settingsHydrated,
    categoriesCount: categories.length,
    seedBuiltinsIfEmpty,
    builtinNamer,
  });

  useEffect(() => {
    if (initialized) return;
    setDraft(persistedPlacements.map(toDraft));
    setInitialized(true);
    // 다이어리에서 스티커를 탭해 들어온 경우: 그 스티커를 바로 선택하고 보관함은
    // peek 로 내려 스티커가 가려지지 않게 한다. 1회용 값이라 읽고 나면 지운다.
    const focusId = useDiaryFocusStore.getState().focusPlacementId;
    if (focusId) {
      useDiaryFocusStore.getState().setFocusPlacementId(null);
      if (persistedPlacements.some((p) => p.id === focusId)) {
        setSelectedId(focusId);
        setSheetSnap('peek');
      }
    }
  }, [persistedPlacements, initialized]);

  const monthLabel = formatMonthLabel(new Date(cursor.year, cursor.monthIndex, 1), locale);

  const isDirty = useMemo(() => {
    if (!initialized) return false;
    return !draftsEqual(draft, persistedPlacements.map(toDraft));
  }, [initialized, draft, persistedPlacements]);

  function handlePickSticker(sticker: DiarySticker) {
    const next = createDraftPlacement(sticker.id, cursor.year, cursor.monthIndex, {
      x: PLACEMENT_NOMINAL_WIDTH / 2,
      y: PLACEMENT_NOMINAL_WIDTH / 2,
    });
    setDraft((prev) => [...prev, next]);
    setSelectedId(next.id);
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
  // Spec 4 — camera's album icon opens the OS photo library, then reuses
  // the PhotoImportModal path (crop → save) via importPickedFile.
  const cameraAlbumPicker = usePhotoLibraryPicker({
    onPicked: (file) => {
      setCameraMode('idle');
      setImportPickedFile(file);
    },
  });

  function openCamera() {
    setCameraMode('camera');
  }

  function closeCameraFlow() {
    setCameraMode('idle');
    setCaptured(null);
    setCutoutBlob(null);
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

  function handleCapture(cap: CameraCapture) {
    // The camera no longer asks for a ratio up front. A photo used as-is picks
    // one now (013_5/6); a sticker goes to the cutout scan and never needs one.
    setCaptured(cap);
    setCameraMode(cap.mode === 'photo' ? 'ratio' : 'scan');
  }

  async function handleCutoutConfirm() {
    if (!captured || !cutoutBlob) return;
    await saveAndClose({
      blob: cutoutBlob,
      // No ratio was chosen for a cutout, so the placement frame follows the
      // shape of the trimmed subject itself.
      ratio: await ratioForImage(cutoutBlob),
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

  // Any full-screen flow of this screen's own. Their surfaces sit outside
  // the sheet's DOM, so outside-tap dismissal has to stand down while one
  // of them is open.
  const overlayActive = cameraMode !== 'idle' || importPickedFile !== null || showDiscardDialog;

  // 보관함 바깥 탭 (Figma 피드백 2026-09-16): 시트를 없애지 않고 한 단계씩 내린다.
  //   medium/full → peek. peek 에서는 아무 일도 하지 않는다 — 선택 해제는
  //   PlacedStickerLayer 가 따로 처리한다.
  // 원래는 peek 에서 한 번 더 탭하면 꾸미기 종료(뒤로가기)였는데, 실기기 QA
  // (2026-09-23) 에서 캘린더를 스치기만 해도 "변경사항을 버릴까요?" 가 떠서
  // 종료는 상단 뒤로가기 버튼으로만 한다.
  // 캔버스의 스티커를 잡거나(드래그·삭제) 상단 버튼을 누르는 터치는 제외한다.
  function handleSheetOutsideTap(e: PointerEvent) {
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest('[data-placed-sticker="true"], [data-sheet-dismiss-ignore]')) return;
    if (sheetSnap !== 'peek') setSheetSnap('peek');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray200">
      {/* 8px above the row, plus the notch inset where there is one — bare
          `pt-safe` resolved to 0 outside a notched device and left the
          back/done buttons flush against the top edge. */}
      <header
        data-sheet-dismiss-ignore
        className="flex items-center justify-between px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]"
      >
        <button
          type="button"
          data-swipe-back
          onClick={handleBack}
          aria-label={t.report.diary.customize.back}
          // Figma 256:21706 — Gray/400 at 50% behind a 2px backdrop blur.
          className="flex size-10 items-center justify-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          {/* BackIcon's chevron is drawn in a 40-unit viewBox, so it has to
              fill the 40px button — at h-5 the glyph rendered half-size. */}
          <BackIcon className="size-full" />
        </button>
        <button
          type="button"
          onClick={handleCommit}
          disabled={!canConfirm || committing}
          aria-label={t.report.diary.customize.done}
          className={
            'flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 ' +
            (canConfirm && !committing
              ? 'bg-brand-pink300 text-brand-white'
              : 'bg-brand-gray400/60 text-brand-gray50')
          }
        >
          {/* Same check path as the sticker sheet's header icon (413:6358),
              drawn in the shared 40-unit button viewBox. */}
          <HeaderCheckGlyph className="size-full" />
        </button>
      </header>

      {/* 다이어리 화면(DiaryHeader 2행 + `px-4 pt-4` + `py-2` 카드)과 같은 치수.
          여기서 1px 이라도 다르면 꾸미기 진입 순간 월 라벨과 캘린더가 튀어 보인다.
          2행은 토글·+ 버튼(32px)이 높이를 만들므로 h-8 로 고정한다. */}
      <div className="flex h-8 items-center px-4">
        <span className="text-xl font-semibold leading-normal text-brand-gray900">
          {monthLabel}
        </span>
      </div>

      <div className="flex-1 px-4 pt-4">
        <PlacedStickerLayer
          placements={draft as DiaryStickerPlacement[]}
          stickers={stickers}
          urls={urls}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onChange={handlePlacementChange}
          onDelete={handlePlacementDelete}
        >
          <div className="rounded-2xl bg-brand-white/95 py-2 backdrop-blur-sm">
            <DiaryMonthGrid
              year={cursor.year}
              monthIndex={cursor.monthIndex}
              weekStartsOn={WEEK_STARTS_ON}
              today={today}
              periods={periods}
              events={events}
              categories={categories}
              holidayCountries={holidayCountries}
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
        peekVisiblePx={STICKER_SHEET_HEADER_PX}
        open
        // While one of this screen's own overlays is up, a tap inside it lands
        // "outside" the sheet, so outside-tap handling is switched off there.
        onDismiss={overlayActive ? undefined : handleSheetOutsideTap}
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
          onOpenAlbum={() => void cameraAlbumPicker.open()}
          onCapture={handleCapture}
        />
      ) : null}
      {cameraMode === 'ratio' && captured ? (
        <CapturedPhotoRatioStep
          blob={captured.blob}
          onRetake={() => {
            setCaptured(null);
            setCameraMode('camera');
          }}
          onClose={closeCameraFlow}
          onSaved={(cropped, ratio) => saveAndClose({ blob: cropped, ratio, source: 'photo' })}
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
          onCutoutReady={async (png) => {
            // 미리보기(013_4)가 실제로 저장될 모양을 보여 주도록 여기서 먼저 다듬는다.
            setCutoutBlob(await trimTransparentMargins(png));
            setCameraMode('confirm');
          }}
          // 누끼 실패 시의 탈출구도 "사진 그대로" 경로다 — 비율을 고르러 보낸다.
          onSaveAsPhoto={() => setCameraMode('ratio')}
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

      {/* Web fallback input for the camera's album icon (native opens the
          OS library directly through the hook). */}
      {cameraAlbumPicker.input}

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
            setCaptured({ blob, mode: 'sticker' });
            setCameraMode('scan');
          }}
        />
      ) : null}

      {showDiscardDialog ? (
        <ConfirmDialog
          titleId="diary-discard-dialog-title"
          title={t.report.diary.customize.discardDialog.title}
          body={t.report.diary.customize.discardDialog.body}
          cancelLabel={t.report.diary.customize.discardDialog.cancel}
          confirmLabel={t.report.diary.customize.discardDialog.confirm}
          onCancel={() => setShowDiscardDialog(false)}
          onConfirm={() => {
            setShowDiscardDialog(false);
            router.push('/log');
          }}
          zIndex={50}
        />
      ) : null}
    </div>
  );
}
