---
name: dwee doc locations and sync rules
description: Where docs live, which files must stay in sync with CLAUDE.md rule changes
type: project
---

## Key doc locations

- `docs/flows/home.md` — home screen state machine + data flow. Must be updated when HomeScreen.tsx flow changes.
- `docs/flows/calendar.md` — calendar screen flow including DayDetailSheet action buttons + PeriodRangeDialog from calendar.
- `docs/flows/customize.md` — fullscreen customize flow (HomeCustomize + PhotoEdit).
- `docs/flows/log.md` — /log page flow: PeriodHistorySection (calendar/list toggle) + LogEntryDialog (period + condition combined). Added in period-record-rewrite PR.
- `docs/flows/diagnose.md` — DiagnoseScreen state machine (picker → preview → loading → result | error) for `/magazine/personal-body-type/diagnose`. Added in M2.0–M2.3 magazine PR.
- `docs/architecture/data-layer.md` — dependency direction + repository inventory. Must be updated when any new Repository interface is added.
- `docs/product/mvp1-spec.md` — original product spec with persona, KPI, condition enums.
- `.claude/rules/health-copy.md` — copy tone rules (diet/medical copy restrictions).
- `.claude/rules/screens.md` — flow registry (links to all `docs/flows/*.md`). Must be updated when a new flow doc is added.
- `supabase/README.md` — Supabase migration + adapter guide. Adapter code lives at `src/data/adapters/supabase/` (already moved from `supabase/adapters/`).

## Active repositories (as of schema v4)

Period / Condition / Settings / Media / Bookmark. Each of the first four has both IndexedDB and Supabase adapter implementations. `BookmarkRepository` has only an IndexedDB adapter (`IndexedDBBookmarkAdapter`) — no Supabase adapter yet. `data/index.ts` currently wires IndexedDB for all; Supabase wiring is MVP2.2.

## Route groups (fullscreen added)

Three route groups now exist: `(auth)`, `(app)`, `(fullscreen)`. The `(fullscreen)` group hosts immersive editing screens with no AppShell or BottomTabNav. Currently: `/home/customize`, `/home/customize/edit-photos`, `/magazine/[slug]` (article reader), `/magazine/bookmarks`, `/magazine/personal-body-type/diagnose`, `/magazine/personal-body-type/diagnose/result`.

## Magazine feature (M2.0–M2.2)

- BottomTabNav: `insights` tab replaced by `magazine` tab. `src/app/(app)/insights/` route removed; `src/components/insights/InsightsScreen.tsx` removed. `InsightCard.tsx` and `lib/insight/` preserved for home-embedded pattern cards.
- `(app)/magazine/` — list only (no slug sub-route here; article detail moved to fullscreen).
- `(fullscreen)/magazine/[slug]/` — article fullscreen reader.
- `(fullscreen)/magazine/bookmarks/` — bookmarked articles list.
- `(fullscreen)/magazine/personal-body-type/diagnose/` — 3-slot picker (front · side · back). `PhotoPicker.tsx` was deleted; slot inputs are inline in `DiagnoseScreen.tsx`. `Step` type is now `select | loading | error` (no preview or result steps — result is a separate route).
- `(fullscreen)/magazine/personal-body-type/diagnose/result/` — `DiagnoseResultScreen`. Receives report via `sessionStorage` key `REPORT_SESSION_KEY`. Handles PNG export.
- `ArticleCard.tsx` was deleted. Card rendering is now inline in `MagazineScreen`.
- `src/data/magazine/articles.ts` — 4 articles total: personal-body-type, cycle-phases, cycle-length-35-days, period-supplements. Dates use ISO format (`YYYY-MM-DD`); dot format caused `RangeError`.
- `supabase/functions/body-type-analyze/` — OpenAI gpt-4o Vision. Photo is never stored. Rate-limited to 5 calls/day via `supabase/migrations/0003_body_type_calls.sql`.
- CLAUDE.md "명시적 제외" ML/AI clause now has server-side LLM exception for explicit-user-trigger cases (magazine diagnose). README must reflect same exception text.

