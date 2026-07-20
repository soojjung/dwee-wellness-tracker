export const PHOTO_COUNTS = [1, 2, 4] as const;
export type PhotoCount = (typeof PHOTO_COUNTS)[number];

// Slots 0..6 back three independent photo sets so switching counts preserves
// each set. count=1 → [0], count=2 → [1,2], count=4 → [3,4,5,6].
export const MAX_PHOTO_SLOTS = 7;
export const PHOTO_SLOTS = [0, 1, 2, 3, 4, 5, 6] as const;
export type PhotoSlot = (typeof PHOTO_SLOTS)[number];

const SLOTS_BY_COUNT: Record<PhotoCount, readonly PhotoSlot[]> = {
  1: [0],
  2: [1, 2],
  4: [3, 4, 5, 6],
};

export function slotsForCount(count: PhotoCount): readonly PhotoSlot[] {
  return SLOTS_BY_COUNT[count];
}

export function countForSlot(slot: PhotoSlot): PhotoCount {
  if (slot === 0) return 1;
  if (slot === 1 || slot === 2) return 2;
  return 4;
}

export const TEXT_POSITIONS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
export type TextPosition = (typeof TEXT_POSITIONS)[number];

export const MAIN_TEXT_MAX = 40;
export const SUB_TEXT_MAX = 20;

export const DEFAULT_TEXT_POSITION: TextPosition = 'bottomLeft';

export const TEXT_ORDERS = ['mainFirst', 'subFirst'] as const;
export type TextOrder = (typeof TEXT_ORDERS)[number];
export const DEFAULT_TEXT_ORDER: TextOrder = 'mainFirst';
