import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Every dwee surface is light (gray50 / gray200 / the pink auth backdrop),
 * so the OS status bar needs dark glyphs. Only the camera viewfinder is dark
 * and flips it for as long as it is open. No-ops on the web build.
 */
export async function setLightStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await StatusBar.setStyle({ style: Style.Light }).catch(() => undefined);
}

export async function setDarkStatusBar(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  await StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
}
