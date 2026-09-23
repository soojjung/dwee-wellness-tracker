'use client';
import { useEffect } from 'react';

// Registers the dev-only test seed helpers on `window`. Rendered from the root
// layout so it lives above <AuthGuard>: e2e tests visit `/`, get redirected to
// `/login`, and still find `__dweeSeedPhase` because this bridge mounted before
// the redirect. The previous location (inside AppShell) never mounted when the
// user landed on /login, which broke `waitForFunction` in every spec.
export function DevBridge() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    void import('@/dev/seedForPhase').then(({ seedForPhase }) => {
      (window as unknown as { __dweeSeedPhase?: typeof seedForPhase }).__dweeSeedPhase =
        seedForPhase;
    });
    void import('@/dev/seedPhotos').then(({ seedPhotos }) => {
      (window as unknown as { __dweeSeedPhotos?: typeof seedPhotos }).__dweeSeedPhotos = seedPhotos;
    });
    // `__dweeSentryTest()` sends one handled exception — for checking the
    // Sentry pipeline end to end with NEXT_PUBLIC_SENTRY_DEBUG=1.
    void import('@/lib/monitoring/sentry').then(({ captureException }) => {
      (window as unknown as { __dweeSentryTest?: () => string }).__dweeSentryTest = () =>
        captureException(new Error('dwee sentry test event'));
    });
    void import('@/dev/ensureAnon').then(({ ensureAnon }) => {
      (window as unknown as { __dweeEnsureAnon?: typeof ensureAnon }).__dweeEnsureAnon = ensureAnon;
    });
  }, []);
  return null;
}
