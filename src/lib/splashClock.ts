// When the splash was first on screen in this document, in `performance.now()`
// time. The minimum splash hold counts from here rather than from navigation
// start: on a real device the WebView boot and bundle load can eat the whole
// window before React mounts, and the splash then never gets its 2 seconds.
// Module-scoped, so it survives client-side navigation but resets on reload.

let shownAt: number | null = null;

/** Records the first time only; later calls keep the original mark. */
export function markSplashShown(now: number): void {
  if (shownAt === null) shownAt = now;
}

/** Ms still left before `minMs` of splash has been shown. Unmarked counts as just shown. */
export function splashRemainingMs(minMs: number, now: number): number {
  const start = shownAt ?? now;
  return Math.max(0, minMs - (now - start));
}

/** Test-only: forget the mark. */
export function resetSplashClock(): void {
  shownAt = null;
}
