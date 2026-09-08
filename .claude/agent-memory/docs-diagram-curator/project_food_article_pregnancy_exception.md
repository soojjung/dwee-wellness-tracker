---
name: project_food_article_pregnancy_exception
description: User decision to keep pregnancy/implantation-adjacent phrasing in 9 food-article entries despite CLAUDE.md's "임신·피임·성생활" exclusion
type: project
---

9 of the 20 entries in `src/content/foods/articles-ko.ts` (the home food-detail screen content, see [[project_doc_locations]]) contain pregnancy/implantation-context phrasing — e.g. the luteal-phase copy describes "자궁 내막이 착상을 위해 두꺼워지는" (the uterine lining thickening for implantation) as background on why progesterone rises. This directly touches CLAUDE.md's "명시적 제외" list item "임신·피임·성생활·커뮤니티".

Surfaced to the user during pre-commit doc review (2026-09-08, this PR). **Decision: keep as-is** — the user chose not to edit the Figma-sourced article text to strip pregnancy-context sentences.

**Why:** Not recorded in detail by the user beyond "그대로 두기" (leave it) — likely because the phrasing is explanatory/physiological context (why a phase happens) rather than the excluded *feature surface* (no pregnancy tracking, no contraception guidance, no fertility planning UI). The exclusion clause seems aimed at feature scope, not at forbidding any mention of reproductive physiology in educational copy.

**How to apply:** Don't flag this specific phrasing again as a blocking issue in future doc/copy reviews of `articles-ko.ts` — it's a known, deliberate exception, not an oversight. Do still flag *new* pregnancy-adjacent copy elsewhere (a new feature, not explanatory background in existing food content) since this decision was scoped to these 9 existing entries, not a blanket policy change. If CLAUDE.md's exclusion wording changes, or if a menstrual-cycle-expert / i18n-localization-expert agent revisits this file, point them here rather than re-litigating from scratch. This was explicitly flagged as "may be revisited later" by the reviewer who raised it — don't treat it as permanently settled.
