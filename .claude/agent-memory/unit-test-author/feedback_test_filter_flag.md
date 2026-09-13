---
name: feedback-test-filter-flag
description: pnpm test:unit -- <pattern> does not filter to matching files in this repo; use npx vitest run <path> to isolate a single test file
metadata:
  type: feedback
---

`pnpm test:unit -- weekLanes.test.ts` still ran the full suite (all 17 files, 321 tests) instead of
filtering to just the matching file — the `--` pass-through didn't behave as a vitest filename filter
here. `npx vitest run src/domain/event/weekLanes.test.ts` (exact path) did isolate correctly and ran
only that file's 17 tests.

**Why:** Needed an isolated pass/fail count for the new test file without the pre-existing unrelated
`src/__preview__/grid.preview.test.tsx` failure ([[project_preview_test_broken]]) muddying the read on
whether the new tests themselves passed.

**How to apply:** To verify just-written tests in isolation, run `npx vitest run <exact/path/to/file.test.ts>`
rather than `pnpm test:unit -- <pattern>`. Still run the plain `pnpm test:unit` once at the end for the
official full-suite number to report/record in `.cases.md`.
