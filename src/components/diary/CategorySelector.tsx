'use client';
import type { EventCategory } from '@/types';
import { useT } from '@/i18n/useT';
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons';
import { CategoryChip } from './CategoryChip';

interface CategorySelectorProps {
  categories: EventCategory[];
  /** Currently selected category id, or null if none picked yet. */
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Whether the type list under the row is open. Controlled by the form
   * so only one accordion (dates / category) is open at a time. */
  expanded: boolean;
  onToggle: () => void;
  onEditCategory?: (category: EventCategory) => void;
  onAddCategory?: () => void;
}

/**
 * Event-type row (Figma 012_2 / 012_6, node 522:12624): a collapsed row showing the
 * selected category as a colored chip plus a chevron, in the same shape
 * as the date rows above it. Tapping expands a vertical list — one row
 * per type with a pink check on the selected one and a full-size "편집"
 * text button at the right, followed by a "+ add type" row. 생리 is
 * intentionally NOT in this selector — it's a separate period-marker
 * toggle rendered by EventFormSheet as its own card.
 */
export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  expanded,
  onToggle,
  onEditCategory,
  onAddCategory,
}: CategorySelectorProps) {
  const t = useT();
  const c = t.report.diary.categorySheet;
  const selected = categories.find((cat) => cat.id === selectedId) ?? null;

  return (
    <div className="overflow-hidden rounded-2xl bg-brand-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-brand-gray700">{t.report.diary.eventSheet.category}</span>
        <span
          className={
            'flex items-center gap-2 ' + (expanded ? 'text-brand-pink300' : 'text-brand-gray900')
          }
        >
          {selected ? (
            <CategoryChip name={selected.name} colorId={selected.colorId} size="md" />
          ) : null}
          {/* 012_2 shows ▲ while collapsed and 012_6 shows ▼ once open. */}
          <ChevronDownIcon
            strokeWidth={1}
            className={'h-2 w-3 transition-transform ' + (expanded ? '' : 'rotate-180')}
          />
        </span>
      </button>

      {expanded ? (
        <div className="border-t border-brand-gray300 px-4 pb-2 pt-1">
          <ul role="radiogroup" aria-label={t.report.diary.eventSheet.category}>
            {categories.map((cat) => {
              const isSelected = cat.id === selectedId;
              return (
                <li key={cat.id} className="flex items-center">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelect(cat.id)}
                    className="flex min-h-12 flex-1 items-center gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink800"
                  >
                    <span
                      aria-hidden
                      className="grid size-3.5 shrink-0 place-items-center text-brand-pink300"
                    >
                      {isSelected ? <CheckIcon className="size-3.5" /> : null}
                    </span>
                    <CategoryChip name={cat.name} colorId={cat.colorId} size="md" />
                  </button>
                  {onEditCategory ? (
                    <button
                      type="button"
                      onClick={() => onEditCategory(cat)}
                      aria-label={`${c.editEntry}: ${cat.name}`}
                      className="min-h-12 shrink-0 px-2 text-sm text-brand-gray500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
                    >
                      {c.editEntry}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {onAddCategory ? (
            <button
              type="button"
              onClick={onAddCategory}
              className="flex min-h-12 w-full items-center gap-3 border-t border-brand-gray300 py-2 text-left text-sm text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
            >
              <span
                aria-hidden
                className="grid size-[18px] place-items-center text-lg font-light leading-none"
              >
                +
              </span>
              <span>{c.addEntry}</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
