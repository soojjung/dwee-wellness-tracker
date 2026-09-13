import type { ColorPaletteId } from '@/types';
import { paletteFor } from '@/domain/event/palette';

interface CategoryChipProps {
  name: string;
  colorId: ColorPaletteId;
  /** `sm` for calendar badges; `md` matches the event-form row chip
   * and the rows of the expanded type list (Figma 256:19324 / 522:12637 —
   * 8px/3px padding, 14px medium). */
  size?: 'sm' | 'md';
  className?: string;
}

export function CategoryChip({ name, colorId, size = 'sm', className }: CategoryChipProps) {
  const p = paletteFor(colorId);
  return (
    <span
      className={
        'inline-flex items-center whitespace-nowrap rounded-full font-medium ' +
        (size === 'md'
          ? 'px-2 py-[3px] text-sm leading-normal'
          : 'px-2 py-0.5 text-xs leading-tight') +
        (className ? ` ${className}` : '')
      }
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      {name}
    </span>
  );
}
