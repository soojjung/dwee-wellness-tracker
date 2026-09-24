import { afterEach, describe, expect, it } from 'vitest';
import { markSplashShown, resetSplashClock, splashRemainingMs } from './splashClock';

afterEach(() => {
  resetSplashClock();
});

describe('splashRemainingMs', () => {
  it('returns the full hold when the splash was never marked', () => {
    expect(splashRemainingMs(2000, 5000)).toBe(2000);
  });

  it('counts from the mark, not from navigation start', () => {
    markSplashShown(3000);
    expect(splashRemainingMs(2000, 3500)).toBe(1500);
  });

  it('returns 0 once the hold has passed', () => {
    markSplashShown(1000);
    expect(splashRemainingMs(2000, 3000)).toBe(0);
    expect(splashRemainingMs(2000, 9000)).toBe(0);
  });

  it('keeps the first mark when marked again', () => {
    markSplashShown(1000);
    markSplashShown(2500);
    expect(splashRemainingMs(2000, 2500)).toBe(500);
  });
});
