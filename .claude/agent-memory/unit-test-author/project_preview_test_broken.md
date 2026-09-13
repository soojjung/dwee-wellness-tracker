---
name: project-preview-test-broken
description: src/__preview__/grid.preview.test.tsx fails pnpm test:unit with a pre-existing JSX parse error, unrelated to domain/lib test changes
metadata:
  type: project
---

`pnpm test:unit` reports 1 failed suite: `src/__preview__/grid.preview.test.tsx` (0 tests, fails at
import-analysis time) because `src/components/diary/DiaryMonthGrid.tsx` contains JSX that vite's
import-analysis chokes on when loaded from that preview test path. Confirmed as of 2026-09-14 while
adding `src/domain/event/weekLanes.test.ts` — the failure is present on a clean run before and after
that change, `src/__preview__/` is untracked (`git status` shows `??`), and `DiaryMonthGrid.tsx` is
modified by unrelated in-progress diary work, not by this agent.

**Why:** `src/__preview__/**` is outside this agent's scope (not `src/domain/**` or `src/lib/**`), so
never try to fix it here.

**How to apply:** When `pnpm test:unit` shows "1 failed suite" from `src/__preview__/grid.preview.test.tsx`
alongside all real test files passing, treat it as pre-existing/out-of-scope noise — do not diagnose it
as caused by the tests just added, and do not attempt to fix `DiaryMonthGrid.tsx`. Report the domain/lib
pass count from the filtered run (see [[feedback_test_filter_flag]]) instead of the full-suite summary.
If asked to fix it, that's component/preview test territory, hand off rather than patching here.