## Figma sync scope: home snapshots only

STEP 8 in `.claude/commands/commit.md` syncs only `tests/snapshots/ko/home-*.png` to Figma "Snapshots (ko)". The trigger glob is intentionally `home-*.png`, not `*.png`. `customize-*.png`, `log-*.png`, and `photo-edit-*.png` are e2e-only baselines and must NOT be pushed to Figma. If new screen specs are added to `tests/`, the Figma sync block should not be widened unless a dedicated Figma page is created for that screen.

## Sync rule: CLAUDE.md "명시적 제외" changes must propagate to three places

When the exclusion list in CLAUDE.md changes:
1. `README.md` §"명시적 제외" — user-facing
2. `.claude/rules/health-copy.md` §"다이어트 유도 금지" — dev enforcement rule
3. Any existing flow docs that reference the changed content area

**Why:** These three files each serve a different audience (user, dev rule engine, flow designer) but must say the same thing. Divergence was found when `식단` was removed from CLAUDE.md exclusion but README still listed it verbatim.

**How to apply:** On any PR touching CLAUDE.md §"명시적 제외", grep README.md and health-copy.md for the same keywords and reconcile.

## Removed component: SetupPeriodPicker

`SetupPeriodPicker.tsx` was deleted in `feat/home-figma-pass`. The old `setupMode` inline calendar picker flow no longer exists. All first-record entry now goes through `TodayDateHeading` calendar icon. If any doc references `setupMode` or `SetupPeriodPicker`, delete the reference.

## Period-record components — current active pattern (2026-07-15)

- `PeriodSelectSheet` (`src/components/app/PeriodSelectSheet.tsx`) — **active** bottom-sheet calendar grid. Replaces `PeriodRangeDialog` + `ShortCycleConfirmDialog` as the home-screen entry point. Tap-per-day interface; delegates draft state mutations to `domain/cycle/periodEdit.ts` pure functions.
- `PeriodRangeDialog` / `ShortCycleConfirmDialog` — files still exist in `src/components/app/` but are **not used** by `HomeScreen`. `CalendarScreen` may still use `PeriodRangeDialog` — verify before removing files.
- `domain/cycle/periodEdit.ts` — pure functions for draft mutation (toDrafts / removeDay / extendTo / addRange / compact / computeChanges). Has paired `periodEdit.test.ts` + `periodEdit.cases.md`. No store/adapter imports — must stay pure.
- `domain/cycle/recordPolicy.ts` — pure functions `defaultPeriodEndDate` and `reconcileForNewStart`. Companion to the older dialog flow.
- `SupabaseMediaAdapter.ts` now fully implements `getTextOrder`/`setTextOrder` via `home_decor_settings.text_order`. The old "no-op TODO" note was removed from `data-layer.md`.

## Auth gate pattern (2026-07-15, C4 decision)

- `src/components/auth/AuthGuard.tsx` wraps `(app)/layout.tsx` and `(fullscreen)/layout.tsx`. Hydrates authStore, redirects to `/login` if `user === null`.
- Auto-anonymous sign-in on app boot was **removed**. Cold start → `/login`. "Continue without signing in" button in `LoginScreen` explicitly calls `signInAnonymously()` then navigates to `/`.
- Sign-out → `resetAllUserData()` → `applyRepoMode('local')` → `user = null` → `AuthGuard` redirects to `/login`. No auto anonymous re-issue.
- `src/store/rehydrateAll.ts` — parallel-rehydrates settings / period / condition / media stores. Called by `authStore.applyRepoMode()` whenever mode flips.
- Docs that mention "anonymous-first" or "auto-anonymous" are stale if they imply it happens without user action. Use "explicit guest tap mints anonymous session" instead.
