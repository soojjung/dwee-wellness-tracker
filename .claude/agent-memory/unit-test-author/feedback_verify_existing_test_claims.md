---
name: feedback-verify-existing-test-claims
description: Caller (e.g. /commit orchestrator) sometimes lists a file as "has existing tests, only check for regressions" when no test file actually exists — verify before trusting the claim.
metadata:
  type: feedback
---

When a caller prompt (typically `/commit` STEP 4.5) says a module "already has tests, just check for missing cases from this diff," don't take that at face value — `find`/`ls` for the `*.test.ts` file first.

**Why:** On 2026-09-21, the `/commit` orchestrator listed `src/domain/cycle/aggregate.ts` alongside `status.ts`/`chartScale.ts`/`cycleGap.ts` as a file with "existing tests, verify-only." `status.ts`, `chartScale.ts`, and `cycleGap.ts` did have test files (confirmed via `ls`) — but `aggregate.ts` had zero test coverage; it had simply never been tested despite being pure `src/domain/**` code in scope since day one. The "verify-only" framing would have caused it to be silently skipped.

**How to apply:** Before treating a module as "check-only," confirm its `.test.ts` sibling exists. If it doesn't:
1. Don't silently skip it (the caller's instruction assumed a baseline that isn't there).
2. Don't silently expand full scope without a signal either — write the missing baseline test suite (it's squarely in the "always test" `src/domain/**`/`src/lib/**` scope from this agent's own charter) and call out in the final report that this file had no prior coverage and a full suite was added beyond the literal "verify-only" instruction.
3. Note it clearly under a `> No test file existed for X before this session` callout at the top of the paired `.cases.md`, so the next agent/reader understands why full cases appear despite the "regression-check-only" framing in the calling prompt.
