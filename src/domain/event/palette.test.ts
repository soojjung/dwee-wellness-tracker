import { describe, it, expect } from 'vitest';
import { paletteFor, PALETTE, PALETTE_IDS } from './palette';

describe('PALETTE_IDS', () => {
  it('contains exactly 7 palette entries', () => {
    expect(PALETTE_IDS).toHaveLength(7);
  });

  it('contains all expected color ids', () => {
    expect([...PALETTE_IDS].sort()).toEqual(
      ['apricot', 'gray', 'lavender', 'melon', 'mint', 'peach', 'pink'].sort(),
    );
  });
});

describe('paletteFor', () => {
  it('returns the correct bg for pink', () => {
    expect(paletteFor('pink').bg).toBe('#FDE2EF');
  });

  it('returns the correct fg for pink', () => {
    expect(paletteFor('pink').fg).toBe('#AE0063');
  });

  it('returns the correct dot for pink', () => {
    expect(paletteFor('pink').dot).toBe('#F689BC');
  });

  it('returns the correct bg for mint', () => {
    expect(paletteFor('mint').bg).toBe('#D4F2E7');
  });

  it('returns the correct fg for lavender', () => {
    expect(paletteFor('lavender').fg).toBe('#4C3C87');
  });

  it('returns an entry whose id field matches the requested id', () => {
    for (const id of PALETTE_IDS) {
      expect(paletteFor(id).id).toBe(id);
    }
  });

  it('every PALETTE entry has non-empty bg, fg, and dot strings', () => {
    for (const id of PALETTE_IDS) {
      const entry = PALETTE[id];
      expect(entry.bg.length).toBeGreaterThan(0);
      expect(entry.fg.length).toBeGreaterThan(0);
      expect(entry.dot.length).toBeGreaterThan(0);
    }
  });
});
