'use client';
import { useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import type { DiarySticker } from '@/types';
import { cn } from '@/lib/cn';
import { DeleteStickersDialog } from './DeleteStickersDialog';

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

type LibraryMode = 'browse' | 'edit';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const flashTimerRef = useRef<number | null>(null);

  const [mode, setMode] = useState<LibraryMode>('browse');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onPickFile(file);
    e.target.value = '';
    setMenuOpen(false);
  }

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

  function toggleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function enterEditMode() {
    setMode('edit');
    setMenuOpen(false);
    setSelectedIds(new Set());
  }

  function exitEditMode() {
    setMode('browse');
    setSelectedIds(new Set());
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
          Edit / Done pill from the delete flow sits in it. */}
      <div className="flex w-full items-center justify-between p-4">
        {/* Left: Edit / Done pill (spec 1 · 2). 56x40 at minimum — 8px/14px
            padding around a 16px regular label lands exactly there, and a
            longer label (e.g. the English "Done") grows from it. */}
        <button
          type="button"
          onClick={mode === 'browse' ? enterEditMode : exitEditMode}
          disabled={stickers.length === 0 && mode === 'browse'}
          className="min-w-14 rounded-full bg-brand-gray200 px-3.5 py-2 text-base font-normal leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 disabled:opacity-40"
        >
          {mode === 'browse' ? c.editEnter : c.editExit}
        </button>

        <h2 className="text-[20px] font-semibold leading-none text-brand-gray900">
          {c.stickerLibrary}
        </h2>

        {/* Right: + menu (spec 3 — hidden in edit mode) */}
        {mode === 'browse' ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={c.addSticker}
              aria-expanded={menuOpen}
              className="flex size-10 items-center justify-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
            >
              {/* Path copied from the exported Figma icon (256:20932). */}
              <svg viewBox="0 0 40 40" className="size-full" fill="none" aria-hidden>
                <path
                  d="M20 11.5147L20 28.4853M28.4853 20L11.5147 20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {menuOpen ? (
              <>
                <button
                  type="button"
                  aria-label={c.back}
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-30 cursor-default"
                />
                <div className="absolute right-0 top-12 z-40 flex w-48 flex-col overflow-hidden rounded-2xl bg-brand-gray900 text-sm text-brand-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:bg-brand-gray800"
                  >
                    <AlbumIcon />
                    <span>{c.chooseAlbum}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenCamera();
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-left focus-visible:outline-none focus-visible:bg-brand-gray800"
                  >
                    <CameraIcon />
                    <span>{c.takePhoto}</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <span aria-hidden className="size-10" />
        )}
      </div>

      {/* Grid metrics come from the Figma sticker rows (256:20934): 27px
          side padding, 12px above the first row, 24px gutters, 96x96 cells.
          On a 390px viewport those add up exactly; wider screens scale the
          cells up proportionally. The bottom padding is 24px rather than the
          design's 12px so the last row clears the floating delete CTA. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-[27px] pb-6 pt-3">
        {stickers.length === 0 ? null : (
          <div className="grid grid-cols-3 gap-6">
            {stickers.map((s) => {
              const url = urls[s.id];
              if (!url) return null;
              const isPicked = pickedId === s.id;
              const isNew = newStickerId === s.id;
              const isSelectedForDelete = mode === 'edit' && selectedIds.has(s.id);
              const editing = mode === 'edit';
              const label = editing
                ? c.deleteSelectAriaLabel
                : isNew
                  ? c.newStickerBadge
                  : undefined;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handlePick(s)}
                  disabled={!editing && !onPickSticker}
                  aria-label={label}
                  aria-pressed={editing ? isSelectedForDelete : undefined}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800 disabled:cursor-default',
                    isSelectedForDelete && 'ring-2 ring-brand-pink300',
                    // Spec 6 / Figma 256:20937 — the pressed cell fills with
                    // Gray/300 behind the sticker.
                    isPicked && 'bg-brand-gray300',
                  )}
                >
                  {/* 8px inset keeps the artwork inside the design's 80px
                      box while `object-contain` preserves its own ratio. */}
                  <img src={url} alt="" className="h-full w-full object-contain p-2" />
                  {isNew && !editing ? (
                    <span
                      aria-hidden
                      className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-brand-white"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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

function AlbumIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <rect
        x="2.5"
        y="4.5"
        width="13"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 12l3-3 3 3 2-2 4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <path
        d="M2.5 6a2 2 0 012-2h2l1-1.5h3l1 1.5h2a2 2 0 012 2v6a2 2 0 01-2 2h-9a2 2 0 01-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M3 4h10" />
      <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M4 4l1 8a2 2 0 002 2h2a2 2 0 002-2l1-8" />
      <path d="M7 7v4M9 7v4" />
    </svg>
  );
}
