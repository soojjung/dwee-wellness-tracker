import type { ColorPaletteId } from '@/types/eventCategory';

export interface PaletteEntry {
  id: ColorPaletteId;
  /** Badge / chip background */
  bg: string;
  /** Badge / chip text */
  fg: string;
  /** Small dot indicator (used in palette picker) */
  dot: string;
}

export const PALETTE_IDS: readonly ColorPaletteId[] = [
  'pink',
  'lavender',
  'gray',
  'mint',
  'melon',
  'apricot',
  'peach',
] as const;

export const PALETTE: Readonly<Record<ColorPaletteId, PaletteEntry>> = {
  pink: { id: 'pink', bg: '#FDE2EF', fg: '#AE0063', dot: '#F689BC' },
  lavender: { id: 'lavender', bg: '#EDE8F8', fg: '#4C3C87', dot: '#7D5ACF' },
  gray: { id: 'gray', bg: '#F0EEEF', fg: '#353434', dot: '#B9B7B8' },
  mint: { id: 'mint', bg: '#D4F2E7', fg: '#1E5C40', dot: '#45C097' },
  melon: { id: 'melon', bg: '#E8F4C7', fg: '#556B14', dot: '#A6C842' },
  apricot: { id: 'apricot', bg: '#FCE8CD', fg: '#8A4E14', dot: '#E89954' },
  peach: { id: 'peach', bg: '#FCE0D7', fg: '#8A3E28', dot: '#E88568' },
};

export function paletteFor(id: ColorPaletteId): PaletteEntry {
  return PALETTE[id];
}
