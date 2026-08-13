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

// -------- PhotoTransform (non-destructive crop) --------
// Stored per slot alongside the original blob. The user's original photo is
// never rewritten — pan/zoom is expressed as a transform applied at render
// time. Offsets are normalized to the current cell (fraction of cell width /
// height) so the same transform renders identically at any cell size that
// preserves aspect ratio (edit / preview / home hero all match by design).
export interface PhotoTransform {
  /** 1 = fit-cover baseline, up to PHOTO_TRANSFORM_MAX_SCALE = 4×. */
  scale: number;
  /** Pan X in units of cell width. Positive = image shifts right in cell. */
  offsetXNorm: number;
  /** Pan Y in units of cell height. */
  offsetYNorm: number;
}

export const PHOTO_TRANSFORM_MIN_SCALE = 1;
export const PHOTO_TRANSFORM_MAX_SCALE = 4;
const PHOTO_TRANSFORM_EPSILON = 1e-3;

export const DEFAULT_PHOTO_TRANSFORM: PhotoTransform = {
  scale: 1,
  offsetXNorm: 0,
  offsetYNorm: 0,
};

export function isPhotoTransformEdited(tx: PhotoTransform | null | undefined): boolean {
  if (!tx) return false;
  return (
    Math.abs(tx.scale - 1) > PHOTO_TRANSFORM_EPSILON ||
    Math.abs(tx.offsetXNorm) > PHOTO_TRANSFORM_EPSILON ||
    Math.abs(tx.offsetYNorm) > PHOTO_TRANSFORM_EPSILON
  );
}

export function photoTransformEqual(
  a: PhotoTransform | null | undefined,
  b: PhotoTransform | null | undefined,
): boolean {
  const A = a ?? DEFAULT_PHOTO_TRANSFORM;
  const B = b ?? DEFAULT_PHOTO_TRANSFORM;
  return (
    Math.abs(A.scale - B.scale) <= PHOTO_TRANSFORM_EPSILON &&
    Math.abs(A.offsetXNorm - B.offsetXNorm) <= PHOTO_TRANSFORM_EPSILON &&
    Math.abs(A.offsetYNorm - B.offsetYNorm) <= PHOTO_TRANSFORM_EPSILON
  );
}

/** Runtime guard for values loaded from storage / remote. */
export function isPhotoTransform(v: unknown): v is PhotoTransform {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.scale === 'number' &&
    Number.isFinite(o.scale) &&
    typeof o.offsetXNorm === 'number' &&
    Number.isFinite(o.offsetXNorm) &&
    typeof o.offsetYNorm === 'number' &&
    Number.isFinite(o.offsetYNorm)
  );
}

export interface RenderSize {
  w: number;
  h: number;
}

export interface RenderedTransform {
  renderedW: number;
  renderedH: number;
  offsetPxX: number;
  offsetPxY: number;
}

/**
 * Given the image natural size and the current cell size, project a stored
 * (normalized) transform into pixel values suitable for CSS width/height and
 * a translate() applied on top of a centered position.
 */
export function computePhotoRender(
  tx: PhotoTransform,
  natural: RenderSize,
  cell: RenderSize,
): RenderedTransform {
  if (natural.w <= 0 || natural.h <= 0 || cell.w <= 0 || cell.h <= 0) {
    return { renderedW: cell.w, renderedH: cell.h, offsetPxX: 0, offsetPxY: 0 };
  }
  const baseScale = Math.max(cell.w / natural.w, cell.h / natural.h);
  const k = baseScale * tx.scale;
  return {
    renderedW: natural.w * k,
    renderedH: natural.h * k,
    offsetPxX: tx.offsetXNorm * cell.w,
    offsetPxY: tx.offsetYNorm * cell.h,
  };
}

/**
 * Clamp scale to [1, MAX] and clamp the pan so the image cannot expose empty
 * space in the cell. Input offsets are normalized to `cell`; output stays
 * normalized so callers can persist directly.
 */
export function clampPhotoTransform(
  tx: PhotoTransform,
  natural: RenderSize,
  cell: RenderSize,
): PhotoTransform {
  const scale = Math.min(
    PHOTO_TRANSFORM_MAX_SCALE,
    Math.max(PHOTO_TRANSFORM_MIN_SCALE, tx.scale),
  );
  if (natural.w <= 0 || cell.w <= 0) return { ...tx, scale };
  const baseScale = Math.max(cell.w / natural.w, cell.h / natural.h);
  const k = baseScale * scale;
  const renderedW = natural.w * k;
  const renderedH = natural.h * k;
  const maxPxX = Math.max(0, (renderedW - cell.w) / 2);
  const maxPxY = Math.max(0, (renderedH - cell.h) / 2);
  const maxNormX = maxPxX / cell.w;
  const maxNormY = maxPxY / cell.h;
  return {
    scale,
    offsetXNorm: Math.min(maxNormX, Math.max(-maxNormX, tx.offsetXNorm)),
    offsetYNorm: Math.min(maxNormY, Math.max(-maxNormY, tx.offsetYNorm)),
  };
}

export const TEXT_POSITIONS = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const;
export type TextPosition = (typeof TEXT_POSITIONS)[number];

export const MAIN_TEXT_MAX = 40;
export const SUB_TEXT_MAX = 20;

export const DEFAULT_TEXT_POSITION: TextPosition = 'bottomLeft';

export const TEXT_ORDERS = ['mainFirst', 'subFirst'] as const;
export type TextOrder = (typeof TEXT_ORDERS)[number];
export const DEFAULT_TEXT_ORDER: TextOrder = 'mainFirst';
