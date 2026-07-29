import type { ColorPaletteId } from '@/types/eventCategory';

export type BuiltinCategoryKey = 'family' | 'friend' | 'work' | 'club';

export interface BuiltinCategorySeed {
  key: BuiltinCategoryKey;
  colorId: ColorPaletteId;
  order: number;
}

export const BUILTIN_CATEGORY_SEEDS: readonly BuiltinCategorySeed[] = [
  { key: 'family', colorId: 'pink', order: 0 },
  { key: 'friend', colorId: 'lavender', order: 1 },
  { key: 'work', colorId: 'gray', order: 2 },
  { key: 'club', colorId: 'mint', order: 3 },
] as const;
