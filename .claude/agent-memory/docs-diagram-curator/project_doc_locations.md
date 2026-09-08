---
name: dwee doc locations and sync rules
description: Where docs live, which files must stay in sync with CLAUDE.md rule changes
type: project
---

## Figma asset export pitfall — node export bakes the canvas background (2026-09-08)

Figma's node `download_assets` export bakes in the **canvas background color** (observed: `#444444`) with full alpha (255) — not a transparent PNG. Using that export for a UI asset (e.g. the home food-bowl composite photos) puts a solid dark-gray rectangle behind the subject once it renders on a light app background. Fix: use `download_assets`' `rawImages` (original source images), which have correct alpha, instead of the rendered node export. Watch for this any time an artifact/doc task pulls a PNG straight out of Figma via node export rather than `rawImages` — easy to repeat since the bug is invisible in the Figma canvas itself (canvas background matches, so it "looks right" in Figma).

## globals.css owns app-wide text rules — don't duplicate per component (2026-09-08)

`src/app/globals.css`'s `html, body` selector now carries `word-break: keep-all` + `overflow-wrap: break-word` (Korean word-wrap fix — prevents mid-word breaks like "조절하세 / 요."). This is documented as its own section in `.claude/rules/screens.md` (§10, added 2026-09-08) rather than left implicit, precisely so a future PR doesn't reintroduce a per-component `break-keep` class. Any future global typography/CSS rule (line-height, letter-spacing, etc.) set on `html`/`body` in `globals.css` should get the same one-line treatment in screens.md §10 or a sibling section — don't let screens.md's token rule (§6, colors) be the only "single source" precedent readers can find.

## Home food-suggestions section — photo composite + emoji fallback (2026-09-08)

`FoodSuggestions.tsx` now branches on `FOOD_BOWL_IMAGE[phase]` (in `src/data/homeImagery.ts`): menstrual/follicular/ovulation/luteal render `PhotoBowl` (a single Figma-exported composite photo per phase from `public/home/foods/<phase>.png`, with dark-pill labels absolutely positioned via `FOOD_LABEL_POSITION[foodId]` percent coordinates keyed by food id); `unknown` has no photo yet and falls back to the original `EmojiBowl` (CSS-drawn bowl + emoji). The food list itself was fully replaced in the same PR — 4 category-style items per phase ("따뜻한 영양국" etc.) became 5 specific food-name items per phase with new ids (e.g. `beef-m`, `oyster-m`); old ids are gone. Documented in `docs/flows/home.md` §"ActivitySuggestions / FoodSuggestions 구조". When a label-position Figma spec lands for follicular/ovulation/menstrual (only luteal has one so far, node 256:24709), only `FOOD_LABEL_POSITION`'s values need to change — no component code.

## Key doc locations

