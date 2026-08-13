import { describe, it, expect } from 'vitest';
import {
  slotsForCount,
  countForSlot,
  PHOTO_COUNTS,
  DEFAULT_PHOTO_TRANSFORM,
  clampPhotoTransform,
  computePhotoRender,
  isPhotoTransform,
  isPhotoTransformEdited,
  photoTransformEqual,
} from './decor';
import type { PhotoCount, PhotoSlot, PhotoTransform } from './decor';

describe('slotsForCount', () => {
  it('returns [0] for count=1', () => {
    expect(slotsForCount(1)).toEqual([0]);
  });

  it('returns [1, 2] for count=2', () => {
    expect(slotsForCount(2)).toEqual([1, 2]);
  });

  it('returns [3, 4, 5, 6] for count=4', () => {
    expect(slotsForCount(4)).toEqual([3, 4, 5, 6]);
  });

  it('slot arrays are non-overlapping across all counts', () => {
    const all = PHOTO_COUNTS.flatMap((c) => [...slotsForCount(c)]);
    const unique = new Set(all);
    expect(unique.size).toBe(all.length);
  });

  it('slot arrays together cover all 7 slots exactly once', () => {
    const all = PHOTO_COUNTS.flatMap((c) => [...slotsForCount(c)]).sort((a, b) => a - b);
    expect(all).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('countForSlot', () => {
  it('returns 1 for slot 0', () => {
    expect(countForSlot(0)).toBe(1);
  });

  it('returns 2 for slot 1', () => {
    expect(countForSlot(1)).toBe(2);
  });

  it('returns 2 for slot 2', () => {
    expect(countForSlot(2)).toBe(2);
  });

  it('returns 4 for slot 3', () => {
    expect(countForSlot(3)).toBe(4);
  });

  it('returns 4 for slot 4', () => {
    expect(countForSlot(4)).toBe(4);
  });

  it('returns 4 for slot 5', () => {
    expect(countForSlot(5)).toBe(4);
  });

  it('returns 4 for slot 6', () => {
    expect(countForSlot(6)).toBe(4);
  });
});

describe('isPhotoTransformEdited', () => {
  it('returns false for null / undefined / default', () => {
    expect(isPhotoTransformEdited(null)).toBe(false);
    expect(isPhotoTransformEdited(undefined)).toBe(false);
    expect(isPhotoTransformEdited(DEFAULT_PHOTO_TRANSFORM)).toBe(false);
  });

  it('returns false for near-identity within epsilon (floating-point drift)', () => {
    expect(
      isPhotoTransformEdited({ scale: 1 + 1e-6, offsetXNorm: -1e-6, offsetYNorm: 1e-6 }),
    ).toBe(false);
  });

  it('returns true when scale differs meaningfully', () => {
    expect(isPhotoTransformEdited({ scale: 1.5, offsetXNorm: 0, offsetYNorm: 0 })).toBe(true);
  });

  it('returns true when either offset differs meaningfully', () => {
    expect(isPhotoTransformEdited({ scale: 1, offsetXNorm: 0.1, offsetYNorm: 0 })).toBe(true);
    expect(isPhotoTransformEdited({ scale: 1, offsetXNorm: 0, offsetYNorm: -0.05 })).toBe(true);
  });
});

describe('photoTransformEqual', () => {
  it('treats null and default as equal', () => {
    expect(photoTransformEqual(null, DEFAULT_PHOTO_TRANSFORM)).toBe(true);
    expect(photoTransformEqual(undefined, null)).toBe(true);
  });

  it('accepts differences within epsilon', () => {
    const a: PhotoTransform = { scale: 1.5, offsetXNorm: 0.2, offsetYNorm: -0.1 };
    const b: PhotoTransform = { scale: 1.5 + 1e-6, offsetXNorm: 0.2, offsetYNorm: -0.1 + 1e-6 };
    expect(photoTransformEqual(a, b)).toBe(true);
  });

  it('rejects visible differences', () => {
    const a: PhotoTransform = { scale: 1.5, offsetXNorm: 0.2, offsetYNorm: -0.1 };
    const b: PhotoTransform = { scale: 1.6, offsetXNorm: 0.2, offsetYNorm: -0.1 };
    expect(photoTransformEqual(a, b)).toBe(false);
  });
});

describe('isPhotoTransform (storage guard)', () => {
  it('accepts a well-formed transform', () => {
    expect(isPhotoTransform({ scale: 1.2, offsetXNorm: 0, offsetYNorm: 0 })).toBe(true);
  });

  it('rejects non-objects and missing fields', () => {
    expect(isPhotoTransform(null)).toBe(false);
    expect(isPhotoTransform(undefined)).toBe(false);
    expect(isPhotoTransform('scale=1')).toBe(false);
    expect(isPhotoTransform({ scale: 1 })).toBe(false);
    expect(isPhotoTransform({ scale: 1, offsetXNorm: 0 })).toBe(false);
  });

  it('rejects non-finite numbers', () => {
    expect(isPhotoTransform({ scale: NaN, offsetXNorm: 0, offsetYNorm: 0 })).toBe(false);
    expect(
      isPhotoTransform({ scale: 1, offsetXNorm: Infinity, offsetYNorm: 0 }),
    ).toBe(false);
  });
});

describe('computePhotoRender', () => {
  it('projects identity transform to full-cover dimensions', () => {
    // square cell 100x100, square image 200x200 → baseScale=0.5, rendered=100x100
    const r = computePhotoRender(
      DEFAULT_PHOTO_TRANSFORM,
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.renderedW).toBeCloseTo(100);
    expect(r.renderedH).toBeCloseTo(100);
    expect(r.offsetPxX).toBe(0);
    expect(r.offsetPxY).toBe(0);
  });

  it('cover-fits a wider image (crops horizontally)', () => {
    // cell 100x100, image 400x200 → baseScale = max(0.25, 0.5) = 0.5
    // rendered = 400*0.5 x 200*0.5 = 200 x 100 (wider than cell → horizontal crop)
    const r = computePhotoRender(
      DEFAULT_PHOTO_TRANSFORM,
      { w: 400, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.renderedW).toBeCloseTo(200);
    expect(r.renderedH).toBeCloseTo(100);
  });

  it('denormalizes offsets to pixel space', () => {
    const r = computePhotoRender(
      { scale: 1, offsetXNorm: 0.25, offsetYNorm: -0.1 },
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.offsetPxX).toBeCloseTo(25);
    expect(r.offsetPxY).toBeCloseTo(-10);
  });

  it('applies scale multiplicatively on top of baseScale', () => {
    const r = computePhotoRender(
      { scale: 2, offsetXNorm: 0, offsetYNorm: 0 },
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    // 2x zoom on identity-fitting image → 200x200
    expect(r.renderedW).toBeCloseTo(200);
    expect(r.renderedH).toBeCloseTo(200);
  });

  it('is safe when natural or cell is zero', () => {
    const r = computePhotoRender(
      DEFAULT_PHOTO_TRANSFORM,
      { w: 0, h: 0 },
      { w: 100, h: 100 },
    );
    expect(r.renderedW).toBe(100);
    expect(r.renderedH).toBe(100);
  });
});

describe('clampPhotoTransform', () => {
  it('clamps scale below 1 up to 1', () => {
    const r = clampPhotoTransform(
      { scale: 0.5, offsetXNorm: 0, offsetYNorm: 0 },
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.scale).toBe(1);
  });

  it('clamps scale above 4 down to 4', () => {
    const r = clampPhotoTransform(
      { scale: 10, offsetXNorm: 0, offsetYNorm: 0 },
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.scale).toBe(4);
  });

  it('pins offsets to 0 when at scale=1 with square cover fit', () => {
    // A square image at square cell exactly covers → no room to pan.
    const r = clampPhotoTransform(
      { scale: 1, offsetXNorm: 0.5, offsetYNorm: -0.5 },
      { w: 200, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.offsetXNorm).toBeCloseTo(0);
    expect(r.offsetYNorm).toBeCloseTo(0);
  });

  it('allows pan up to the crop margin when image extends beyond the cell', () => {
    // cell 100x100, image 400x200, baseScale=0.5 → rendered 200x100.
    // Horizontal slack = (200 - 100) / 2 = 50 px → maxNorm = 50/100 = 0.5.
    const r = clampPhotoTransform(
      { scale: 1, offsetXNorm: 10, offsetYNorm: 10 },
      { w: 400, h: 200 },
      { w: 100, h: 100 },
    );
    expect(r.offsetXNorm).toBeCloseTo(0.5);
    // Rendered height equals cell height → no vertical slack → clamped to 0.
    expect(r.offsetYNorm).toBeCloseTo(0);
  });

  it('is safe when natural is zero (no image loaded)', () => {
    const r = clampPhotoTransform(
      { scale: 2, offsetXNorm: 999, offsetYNorm: -999 },
      { w: 0, h: 0 },
      { w: 100, h: 100 },
    );
    expect(r.scale).toBe(2);
    // Offsets pass through unchanged when we can't compute bounds.
    expect(r.offsetXNorm).toBe(999);
    expect(r.offsetYNorm).toBe(-999);
  });
});

describe('slotsForCount / countForSlot — self-inverse mapping', () => {
  it('every slot in slotsForCount(1) maps back to count 1', () => {
    const count: PhotoCount = 1;
    expect(slotsForCount(count).every((s: PhotoSlot) => countForSlot(s) === count)).toBe(true);
  });

  it('every slot in slotsForCount(2) maps back to count 2', () => {
    const count: PhotoCount = 2;
    expect(slotsForCount(count).every((s: PhotoSlot) => countForSlot(s) === count)).toBe(true);
  });

  it('every slot in slotsForCount(4) maps back to count 4', () => {
    const count: PhotoCount = 4;
    expect(slotsForCount(count).every((s: PhotoSlot) => countForSlot(s) === count)).toBe(true);
  });
});
