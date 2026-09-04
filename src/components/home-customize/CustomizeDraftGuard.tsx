'use client';
import { useEffect, type ReactNode } from 'react';
import { useMediaStore } from '@/store/mediaStore';

interface CustomizeDraftGuardProps {
  children: ReactNode;
}

/**
 * Discards the customize photo draft when the user leaves the
 * /home/customize/* subtree via ANY exit vector — browser back, tab close,
 * deep link elsewhere. Mounts once when the layout wrapping this tree
 * mounts; unmounts only when the user is no longer on a customize route.
 *
 * Explicit exits (header ← arrow → discardPhotoDraft, "Done editing" →
 * commitPhotoDraft) leave the draft in an inactive state before this
 * cleanup runs, so the trailing discard is a safe no-op in those cases.
 * The whole point of this guard is to catch browser-back / stray
 * navigation, which previously left the draft alive in the store and
 * surfaced stale picks the next time the user opened customize.
 */
export function CustomizeDraftGuard({ children }: CustomizeDraftGuardProps) {
  const discardPhotoDraft = useMediaStore((s) => s.discardPhotoDraft);
  useEffect(() => {
    return () => {
      discardPhotoDraft();
    };
  }, [discardPhotoDraft]);
  return <>{children}</>;
}
