import { createRequire } from 'node:module';

const { version } = createRequire(import.meta.url)('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  // Sentry release tag (`dwee@<version>`) — must match `pnpm sentry:sourcemaps`.
  env: { NEXT_PUBLIC_APP_VERSION: version },
  // Emitted only so `pnpm sentry:sourcemaps` can upload them; the script
  // deletes the .map files from out/ afterwards.
  productionBrowserSourceMaps: true,
};

export default nextConfig;
