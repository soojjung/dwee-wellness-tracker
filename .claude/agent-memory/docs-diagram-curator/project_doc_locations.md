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
- `docs/architecture/data-layer.md` — dependency direction + repository inventory. Must be updated when any new Repository interface is added.
- `docs/product/mvp1-spec.md` — original product spec with persona, KPI, condition enums.
- `.claude/rules/health-copy.md` — copy tone rules (diet/medical copy restrictions).
- `.claude/rules/screens.md` — flow registry (links to all `docs/flows/*.md`). Must be updated when a new flow doc is added.
- `supabase/README.md` — Supabase migration + adapter guide. Adapter code lives at `src/data/adapters/supabase/` (already moved from `supabase/adapters/`).

## Active repositories (as of schema v4)

Period / Condition / Settings / Media. Each has both IndexedDB and Supabase adapter implementations. `data/index.ts` currently wires IndexedDB; Supabase wiring is MVP2.2.

## Route groups (fullscreen added)

Three route groups now exist: `(auth)`, `(app)`, `(fullscreen)`. The `(fullscreen)` group hosts immersive editing screens with no AppShell or BottomTabNav. Currently: `/home/customize`, `/home/customize/edit-photos`.

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

`SetupPeriodPicker.tsx` was deleted in `feat/home-figma-pass`. The old `setupMode` inline calendar picker flow no longer exists. All first-record entry now goes through `AddPeriodFab`. If any doc references `setupMode` or `SetupPeriodPicker`, delete the reference.

## Shared period-record components (added in period-record-rewrite PR)

- `PeriodRangeDialog` (`src/components/app/PeriodRangeDialog.tsx`) — shared by `AddPeriodFab` (home) and `CalendarScreen` (calendar). Takes `{startDate, endDate}` as `AddPeriodInput`.
- `domain/cycle/recordPolicy.ts` — pure functions `defaultPeriodEndDate` and `reconcileForNewStart`. Has paired `recordPolicy.test.ts` + `recordPolicy.cases.md`. Must remain a pure function file (no store/adapter imports).
- `SupabaseMediaAdapter.ts` now fully implements `getTextOrder`/`setTextOrder` via `home_decor_settings.text_order`. The old "no-op TODO" note was removed from `data-layer.md`.
