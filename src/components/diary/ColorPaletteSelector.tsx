'use client';
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import type { ColorPaletteId } from '@/types';
import { PALETTE_IDS, paletteFor } from '@/domain/event/palette';
import { ChevronDownIcon } from '@/components/ui/icons';

interface ColorPaletteSelectorProps {
  selectedId: ColorPaletteId;
  onSelect: (id: ColorPaletteId) => void;
}

/**
 * Figma 012_9: the color list is expanded by default. The header row is a
 * "current selection" summary + collapse chevron; tapping it collapses to
 * show just the summary, tapping again re-expands.
 */
export function ColorPaletteSelector({
  selectedId,
  onSelect,
}: ColorPaletteSelectorProps) {
  const t = useT();
  const [expanded, setExpanded] = useState(true);
  const selected = paletteFor(selectedId);

  return (
    <div className="overflow-hidden rounded-2xl bg-brand-white">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm text-brand-gray700">
          {t.report.diary.categorySheet.colorLabel}
        </span>
        <span className="flex items-center gap-2 text-sm font-medium text-brand-pink300">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: selected.dot }}
          />
          <span>{t.report.diary.palette[selectedId]}</span>
          <ChevronDownIcon
            className={
              'h-2 w-3 text-brand-pink300 transition-transform' +
              (expanded ? ' rotate-180' : '')
            }
          />
        </span>
      </button>
      {expanded ? (
        <ul className="border-t border-brand-gray300 px-4 py-2">
          {PALETTE_IDS.map((id) => {
            const p = paletteFor(id);
            const isSelected = id === selectedId;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className="flex w-full items-center gap-3 py-2 text-left"
                  aria-pressed={isSelected}
                >
                  <span
                    aria-hidden
                    className="inline-flex h-3 w-3 shrink-0 items-center justify-center text-sm text-brand-pink300"
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.dot }}
                  />
                  <span className="text-sm text-brand-gray900">
                    {t.report.diary.palette[id]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
