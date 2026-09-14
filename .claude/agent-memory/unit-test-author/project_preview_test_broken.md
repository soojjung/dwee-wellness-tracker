---
name: project-preview-test-broken
description: (RESOLVED 2026-09-14) src/__preview__/grid.preview.test.tsx no longer exists; pnpm test:unit runs clean end-to-end
metadata:
  type: project
---

Earlier on 2026-09-14, `pnpm test:unit` reported a failing untracked suite at
`src/__preview__/grid.preview.test.tsx` (JSX parse error unrelated to domain/lib work). As of the
`src/domain/holiday/**` test pass later the same day, that file no longer exists in the working tree
and a full `pnpm test:unit` run passes cleanly (20 files / 375 tests, no failures, no untracked
`src/__preview__/`).

**Why kept as a memory:** so a future run doesn't waste time re-diagnosing a "pre-existing" failure
that isn't actually reproducible anymore — always verify with a fresh `pnpm test:unit` first rather
than trusting this note's original claim.

**How to apply:** Do not assume `src/__preview__/grid.preview.test.tsx` is still broken. If a similar
out-of-scope failure appears again (some `src/__preview__/**` or component preview harness), confirm it
independently, note it fresh, and still avoid fixing it here (out of scope — domain/lib only).
