'use client';
import { useState } from 'react';
import type { EventCategory } from '@/types';
import { useT } from '@/i18n/useT';
import { ChevronDownIcon } from '@/components/ui/icons';
import { CategoryChip } from './CategoryChip';

interface CategorySelectorProps {
  categories: EventCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEditCategory?: (category: EventCategory) => void;
  onAddCategory?: () => void;
}

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
  onEditCategory,
  onAddCategory,
}: CategorySelectorProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const selected = categories.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="overflow-hidden rounded-2xl bg-brand-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-brand-gray700">
          {t.report.diary.eventSheet.category}
        </span>
        <span className="flex items-center gap-2">
          {selected ? (
            <CategoryChip name={selected.name} colorId={selected.colorId} />
          ) : null}
          <ChevronDownIcon
            className={
              'h-2 w-3 text-brand-gray900 transition-transform' +
              (expanded ? ' rotate-180' : '')
            }
          />
        </span>
      </button>
      {expanded ? (
        <ul className="divide-y divide-brand-gray300 border-t border-brand-gray300">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedId;
            return (
              <li key={cat.id}>
                <div className="flex items-center justify-between px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(cat.id);
                      setExpanded(false);
                    }}
                    className="flex flex-1 items-center gap-2 text-left"
                    aria-pressed={isSelected}
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-3 w-3 shrink-0 items-center justify-center text-sm text-brand-pink800"
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <CategoryChip name={cat.name} colorId={cat.colorId} />
                  </button>
                  {onEditCategory ? (
                    <button
                      type="button"
                      onClick={() => onEditCategory(cat)}
                      className="ml-2 px-2 py-1 text-xs text-brand-gray700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
                    >
                      {t.report.diary.categorySheet.editEntry}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
          {onAddCategory ? (
            <li>
              <button
                type="button"
                onClick={onAddCategory}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
              >
                <span aria-hidden className="text-base leading-none">
                  +
                </span>
                <span>{t.report.diary.categorySheet.addEntry}</span>
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
