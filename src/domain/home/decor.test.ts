import { describe, it, expect } from 'vitest';
import { slotsForCount, countForSlot, PHOTO_COUNTS } from './decor';
import type { PhotoCount, PhotoSlot } from './decor';

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
