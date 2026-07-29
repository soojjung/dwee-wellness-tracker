import type { ColorPaletteId } from '@/types';
import { paletteFor } from '@/domain/event/palette';

interface CategoryChipProps {
  name: string;
  colorId: ColorPaletteId;
  className?: string;
}

export function CategoryChip({ name, colorId, className }: CategoryChipProps) {
  const p = paletteFor(colorId);
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-tight' +
        (className ? ` ${className}` : '')
      }
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      {name}
    </span>
  );
}