- `docs/flows/home.md` — home screen state machine + data flow. Must be updated when HomeScreen.tsx flow changes.
- `docs/flows/calendar.md` — calendar cell-state logic + DayDetailSheet action buttons. Standalone `/calendar` route and `CalendarScreen` were deleted; calendar is now embedded inside `DiaryScreen` (`/log` Diary view). Doc updated to reflect this.
- `docs/flows/customize.md` — fullscreen customize flow (HomeCustomize + PhotoEdit).
- `docs/flows/log.md` — /log page flow: PeriodHistorySection (calendar/list toggle) + LogEntryDialog (period + condition combined). Added in period-record-rewrite PR.
- `docs/flows/diagnose.md` — DiagnoseScreen state machine (intro → preview → loading → result | error) for `/magazine/personal-body-type/diagnose`. Added in M2.0–M2.3 magazine PR. Rewritten 2026-09-04 for the picker-flow overhaul (see "Diagnose picker flow" note below). Grew to 207 lines on 2026-09-08 adding the result-screen top/bottom bars + share route, then to ~244 lines later the same day (2026-09-08) adding the native-photo-picker + `preview` step + Repository-backed result persistence (see "Diagnose photo intake + result persistence moved to Repository" note below). Already well over the <150-line preference — next nontrivial addition should split the result-screen + share sections into their own `docs/flows/diagnose-result.md` rather than growing this file further. Flagged to the user but not split unprompted.
- `docs/flows/settings.md` — MyPage (`/settings`) flow: auth-card variants, CycleSummaryCard, sub-page stub route map, AccountEditScreen anonymous bounce + save logic. Added in feat/my-page.
- `docs/architecture/data-layer.md` — dependency direction + repository inventory. Must be updated when any new Repository interface is added. Three separate lists to touch: `repositories/` (with method signatures), `adapters/indexeddb/`, `adapters/supabase/`, plus a 4th repo-name-only list again at the bottom "관련 파일·문서".
- `docs/product/mvp1-spec.md` — original product spec with persona, KPI, condition enums.
- `.claude/rules/health-copy.md` — copy tone rules (diet/medical copy restrictions).
- `.claude/rules/screens.md` — flow registry (links to all `docs/flows/*.md`). Must be updated when a new flow doc is added.
- `.claude/rules/storage.md` — Repository/Adapter pattern rules, generic (no repo names listed) — no update needed when adding a new repo.
- `supabase/README.md` — Supabase migration + adapter guide, dev-internal/code-snippet-heavy tone. Adapter code lives at `src/data/adapters/supabase/` (already moved from `supabase/adapters/`). Migration list appears in **three** places that must all get a new migration number together: the `migrations/` tree comment block, the "마이그레이션 적용" step-range line, and the "옵션 B" prose range. Found and fixed a pre-existing gap here 2026-09-08: `0011_withdrawal_feedbacks.sql` was missing from all three (jumped 0010→0012) — worth double-checking this file's migration list against `ls supabase/migrations/` on every visit, not just appending the newest number.

## README.md (en) vs README.ko.md — NOT parallel translations

They are structurally different documents, not mirror translations, despite the "always update as a pair" rule:
- `README.md` (en) — portfolio/case-study style for an engineering audience ("Why I Built This", "Key Design Decisions & Tradeoffs", "Technical Challenges & Learnings"). Stays at a high level of abstraction — mentions features/subsystems, rarely UI-interaction-level detail. One big rolling `**Status:**` paragraph, no per-feature roadmap checklist. Because it's a current-state snapshot (not a changelog), a stale claim there (e.g. "4-store rehydrate", "based on sessionStorage") should be *corrected in place*, not left as history.
- `README.ko.md` — traditional project README with a `## 🗺 진행 상태 (Roadmap)` checklist section (`### MVP1`, `### MVP2`, `### 매거진`) that has one dense bullet per shipped feature, often including UI-interaction-level detail. It's a chronological log of completed milestones — the convention is to *append* new detail sentences to the relevant existing milestone bullet (e.g. append a diagnose-repository-migration sentence to the M2.1 bullet) rather than rewriting a historical claim that was true when that milestone shipped. Exception: if a *later* bullet references the stale fact in passing (e.g. MVP2.6-polish's "`MyTestsCard` ... sessionStorage 기반"), add a short forward-pointer parenthetical rather than silently leaving readers with an outdated fact next to the current default.
- `README.ko.md` also has a hero image block right after the intro: `## 📱 핵심 화면` → `<img src="./public/_dwee.png" .../>` — added 2026-09-08 outside of a docs-curator session (confirms `public/_dwee.png`, a 3840×2160 intro screenshot not referenced anywhere in code, is meant as this README hero, not dead weight).
- **Sync rule in practice:** when a change is UI-interaction-level (e.g. "consent modal now opens on screen entry instead of on first slot tap"), it usually only requires a README.ko.md roadmap bullet edit — README.md's higher abstraction level often already covers it without change. Don't force a README.md edit just to satisfy "update as a pair" when nothing at its abstraction level actually went stale; verify by grepping README.md for the specific feature/behavior first.
- Both still must be checked every visit for stage label, feature list, exclusions, tech stack, repository roster, and folder tree — the "not parallel" note is about internal structure/depth, not about skipping the audit.

## Diagnose photo intake + result persistence moved to Repository (2026-09-08)

