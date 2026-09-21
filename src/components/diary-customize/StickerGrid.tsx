'use client';
import type { DiarySticker } from '@/types';
import { cn } from '@/lib/cn';

export type LibraryMode = 'browse' | 'edit';

interface StickerGridProps {
  stickers: DiarySticker[];
  urls: Record<string, string>;
  mode: LibraryMode;
  selectedIds: Set<string>;
  pickedId: string | null;
  /** Sticker id that should show a "just added" red dot in its top-left. */
  newStickerId?: string | null;
  /** Whether a pick handler exists at all — grid cells are non-interactive
   * (aside from edit-mode selection) when it doesn't. */
  canPick: boolean;
  deleteSelectAriaLabel: string;
  newStickerBadgeLabel: string;
  onPick: (sticker: DiarySticker) => void;
}

/** Sticker library's 3-column grid (browse: tap to place, edit: tap to
 * select for deletion). Metrics come from the Figma sticker rows
 * (256:20934): 27px side padding, 12px above the first row, 24px gutters,
 * 96x96 cells. The bottom padding is 24px rather than the design's 12px
 * so the last row clears the floating delete CTA. */
export function StickerGrid({
  stickers,
  urls,
  mode,
  selectedIds,
  pickedId,
  newStickerId,
  canPick,
  deleteSelectAriaLabel,
  newStickerBadgeLabel,
  onPick,
}: StickerGridProps) {
  return (
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
              ? deleteSelectAriaLabel
              : isNew
                ? newStickerBadgeLabel
                : undefined;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onPick(s)}
                disabled={!editing && !canPick}
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
                    box. The <img> shrinks to its own ratio (not the cell's)
                    so the radius on photo stickers hugs the actual pixels
                    instead of the letterboxed square. */}
                <span className="flex h-full w-full items-center justify-center p-2">
                  <img
                    src={url}
                    alt=""
                    className={cn(
                      'max-h-full max-w-full object-contain',
                      s.source === 'photo' && 'rounded-lg',
                    )}
                  />
                </span>
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
  );
}
