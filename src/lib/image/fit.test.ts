import { describe, expect, it } from 'vitest';
import { fitWithin } from './fit';

describe('fitWithin', () => {
  it('scales a landscape photo so the width hits the max edge', () => {
    expect(fitWithin({ width: 4032, height: 3024 }, 2048)).toEqual({ width: 2048, height: 1536 });
  });

  it('scales a portrait photo so the height hits the max edge', () => {
    expect(fitWithin({ width: 3024, height: 4032 }, 2048)).toEqual({ width: 1536, height: 2048 });
  });

  it('leaves an image already within the limit untouched (never upscales)', () => {
    expect(fitWithin({ width: 1200, height: 800 }, 2048)).toEqual({ width: 1200, height: 800 });
  });

  it('leaves an image exactly at the limit untouched', () => {
    expect(fitWithin({ width: 2048, height: 1000 }, 2048)).toEqual({ width: 2048, height: 1000 });
  });

  it('rounds to whole pixels', () => {
    expect(fitWithin({ width: 3000, height: 1999 }, 2048)).toEqual({ width: 2048, height: 1365 });
  });

  it('keeps at least 1px on the short edge for extreme panoramas', () => {
    expect(fitWithin({ width: 100000, height: 10 }, 2048)).toEqual({ width: 2048, height: 1 });
  });

  it('returns a zero-size input as-is', () => {
    expect(fitWithin({ width: 0, height: 0 }, 2048)).toEqual({ width: 0, height: 0 });
  });
});
