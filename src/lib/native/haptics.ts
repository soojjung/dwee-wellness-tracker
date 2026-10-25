import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * A light tap like the iOS tab bar's, for taps that should feel pressed.
 * Fire-and-forget: a missing Taptic Engine must never block the tap.
 * No-ops on the web build.
 */
export function tapHaptic(): void {
  if (!Capacitor.isNativePlatform()) return;
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
}
