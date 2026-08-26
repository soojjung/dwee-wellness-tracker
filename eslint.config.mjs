import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Static export (`output: 'export'`) + `images: { unoptimized: true }` for
    // Capacitor disables Next.js image optimization entirely — `<Image />`
    // provides no LCP/bandwidth benefit over `<img>` here, and most img usages
    // point at user-uploaded blobs / object URLs that can't be optimized anyway.
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
