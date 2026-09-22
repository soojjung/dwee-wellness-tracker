import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.innerglow.dwee',
  appName: 'dwee',
  webDir: 'out',
  // brand.gray200 — same as `themeColor` and the LaunchScreen storyboard
  // (scripts/setup-ios.mjs), so the storyboard → WebView hand-off has no
  // flash. There is deliberately no @capacitor/splash-screen: the plain
  // storyboard is the splash, and the first-run intro has its own.
  backgroundColor: '#F5F3F4',
  plugins: {
    Keyboard: {
      // Shrink the WebView when the keyboard opens so bottom sheets and their
      // inputs (EventFormSheet, category form) sit above it instead of under it.
      resize: 'native',
    },
  },
};

export default config;
