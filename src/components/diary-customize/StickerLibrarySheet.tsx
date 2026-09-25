'use client';
import { useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { usePhotoLibraryPicker } from '@/hooks/usePhotoLibraryPicker';
import { useSelectionSet } from '@/hooks/useSelectionSet';
import type { DiarySticker } from '@/types';
import { cn } from '@/lib/cn';
import { DeleteStickersDialog } from './DeleteStickersDialog';
import { StickerAddMenu } from './StickerAddMenu';
import { StickerGrid, type LibraryMode } from './StickerGrid';

interface StickerLibrarySheetProps {
  stickers: DiarySticker[];
  urls: Record<string, string>;
  onPickFile: (file: File) => void;
  onPickSticker?: (sticker: DiarySticker) => void;
  onOpenCamera: () => void;
  /** Fires when the user confirms bulk deletion (spec: delete flow). */
  onDeleteStickers: (ids: readonly string[]) => Promise<void> | void;
  /** Sticker id that should show a "just added" red dot in its top-left. */
  newStickerId?: string | null;
}

// Time the tapped grid item stays highlighted after tap (spec 6: "회색
// 배경 나타나기"). Fires the actual pick after this so the user sees the
// press feedback before the sheet collapses + the sticker lands.
const PICK_FLASH_MS = 180;

export function StickerLibrarySheet({
  stickers,
  urls,
  onPickFile,
  onPickSticker,
  onOpenCamera,
  onDeleteStickers,
  newStickerId,
}: StickerLibrarySheetProps) {
  const t = useT();
  const c = t.report.diary.customize;
  const albumPicker = usePhotoLibraryPicker({ onPicked: onPickFile });
  const [pickedId, setPickedId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<LibraryMode>('browse');
  const {
    selected: selectedIds,
    toggle: toggleSelection,
    clear: clearSelection,
  } = useSelectionSet<string>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handlePick(sticker: DiarySticker) {
    if (mode === 'edit') {
      toggleSelection(sticker.id);
      return;
    }
    if (!onPickSticker) return;
    if (flashTimerRef.current !== null) window.clearTimeout(flashTimerRef.current);
    setPickedId(sticker.id);
    flashTimerRef.current = window.setTimeout(() => {
      onPickSticker(sticker);
      setPickedId(null);
      flashTimerRef.current = null;
    }, PICK_FLASH_MS);
  }

  function enterEditMode() {
    setMode('edit');
    clearSelection();
  }

  function exitEditMode() {
    setMode('browse');
    clearSelection();
  }

  async function handleDeleteConfirm() {
    if (deleting || selectedIds.size === 0) return;
    setDeleting(true);
    try {
      await onDeleteStickers(Array.from(selectedIds));
      setDeleteDialogOpen(false);
      exitEditMode();
    } finally {
      setDeleting(false);
    }
  }

  const canDelete = mode === 'edit' && selectedIds.size > 0;

  return (
    <>
      {/* 16px padding around a 40px-tall row, per the Figma header
          (256:20929). The design's left slot is an empty 40x40 spacer; the
          Edit / Done pill from the delete flow sits in it. Equal-width side
          columns keep the title centered even though the pill (56px+) and
          the + button (40px) differ in width. */}
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center p-4">
        {/* Left: Edit / Done pill (spec 1 · 2). 56x40 at minimum — 8px/14px
            padding around a 16px regular label lands exactly there, and a
            longer label (e.g. the English "Done") grows from it. */}
        <button
          type="button"
          onClick={mode === 'browse' ? enterEditMode : exitEditMode}
          disabled={stickers.length === 0 && mode === 'browse'}
          className="min-w-14 justify-self-start rounded-full bg-brand-gray200 px-3.5 py-2 text-base font-normal leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-40"
        >
          {mode === 'browse' ? c.editEnter : c.editExit}
        </button>

        <h2 className="text-center text-[20px] font-semibold leading-none text-brand-gray900">
          {c.stickerLibrary}
        </h2>

        {/* Right: + menu (spec 3 — hidden in edit mode) */}
        <StickerAddMenu
          visible={mode === 'browse'}
          ariaLabel={c.addSticker}
          backAriaLabel={c.back}
          chooseAlbumLabel={c.chooseAlbum}
          takePhotoLabel={c.takePhoto}
          cancelLabel={c.addStickerCancel}
          onPickAlbum={() => void albumPicker.open()}
          onOpenCamera={onOpenCamera}
        />
      </div>

      <StickerGrid
        stickers={stickers}
        urls={urls}
        mode={mode}
        selectedIds={selectedIds}
        pickedId={pickedId}
        newStickerId={newStickerId}
        canPick={!!onPickSticker}
        deleteSelectAriaLabel={c.deleteSelectAriaLabel}
        newStickerBadgeLabel={c.newStickerBadge}
        onPick={handlePick}
      />

      {/* Bottom delete CTA — only in edit mode. Disabled until at least one
          sticker is selected so the user can't accidentally open the
          confirm dialog with nothing to delete. */}
      {mode === 'edit' ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={!canDelete}
            className={cn(
              'pointer-events-auto flex items-center gap-2 rounded-full bg-brand-white px-4 py-3 text-sm font-semibold shadow-[0_4px_16px_0_rgba(0,0,0,0.12)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800',
              canDelete
                ? 'text-brand-pink300 hover:bg-brand-gray100'
                : 'cursor-default text-brand-gray400',
            )}
          >
            <TrashIcon />
            <span>{c.deleteCta}</span>
          </button>
        </div>
      ) : null}

      {albumPicker.input}

      {deleteDialogOpen ? (
        <DeleteStickersDialog
          onCancel={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          submitting={deleting}
        />
      ) : null}
    </>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M3 4h10" />
      <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M4 4l1 8a2 2 0 002 2h2a2 2 0 002-2l1-8" />
      <path d="M7 7v4M9 7v4" />
    </svg>
  );
}
