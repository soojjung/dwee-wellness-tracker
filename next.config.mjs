import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    // Sentry release tag (`dwee@<version>`) — must match `pnpm sentry:sourcemaps`.
    NEXT_PUBLIC_APP_VERSION: version,
    // Public web origin for links the app hands out (share pages). Inside the
    // native shell `window.location.origin` is `capacitor://localhost`, which
    // nobody can open, so client code needs the real site URL at build time.
    NEXT_PUBLIC_SITE_URL: process.env.SITE_URL ?? '',
  },
  // Emitted only so `pnpm sentry:sourcemaps` can upload them; the script
  // deletes the .map files from out/ afterwards.
  productionBrowserSourceMaps: true,
};

export default nextConfig;
