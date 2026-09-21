import { describe, it, expect } from 'vitest';
import {
  STICKER_RATIO_ASPECT,
  stickerRatioForAspect,
  centerCropRect,
  opaqueBounds,
  expandBounds,
  type PixelBounds,
} from './stickerFrame';

describe('STICKER_RATIO_ASPECT', () => {
  it('maps 1:1 to aspect 1 and 4:3 to aspect 0.75 (portrait 3:4 frame)', () => {
    expect(STICKER_RATIO_ASPECT).toEqual({ '1:1': 1, '4:3': 3 / 4 });
  });
});

describe('stickerRatioForAspect', () => {
  it('returns 4:3 for an aspect clearly below the cutoff', () => {
    expect(stickerRatioForAspect(0.5)).toBe('4:3');
  });

  it('returns 4:3 for an aspect just below the 0.875 cutoff', () => {
    expect(stickerRatioForAspect(0.87)).toBe('4:3');
  });

  it('returns 1:1 exactly at the 0.875 cutoff (inclusive)', () => {
    expect(stickerRatioForAspect(0.875)).toBe('1:1');
  });

  it('returns 1:1 for an aspect above the cutoff', () => {
    expect(stickerRatioForAspect(1)).toBe('1:1');
  });

  it('returns 1:1 for a wide (landscape) aspect', () => {
    expect(stickerRatioForAspect(1.5)).toBe('1:1');
  });
});

describe('centerCropRect', () => {
  it('crops the sides (left/right) when the source is wider than the target', () => {
    const rect = centerCropRect(400, 200, 1);
    expect(rect).toEqual({ sx: 100, sy: 0, sw: 200, sh: 200 });
  });

  it('crops the top/bottom when the source is taller than the target', () => {
    const rect = centerCropRect(200, 400, 1);
    expect(rect).toEqual({ sx: 0, sy: 100, sw: 200, sh: 200 });
  });

  it('returns the full frame untouched when the aspect already matches', () => {
    const rect = centerCropRect(300, 300, 1);
    expect(rect).toEqual({ sx: 0, sy: 0, sw: 300, sh: 300 });
  });

  it('keeps the cropped region centered and inside the original bounds (4:3 target)', () => {
    const rect = centerCropRect(1080, 1350, 3 / 4);
    expect(rect).toEqual({ sx: 33.75, sy: 0, sw: 1012.5, sh: 1350 });
    expect(rect.sx).toBeGreaterThanOrEqual(0);
    expect(rect.sx + rect.sw).toBeLessThanOrEqual(1080);
    expect(rect.sy).toBeGreaterThanOrEqual(0);
    expect(rect.sy + rect.sh).toBeLessThanOrEqual(1350);
  });
});

describe('opaqueBounds', () => {
  function transparentRgba(width: number, height: number): Uint8ClampedArray {
    return new Uint8ClampedArray(width * height * 4);
  }

  function setPixel(
    rgba: Uint8ClampedArray,
    width: number,
    x: number,
    y: number,
    alpha: number,
  ): void {
    const i = (y * width + x) * 4;
    rgba[i] = 255;
    rgba[i + 1] = 255;
    rgba[i + 2] = 255;
    rgba[i + 3] = alpha;
  }

  it('returns null when every pixel is fully transparent', () => {
    const rgba = transparentRgba(5, 5);
    expect(opaqueBounds(rgba, 5, 5, 10)).toBeNull();
  });

  it('returns a 1x1 box for a single opaque pixel', () => {
    const rgba = transparentRgba(5, 5);
    setPixel(rgba, 5, 2, 3, 255);
    expect(opaqueBounds(rgba, 5, 5, 10)).toEqual({ x: 2, y: 3, width: 1, height: 1 });
  });

  it('spans all four corners when they are the only opaque pixels', () => {
    const rgba = transparentRgba(5, 5);
    setPixel(rgba, 5, 0, 0, 255);
    setPixel(rgba, 5, 4, 0, 255);
    setPixel(rgba, 5, 0, 4, 255);
    setPixel(rgba, 5, 4, 4, 255);
    expect(opaqueBounds(rgba, 5, 5, 10)).toEqual({ x: 0, y: 0, width: 5, height: 5 });
  });

  it('excludes a pixel whose alpha exactly equals the threshold', () => {
    const rgba = transparentRgba(5, 5);
    setPixel(rgba, 5, 2, 2, 10);
    expect(opaqueBounds(rgba, 5, 5, 10)).toBeNull();
  });

  it('only counts pixels strictly above the threshold in a mixed image', () => {
    const rgba = transparentRgba(5, 5);
    setPixel(rgba, 5, 1, 1, 10); // == threshold, excluded
    setPixel(rgba, 5, 3, 3, 11); // > threshold, included
    expect(opaqueBounds(rgba, 5, 5, 10)).toEqual({ x: 3, y: 3, width: 1, height: 1 });
  });
});

describe('expandBounds', () => {
  const bounds5x5At10: PixelBounds = { x: 10, y: 10, width: 5, height: 5 };

  it('expands by the 1px downscale fudge factor when scale=1 and padding=0', () => {
    const result = expandBounds(bounds5x5At10, 1, 0, 100, 100);
    expect(result).toEqual({ x: 9, y: 9, width: 7, height: 7 });
  });

  it('scales thumbnail-space bounds up to full-resolution coordinates', () => {
    const result = expandBounds(bounds5x5At10, 0.25, 0, 1000, 1000);
    expect(result).toEqual({ x: 36, y: 36, width: 28, height: 28 });
  });

  it('adds the requested padding around the scaled bounds', () => {
    const result = expandBounds(bounds5x5At10, 1, 5, 100, 100);
    expect(result).toEqual({ x: 4, y: 4, width: 17, height: 17 });
  });

  it('clamps the top-left corner to 0 instead of going negative', () => {
    const bounds: PixelBounds = { x: 0, y: 0, width: 2, height: 2 };
    const result = expandBounds(bounds, 1, 0, 50, 50);
    expect(result).toEqual({ x: 0, y: 0, width: 3, height: 3 });
  });

  it('clamps the bottom-right corner to the full image size', () => {
    const bounds: PixelBounds = { x: 95, y: 95, width: 5, height: 5 };
    const result = expandBounds(bounds, 1, 0, 100, 100);
    expect(result).toEqual({ x: 94, y: 94, width: 6, height: 6 });
  });
});