- **Photo picker overhaul**: native (Capacitor) now opens the OS album directly via `Camera.pickImages` — same pattern as Home Customize's photo picker — instead of falling through a web-style action sheet; web still falls back to `<input type="file" multiple>` since there's no native "open album" API for the browser. Shared logic lives in a new hook `src/components/diagnose/useBodyPhotoPicker.tsx`.
- **New `preview` step**: picking photos no longer jumps straight to analysis. A new full-screen `PhotoPreviewView` (`src/components/diagnose/PhotoPreviewView.tsx`) lets the user see the shot large (horizontal swipe) before committing, with [사진 변경하기] (re-pick) and [체형 진단 시작하기] (start analysis) actions. `DiagnoseScreen`'s `Step` union gained `{ kind: 'preview'; photos }` between `intro` and `loading`.
- **Result storage moved off `sessionStorage` onto a Repository**: new `BodyTypeReportRepository` (`get()/save()/clear()`, one row per user — no history) + `IndexedDBBodyTypeReportAdapter` + `SupabaseBodyTypeReportAdapter` + `bodyTypeReportStore` (Zustand, hydrate/rehydrate/save/clear pattern matching the other data stores) + Supabase migration `0013_body_type_reports.sql` (`user_id` PK, `report` jsonb, `primary_type` column for cheap OG-card lookups, RLS blocks anonymous — same `is_anonymous_jwt()` pattern as 0004/0006). `DiagnoseResultScreen` no longer reads a `sessionStorage` key (`REPORT_SESSION_KEY` is gone) — it hydrates `bodyTypeReportStore` instead.
- `rehydrateAll.ts` now refreshes **5** stores (settings, period, condition, media, bodyTypeReport) on repo-mode switch — the old "4-store rehydrate" README claim is now stale wherever it appears as a current-state fact (fix in README.md; leave README.ko.md's MVP2.2 historical "4 스토어" bullet alone, since that was true at the time MVP2.2 shipped, before this repo existed).
- `anonToRemote.ts` migration now also carries a body-type report: if a local (anonymous) report exists and no remote one does yet, it's pushed on first login. `MigrationResult` gained a `bodyTypeReport: boolean` field.
- A legacy-data promotion path (`src/data/bodyTypeReportStorage.ts`, keyed by `DEPRECATED_KEYS.bodyTypeReportBrowser`) reads any pre-existing browser-stored (local/sessionStorage) report once on first hydrate, saves it to the Repository, then deletes the old key.
- IndexedDB schema version did **not** bump (stays v10) — the new key (`STORAGE_KEYS.bodyTypeReport`) is a plain top-level `idb-keyval` key, not part of the versioned `migrations.ts` sequence.
- Full writeup: `docs/flows/diagnose.md` §"결과 보관" (new subsection under "결과 화면").

## Diagnose picker flow (as of 2026-09-04, magazine-ui-polish PR)

Flow changed significantly from the original M2.0–M2.3 design documented before:
- **Consent modal now opens automatically on screen entry** (`consent: true` in the initial `Step` state), not gated behind the first slot tap. If the user cancels it and later taps the picker button while still unconsented, it reopens — but only *that* reopen auto-triggers the file picker on agree (the initial auto-open on mount does not).
- **SlotStrip (front/side/back) is no longer tappable.** It's now a pure photography-guide strip: empty slots show static guide images (`public/magazine/personal-body-type/guide-{front,side,back}.png`), filled slots show the picked preview. Per-slot tap-to-pick and the inline `PlusIcon` were removed entirely.
- **Photo selection happens only via the bottom "사진 선택" button** (now: opens native album picker or web file input — see the 2026-09-08 note above for the follow-up overhaul). Picking replaces the whole selection at once, filling front→side→back in order — no more picking/replacing one slot at a time.
- `onSlot`/`setSlot`/`pendingSlot` were removed from `DiagnoseScreen.tsx`; replaced by `onPhotos`/`setPhotos`/`pickAfterConsent`.
- Retry after an error (`resetIntro`) no longer resets `consented` to false — a user who already agreed once doesn't see the consent modal again on retry.
- Loading screen background dim went from `bg-black/[0.15]` to `bg-black/40`; the `stayWarning` copy key was replaced by `resultLocation` (tells the user where to find the result later — MyPage > 나의 테스트 — instead of warning them not to leave).
- `docs/flows/diagnose.md` state machine, table, and data-flow Mermaid diagram were all rewritten to match. The pre-existing data-flow diagram also had a stale `PNG` export node left over from an earlier PNG-export removal — dropped it while rewriting (the prose already said PNG export was removed but the diagram never caught up; check for this kind of prose/diagram divergence in other flow docs too).

## Result screen share feature (2026-09-08, Figma 256-27912 / 293-2262)

- `DiagnoseResultTopBar.tsx` (new) — `fixed` top bar, back + retry, replaces the old absolute-positioned back-only button; retry moved here from the screen body. Background swaps (`stuck` prop) once `ReportView`'s sticky tab bar scrolls under it — the two components coordinate via a shared `TOP_BAR_HEIGHT = 64` constant and `ReportView`'s `onStuckChange` callback.
- `ShareTestBar.tsx` (new) — fixed bottom bar (`bg-brand-gray900` + `text-brand-pink100`, sampled from Figma to match the `pink100` token exactly). `navigator.share` when available, else clipboard copy + toast (same fallback pattern as `QnaScreen`). A cancelled native share sheet exits silently — does not fall through to copy.
- New route `(fullscreen)/magazine/personal-body-type/share/[type]/page.tsx` (`straight`/`wave`/`natural`, `generateStaticParams`) exists **only** to carry per-body-type `generateMetadata` (og:image/title/description). Reason: `next.config.js` has `output: 'export'`, so query strings can't vary OG tags under static export — a real path per variant is required. Any future "share a specific result" feature will hit the same constraint.
- `ShareLandingRedirect.tsx` (new) — client component the share route renders; `router.replace()`s a human visitor straight to `/magazine/personal-body-type` on mount. Crawlers never execute JS, so they only ever see the metadata.
- The share route's metadata is hardcoded `locale: 'ko_KR'` regardless of user locale, because the OG card images (`public/magazine/personal-body-type/og-{straight,wave,natural}.png`) were baked in Korean. This is a deliberate exception to root `layout.tsx`'s en-default OG — don't "fix" it to match app locale without regenerating the images.
- Full writeup: `docs/flows/diagnose.md` §"공유 (Share)".

## Active repositories and schema versions

Period / Condition / Settings / Media / Bookmark / EventCategory / Event / DiarySticker / DiaryStickerPlacement / **BodyTypeReport** (added 2026-09-08). IndexedDB schema v10 (added `dwee:media:photo_transform:{slot}` keys 0–6; the later `dwee:body_type_report` key did NOT bump schema — plain top-level `idb-keyval` key). Supabase migrations through **0013** (0011 = withdrawal_feedbacks, 0012 = sticker_cutout_calls, 0013 = body_type_reports). `data/index.ts` wires IndexedDB or Supabase per auth mode.

## pnpm test script (as of refactor/home-customize-flow)

`pnpm test` = `lint && typecheck && test:unit` only. e2e is now a separate step (`pnpm test:e2e`). `.claude/commands/commit.md` STEP 4 and README harness descriptions must reflect this — do not describe `pnpm test` as including e2e.

## Route groups (fullscreen added)

Three route groups now exist: `(auth)`, `(app)`, `(fullscreen)`. The `(fullscreen)` group hosts immersive editing screens with no AppShell or BottomTabNav. Currently: `/home/customize`, `/home/customize/edit-photos`, `/magazine/[slug]` (article reader), `/magazine/bookmarks`, `/magazine/personal-body-type/diagnose`, `/magazine/personal-body-type/diagnose/result`, `/magazine/personal-body-type/share/[type]` (OG-metadata-only, redirects humans to the article — added 2026-09-08), `/settings/account` (AccountEditScreen — nickname edit, anonymous bounce).

## Mermaid gotcha: `#quot;` is for literal quote marks in a label, not decoration

`#quot;` renders as an actual `"` character inside a label — it's for cases like `Button(["#quot;사진 선택#quot; 버튼"])` where the UI text itself is meant to show quoted button copy. It is NOT the escaping mechanism for the outer label-wrapping quotes required by `.claude/rules/mermaid.md` when a label contains `[]`/`()`/etc. — a label like `share/[type]` just needs `Share["share/[type]\n..."]`, no inner `#quot;`. Caught myself copy-pasting the `#quot;`-wrapped pattern from a nearby node by analogy when it wasn't semantically warranted (2026-09-08, diagnose.md share diagram) — re-read each node's actual copy before reusing a neighboring node's escaping style.

Also: the mermaid-rule's suggested grep (`grep -nE '^\s*\w+\[[^"]'`) false-positives on legitimately-quoted cylinder nodes shaped `Name[("label")]` (e.g. `EdgeFn[("Supabase\n...")]`) because `[(` matches `\[[^"]`. Confirm the content inside is actually quoted before treating a grep hit as a real violation.

## Magazine feature (M2.0–M2.2)

- BottomTabNav: `insights` tab replaced by `magazine` tab. `src/app/(app)/insights/` route removed; `src/components/insights/InsightsScreen.tsx` removed. `InsightCard.tsx` and `lib/insight/` preserved for home-embedded pattern cards.
- `(app)/magazine/` — list only (no slug sub-route here; article detail moved to fullscreen).
- `(fullscreen)/magazine/[slug]/` — article fullscreen reader.
- `(fullscreen)/magazine/bookmarks/` — bookmarked articles list.
- `(fullscreen)/magazine/personal-body-type/diagnose/` — see "Diagnose picker flow" note above for 2026-09-04 behavior, and "Diagnose photo intake + result persistence moved to Repository" for the 2026-09-08 follow-up.
- `(fullscreen)/magazine/personal-body-type/diagnose/result/` — `DiagnoseResultScreen`. **As of 2026-09-08 reads the report from `bodyTypeReportStore` → `BodyTypeReportRepository`, not `sessionStorage`** (the `REPORT_SESSION_KEY` mechanism described in earlier notes is gone — see the dedicated note above). `ReportView` renders 2-tab layout: BodyTab (frame paragraphs) and StyleTab (4 clothing cards horizontal scroll), with a `sticky top-0` tab bar (IntersectionObserver-driven `stuck` state removes rounding only while pinned; tab switch scrolls back to the sticky-start position). PNG export was removed post-Figma-redesign — do not describe this screen as having a download button.
- `ArticleCard.tsx` was deleted. Card rendering is now inline in `MagazineScreen`.
- `src/data/magazine/articles.ts` — 4 articles total: personal-body-type, cycle-phases, cycle-length-35-days, period-supplements. Dates use ISO format (`YYYY-MM-DD`); dot format caused `RangeError`. `ArticleExample` now has an optional `source?: string` (media outlet name, only filled when confirmed from a masthead in the photo — left blank rather than guessed) shown top-right on example images via `magazine.sourcePrefix` i18n key. Distinct from `sourceUrl` (a bio page link, not a photo credit).
- `supabase/functions/body-type-analyze/` — OpenAI gpt-4o Vision, temperature 0.3. Photo is never stored. Rate-limited to 10 calls/day (`DAILY_LIMIT = 10`, only successful analyses counted) via `supabase/migrations/0003_body_type_calls.sql`. `MAX_ATTEMPTS = 2`: retries once on `analyzable: false` or transient OpenAI failure using a separate retry prompt (`buildRetryUserText`).
- CLAUDE.md "명시적 제외" ML/AI clause now has server-side LLM exception for explicit-user-trigger cases (magazine diagnose). README must reflect same exception text.
- Bookmark icon is now split: `BookmarkIcon.tsx` (single ribbon, used on article detail + BookmarksScreen header) vs. `BookmarkStackIcon.tsx` (two overlapping ribbons, used on MagazineScreen list header to represent "the bookmarks collection"). Don't conflate them when documenting bookmark UI.
- `ArticleScreen.tsx` top bar (back + bookmark) is `fixed` (was `absolute`) so it stays pinned while the article scrolls; bookmark icon color deepened for legibility over the white body background (not just the dark hero).
- `Button.tsx` exports `BOTTOM_CTA_CLASS` — a shared bottom-CTA padding constant (20px/16px/32px) now used by both the magazine article detail CTA and the diagnose picker's bottom button. Any new bottom-fixed CTA button should reuse this instead of hand-rolling padding.

## Figma sync scope: home snapshots only

STEP 8 in `.claude/commands/commit.md` syncs only `tests/snapshots/ko/home-*.png` to Figma "Snapshots (ko)". The trigger glob is intentionally `home-*.png`, not `*.png`. `customize-*.png`, `log-*.png`, and `photo-edit-*.png` are e2e-only baselines and must NOT be pushed to Figma. If new screen specs are added to `tests/`, the Figma sync block should not be widened unless a dedicated Figma page is created for that screen.

## Sync rule: CLAUDE.md "명시적 제외" changes must propagate to three places

When the exclusion list in CLAUDE.md changes:
1. `README.md` §"명시적 제외" — user-facing
2. `.claude/rules/health-copy.md` §"다이어트 유도 금지" — dev enforcement rule
3. Any existing flow docs that reference the changed content area

**Why:** These three files each serve a different audience (user, dev rule engine, flow designer) but must say the same thing. Divergence was found when `식단` was removed from CLAUDE.md exclusion but README still listed it verbatim.

**How to apply:** On any PR touching CLAUDE.md §"명시적 제외", grep README.md and health-copy.md for the same keywords and reconcile.

## Modals.md §8 added (2026-09-04, UI-polish pre-commit doc check)

Added a rule documenting the 2-button confirm-dialog cancel-button convention: `bg-brand-gray300` + `hover:bg-brand-gray400/60`. Trigger: the same class string had been copy-pasted identically across `DiscardDraftDialog` (original) → `CancelEditDialog`, `LogoutConfirmDialog`, `WithdrawConfirmDialog`, `DeleteStickersDialog`, `DiaryCustomizeScreen`'s `DiscardDialog` (5 more, all in one PR) — real drift risk per CLAUDE.md's "same mistake 2x → add a rule line" policy. File is now 67 lines, still under the 80-line-file / split threshold.

This PR (NavIcon path sync, PeriodSelectSheet today-ring simplification, ScratchKeywordCard hint-hide-on-touch, BookmarkIcon strokeWidth, MagazineScreen bookmark-button bg removal, HomeCustomizeScreen settingsStore hydrate fix) was otherwise pure visual/behavioral polish with no doc/README changes needed — checked README.md/README.ko.md (feature-level, doesn't document button classes or icon paths) and docs/flows/home.md + customize.md (no stale reference to `recordedStartSet`, scratch-hint threshold, or the settings-hydrate comment-out). Good example of "polish-only diff → only the recurring-drift rule needs a doc touch, not README."

## Removed component: SetupPeriodPicker

`SetupPeriodPicker.tsx` was deleted in `feat/home-figma-pass`. The old `setupMode` inline calendar picker flow no longer exists. All first-record entry now goes through `TodayDateHeading` calendar icon. If any doc references `setupMode` or `SetupPeriodPicker`, delete the reference.

## New dirs and rules added (2026-07-20, feat/home-dday-modal-rules)

- `src/hooks/` — new dir for reusable custom hooks. Current contents: `useBodyScrollLock.ts`, `useEscToClose.ts`. Any new shared modal hook goes here.
- `.claude/rules/modals.md` — new rule file covering modal/dialog/bottom-sheet conventions: two required hooks (`useBodyScrollLock`, `useEscToClose`), backdrop click, scroll container structure, a11y (`role="dialog"`, `aria-modal`, `aria-labelledby`), z-index (`z-40` normal / `z-50` stacked), opacity. README.ko.md folder tree lists it in `.claude/rules/` block.
- `src/domain/cycle/fertile.ts` — new pure function `predictFertileWindow(predictedDate, predictionConfidence)`. Returns `{ start, end } | null`. Integrated into `WeekStrip.tsx` as `predictedFertile` CycleState.
- `src/dev/DevBridge.tsx` + `src/dev/ensureAnon.ts` — e2e test bridges (dev-only, excluded from production bundle). `DevBridge.tsx` registers `window.__dweeSeedPhase` and `window.__dweeTestAnon` globals. Moved from `AppShell` to root `layout.tsx` so `/login` route also gets the bridge.

## WeekStrip CycleState (as of 2026-07-20)

Four states: `'actualPeriod' | 'predictedPeriod' | 'predictedFertile' | null`. Priority: actual > predicted period > predicted fertile > default. Fertile uses lavender tokens (`brand-lavender100` border, `brand-lavender400` text). Documented in `docs/flows/home.md` §"WeekStrip 색상 분기".

## Period-record components — current active pattern (2026-07-15)

- `PeriodSelectSheet` (`src/components/app/PeriodSelectSheet.tsx`) — **active** bottom-sheet calendar grid. Replaces `PeriodRangeDialog` + `ShortCycleConfirmDialog` as the home-screen entry point. Tap-per-day interface; delegates draft state mutations to `domain/cycle/periodEdit.ts` pure functions.
- `PeriodRangeDialog` / `ShortCycleConfirmDialog` — files still exist in `src/components/app/` but are **not used** by `HomeScreen`. `CalendarScreen` was deleted; verify `PeriodRangeDialog` usage before removing (it may be referenced from `DayDetailSheet`).
- `domain/cycle/periodEdit.ts` — pure functions for draft mutation (toDrafts / removeDay / extendTo / addRange / compact / computeChanges). Has paired `periodEdit.test.ts` + `periodEdit.cases.md`. No store/adapter imports — must stay pure.
- `domain/cycle/recordPolicy.ts` — pure functions `defaultPeriodEndDate` and `reconcileForNewStart`. Companion to the older dialog flow.
- `SupabaseMediaAdapter.ts` now fully implements `getTextOrder`/`setTextOrder` via `home_decor_settings.text_order`. The old "no-op TODO" note was removed from `data-layer.md`.

## Home customize flow (as of refactor/home-customize-flow, 2026-08-13)

- Draft mode: `beginPhotoDraft()` on mount; all changes go to `draft*` fields in `mediaStore`. `commitPhotoDraft()` on Customize home's "편집 완료"; `discardPhotoDraft()` on back/cancel.
- `picksConfirmed` gate: Customize home's "편집 완료" only active when `allFilled && picksConfirmed`. `picksConfirmed` is set by PhotoEditScreen's own "편집 완료" and reset on any pick change. Both buttons now read "편집 완료" / "Done editing" — always qualify which screen.
- `PhotoTransform = { scale, offsetXNorm, offsetYNorm }` stored per slot. Original blob never rewritten. Rendered via CSS in `TransformedPhoto` component.
- Text customization UI is currently commented out. `TextSettingsSection` import exists but is unused in `HomeCustomizeScreen`.
- Photo removal: empty slots allowed in PhotoEditScreen; × button clears a filled slot and resets `picksConfirmed`.
- New shared components: `TransformedPhoto.tsx`, `DiscardDraftDialog.tsx`.
- New hook: `useMediaCustomizeView.ts` (merges draft/committed; exports `useIsPhotoDraftDirty` + `isPhotoDraftDirty` pure predicate).
- `docs/flows/customize.md` is the authoritative flow doc — fully rewritten 2026-08-13.

## BottomTabNav tab count (as of 2026-08-19)

4 tabs: home / log / magazine / settings. The `calendar` tab was removed — calendar functionality is now embedded in `/log` (DiaryScreen, Diary view). `.claude/rules/screens.md §8` now reads "4개 탭" and names `home/log/magazine/settings`. Any doc claiming 5 tabs or listing `calendar` as a tab is stale.

## Event-tap UX pattern (as of 2026-08-19)

Tapping an event badge on the diary opens `EventFormSheet` in edit mode directly. There is no intermediate `EventDetailSheet`. Delete and period-mark toggle live inside the edit form. `EventDetailSheet` component was deleted. Docs referencing `EventDetailSheet` in the log/calendar flow are stale.

## Auth gate pattern (2026-07-15, C4 decision)

- `src/components/auth/AuthGuard.tsx` wraps `(app)/layout.tsx` and `(fullscreen)/layout.tsx`. Hydrates authStore, redirects to `/login` if `user === null`.
- Auto-anonymous sign-in on app boot was **removed**. Cold start → `/login`. "Continue without signing in" button in `LoginScreen` explicitly calls `signInAnonymously()` then navigates to `/`.
- Sign-out → `resetAllUserData()` → `applyRepoMode('local')` → `user = null` → `AuthGuard` redirects to `/login`. No auto anonymous re-issue.
- `src/store/rehydrateAll.ts` — parallel-rehydrates settings / period / condition / media / **bodyTypeReport** (5th store added 2026-09-08) stores. Called by `authStore.applyRepoMode()` whenever mode flips.
- Docs that mention "anonymous-first" or "auto-anonymous" are stale if they imply it happens without user action. Use "explicit guest tap mints anonymous session" instead.

## Home food-detail screen — new `content/` pattern generalized (2026-09-08)

- New feature: home "이렇게 먹으면 좋아요" food chips (in `PhotoBowl`, i.e. menstrual/follicular/ovulation/luteal phases only) are now `Link`s to `/foods/[id]` (new `(fullscreen)` route), opening `FoodArticleScreen` — a read-only detail screen explaining why that food helps in that phase. Fully separate from the magazine feature (no bookmark/share). `EmojiBowl` (unknown phase) chips remain plain `<span>` — no hero photo and no article content exist for that phase yet.
- Content lives in `src/content/foods/articles-ko.ts` (20 entries = 4 phases × 5 foods, `{title, intro, sections[], tipTitle, tips[], closing}`). This is the **second** module in a now-confirmed pattern: `src/content/<domain>/<name>-ko.ts` for **Korean-original-only, locale-independent content** (`src/content/legal/{terms,privacy}-ko.ts` was the first, from MVP2.6-polish). The screen renders this text regardless of the user's locale — an en-US user sees Korean body copy. Treat any future `content/` addition the same way unless it explicitly ships an English version too.
- **Coupling to watch**: content keys in `articles-ko.ts` are literally the same id strings as `home.foods.<phase>.items[].id` in the i18n dictionaries. Renaming/removing a food id in `en.ts`/`ko.ts` silently breaks the chip → article link (shows nothing, since `foodArticle(id)` returns null and `FoodArticleScreen` renders nothing) unless the content key is renamed in lockstep. No type-level enforcement ties these together — grep both files when touching food ids.
- Documented in `docs/flows/home.md` §"ActivitySuggestions / FoodSuggestions 구조" and `README.ko.md` roadmap (new bullet, end of MVP2 section) + folder tree (added missing top-level `content/` block — it was never in the tree even though `content/legal/` already existed from MVP2.6-polish, a pre-existing gap fixed while here). `README.md` (en) intentionally NOT touched — same "UI-interaction-level change, README.md's abstraction level doesn't need it" call as the food-bowl-photo feature earlier the same day; consistent with existing precedent.
- No new/changed Mermaid diagram for this feature — a single Link-tap-to-detail-screen didn't clear the bar for a dedicated diagram (would be a 2-node diagram adding nothing prose doesn't already say). Existing home.md diagrams are about data flow / state branching, not screen-to-screen navigation, so this didn't fit into an existing one either.

## Known gap: `.claude/rules/screens.md` §1 fullscreen route list is stale (flagged, not fixed — 2026-09-08)

The `(fullscreen)` route-group list in `.claude/rules/screens.md` §1 ("현재 포함: ...") only names 4 routes (`/home/customize`, `/home/customize/edit-photos`, `/magazine/personal-body-type/diagnose`, `/settings/account`) but at least 6 more fullscreen routes already exist and aren't listed: `/log/customize`, `/settings/withdraw`, `/magazine/[slug]`, `/magazine/bookmarks`, `/magazine/personal-body-type/diagnose/result`, `/magazine/personal-body-type/share/[type]` — and now `/foods/[id]` too. Did not do a full-list rewrite here (out of scope for the requested review, and a partial single-line addition would misleadingly imply the list is otherwise current). Flag to the user next time `screens.md` is touched for any reason — worth a full resync in one pass rather than incremental patches.
