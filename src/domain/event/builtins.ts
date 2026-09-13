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

/** Category pre-selected when the event form opens without an existing
 * event (Figma 256:19204 — "친구" is the default). */
export const DEFAULT_CATEGORY_KEY: BuiltinCategoryKey = 'friend';

interface CategoryLike {
  id: string;
  isBuiltIn: boolean;
  order: number;
}

/**
 * Resolve the default category for a new event. Built-ins carry no key in
 * storage, so the default is matched by its seed `order`; falls back to
 * the first category (or null when the list is empty).
 */
export function defaultCategoryId(categories: readonly CategoryLike[]): string | null {
  const seed = BUILTIN_CATEGORY_SEEDS.find((s) => s.key === DEFAULT_CATEGORY_KEY);
  const builtin = seed ? categories.find((c) => c.isBuiltIn && c.order === seed.order) : undefined;
  return builtin?.id ?? categories[0]?.id ?? null;
}
