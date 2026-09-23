'use client';
import { useEffect } from 'react';
import { setLightStatusBar } from '@/lib/native/statusBar';

/**
 * One-time native shell setup, rendered from the root layout so it covers
 * the intro / login / legal groups as well as the tabbed app. Web: no-op.
 */
export function NativeChrome() {
  useEffect(() => {
    void setLightStatusBar();
  }, []);
  return null;
}
