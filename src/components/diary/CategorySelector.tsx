'use client';
import type { EventCategory } from '@/types';
import { useT } from '@/i18n/useT';
import { paletteFor } from '@/domain/event/palette';

interface CategorySelectorProps {
  categories: EventCategory[];
  /** Currently selected category id, or null if none picked yet. */
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEditCategory?: (category: EventCategory) => void;
  onAddCategory?: () => void;
}

/**
 * Radio-style chip picker for event categories. All chips render at once
 * (no dropdown) — the user picks exactly one. Edit-per-chip and
 * "add new category" live inline so the user doesn't need to leave the
 * form. 생리 is intentionally NOT in this selector — it's a separate
 * period-marker toggle rendered by EventFormSheet as its own card.
 */
export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
  onAddCategory,
}: CategorySelectorProps) {
  const t = useT();

  return (
    <div className="space-y-3 rounded-2xl bg-brand-white p-4">
      <p className="text-sm text-brand-gray700">
        {t.report.diary.eventSheet.category}
      </p>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const p = paletteFor(cat.colorId);
          return (
            <SelectionChip
              key={cat.id}
              label={cat.name}
              bg={p.bg}
              fg={p.fg}
              selected={cat.id === selectedId}
              onSelect={() => onSelect(cat.id)}
              onEdit={onEditCategory ? () => onEditCategory(cat) : undefined}
            />
          );
        })}

        {onAddCategory ? (
          <button
            type="button"
            onClick={onAddCategory}
            aria-label={t.report.diary.categorySheet.addEntry}
            className="flex items-center gap-1 rounded-full border border-dashed border-brand-gray400 px-3 py-1.5 text-sm font-medium text-brand-gray700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
          >
            <span aria-hidden className="text-base leading-none">
              +
            </span>
            <span>{t.report.diary.categorySheet.addEntry}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

interface SelectionChipProps {
  label: string;
  bg: string;
  fg: string;
  selected: boolean;
  onSelect: () => void;
  /** Optional inline edit tap target (small pencil area at right). */
  onEdit?: () => void;
}

function SelectionChip({
  label,
  bg,
  fg,
  selected,
  onSelect,
  onEdit,
}: SelectionChipProps) {
  return (
    <span
      className={
        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-shadow ' +
        (selected ? 'ring-2 ring-brand-pink300' : '')
      }
      style={{ backgroundColor: bg, color: fg }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="focus-visible:outline-none"
      >
        {label}
      </button>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label="edit"
          className="ml-1 opacity-50 hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M2 10h8M8 2l2 2-6 6H2v-2z" />
          </svg>
        </button>
      ) : null}
    </span>
  );
}
