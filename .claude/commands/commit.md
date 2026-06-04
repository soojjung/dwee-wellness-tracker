---
description: 변경사항을 새 브랜치로 분리하고 lint+typecheck 통과 후 커밋·푸시·PR 생성
argument-hint: '[옵션: 커밋 메시지 힌트]'
---

# /commit — Safe branch + commit + PR

사용자가 `/commit [힌트]` 를 실행했다. 아래 순서대로 진행. **각 단계 실패 시 즉시 중단하고 사용자에게 보고**. force push / `--no-verify` / main 직접 푸시 절대 금지.

## STEP 1 — 변경사항 존재 확인

```bash
git status --porcelain
```

출력이 비어있으면: "커밋할 변경사항이 없어요" 로 중단.

## STEP 2 — main 동기화 점검

```bash
git fetch origin main
```

현재 브랜치 확인:

```bash
git branch --show-current
```

- **현재 브랜치 = main 인 경우**:
  - `git rev-list --left-right --count origin/main...main` 으로 ahead/behind 카운트.
  - behind > 0 (origin 이 더 최신): "origin/main 에 새 커밋이 있어요. main 을 먼저 동기화할게요." 라고 알리고, 변경사항을 stash 후 진행. (STEP 3 참조)
  - ahead > 0 (로컬 main 에 미푸시 커밋): "로컬 main 에 푸시되지 않은 커밋이 N개 있어요. 어떻게 처리할까요?" 라고 사용자 확인 받기.
  - ahead/behind 모두 0: 정상. STEP 3 진행.
- **현재 브랜치 ≠ main 인 경우**:
  - 이미 작업 브랜치 위에 있음. STEP 4 (검증) 로 점프. 단 origin/main 과 본 브랜치의 base 가 최신인지는 안내만 표시.

## STEP 3 — 새 브랜치 생성 (현재 main 일 때만)

1. `git stash push -u -m "auto-stash for /commit"` (untracked 포함).
2. `git checkout main && git pull --ff-only origin main` (실패하면 stash pop 후 사용자에게 conflict 알리고 중단).
3. 새 브랜치 이름은 변경 diff 와 `$ARGUMENTS` 힌트를 종합해 추론:
   - 형식: `<type>/<short-kebab-desc>` — type ∈ {feat, fix, refactor, docs, chore, style, perf, test}
   - 예: `feat/home-overlay-upload`, `fix/condition-form-error`, `refactor/insight-card-split`
   - 이미 같은 이름 브랜치가 있으면 `-2`, `-3` 등 suffix.
4. `git checkout -b <new-branch>`.
5. `git stash pop` (conflict 발생 시 사용자에게 알리고 중단).

## STEP 4 — 검증 (블로킹)

순서대로 실행. 실패 시 에러 출력 + 중단:

```bash
pnpm typecheck
```

```bash
pnpm lint < /dev/null 2>&1
```

- `pnpm lint` 가 interactive 프롬프트로 실패하면 (Next.js 15 의 ESLint 마이그레이션 안내 등): "lint 설정이 필요해요 — 일단 건너뛰고 진행할까요?" 라고 사용자에게 묻고 답에 따라 진행/중단.
- 실제 lint 에러는 항상 블로킹.

## STEP 5 — 문서·다이어그램 보강 (docs-diagram-curator)

매 커밋마다 README 점검 + 변경 성격에 따라 아키텍처 문서/다이어그램 동기화.

1. **항상 실행 (skip 금지)**: 단순 버그픽스/스타일 변경이라도 README 가 stale 해질 수 있어 매번 curator 호출.
2. **추가 트리거 (curator 프롬프트에 명시)**: 아래 중 하나라도 해당하면 README 점검에 더해 아키텍처 문서·다이어그램까지 갱신 검토 요청.
   - `src/data/repositories/`, `src/data/adapters/`, `src/store/`, `src/domain/`, `src/lib/` 에 **신규 파일** 추가
   - `supabase/migrations/` 변경
   - `src/app/` 라우트 그룹 / 페이지 신규 또는 화면 간 네비게이션 분기 추가
   - 기존 `docs/` 하위 문서가 변경된 코드와 어긋날 가능성 (예: `data/index.ts` 같은 wiring 파일 수정)
   - `$ARGUMENTS` 에 `--docs` 또는 "문서/다이어그램" 키워드 명시
3. **호출**: `Agent` tool 의 `subagent_type=docs-diagram-curator` 로 호출. 프롬프트에 다음을 포함:
   - `git diff --name-status` 결과 (변경 파일 목록)
   - `git diff --stat` 요약
   - 추가 트리거 매치 여부 (아키텍처 문서/다이어그램 검토 필요 여부)
   - 지시문 예: "(1) 루트 `README.md` 및 nested README 가 이번 변경 후에도 정확한지 반드시 점검·갱신해 줘 (stage 표기, 기능 목록, 명시적 제외, 기술 스택, 셋업 안내, 깨진 링크). (2) 추가 트리거 매치 시 `docs/` 하위 문서·Mermaid 다이어그램도 검토. 갱신할 게 없으면 'no docs update needed' 로 회신해도 좋음."
4. **결과 처리**:
   - curator 가 파일을 추가/수정한 경우 → working tree 에 반영됨. STEP 6 의 `git add -A` 에서 자동 포함.
   - curator 가 "no docs update needed" 로 회신 → 그대로 STEP 6 진행.
   - 사용자에게 "문서 N개 점검·갱신했어요: <파일 목록>" 1줄로 보고 (README 포함, 변경 없으면 "README 포함 문서는 최신 상태").

## STEP 6 — 커밋 메시지 작성

1. `git diff HEAD` 로 변경 요약 확인.
2. `git log --oneline -5` 로 기존 메시지 스타일 확인.
3. 메시지 작성 원칙:
   - **첫 줄** (≤ 60자, 동사로 시작, 한국어 또는 영어 — 기존 스타일 따름).
   - **본문** (선택, 빈 줄 후 ≤ 3줄): "왜" 위주, "무엇" 은 코드가 말함.
   - `$ARGUMENTS` 가 있으면 첫 줄 힌트로 사용.
4. `git add -A` 후 HEREDOC 형식 commit:

```bash
git commit -m "$(cat <<'EOF'
<첫 줄>

<본문 (선택)>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

## STEP 7 — 푸시 + PR

```bash
git push -u origin <new-branch>
```

**PR body 구성 전 문서 변경 추출** (PR body 에 포함시킬 데이터):

```bash
git diff --name-status origin/main...HEAD -- 'docs/**' '*.md' '.claude/rules/**' '.claude/agents/**' '.claude/commands/**' 'README*' 'CLAUDE.md'
```

- 출력이 있으면 status code 별로 그룹핑해 PR body 의 `## Docs` 섹션 bullet 으로 변환. **경로는 항상 clickable markdown link 형식** `[path](path)` 로:
  - `A` → `➕ [<path>](<path>) (added)`
  - `M` → `✏️ [<path>](<path>) (modified)`
  - `D` → `🗑 [<path>](<path>) (removed)`
  - `R<score>` → `↪ [<old-path>](<old-path>) → [<new-path>](<new-path>) (renamed)`
- 출력이 비어있으면 `## Docs` 섹션 자체를 **생략** (빈 헤딩 만들지 않음).

PR 생성 (HEREDOC):

```bash
gh pr create --title "<PR title — English, explicit scope>" --body "$(cat <<'EOF'
## Summary
- <bullet 1 (English)>
- <bullet 2>
- (optional) <bullet 3>

## Docs
- <doc-change bullet — from extraction above. Omit this section entirely if empty>

## Test plan
- <past-tense item describing what was already verified in this PR — e.g. "Ran `pnpm typecheck` and `pnpm lint` — both pass">
- <e.g. "Verified Home FAB layout in browser at 375px and 1024px widths">
- <e.g. "Manually tested period add via FAB modal — toast appears, data persists after reload">
- (if anything could not be verified) **Not yet verified:** <item>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### PR title 규칙

- **항상 영어**. 커밋 첫 줄이 한국어여도 PR title 은 영어로 다시 작성.
- **명백/구체적**: 나중에 PR 목록만 봐도 무슨 작업인지 기억나도록 핵심 스코프(영향 받은 화면/모듈/STEP 번호 등)를 포함.
- 형식: `<type>(<scope>): <what changed>` — 예: `feat(home): overlay upload + crop dialog`, `chore(eslint): migrate to flat config`.
- 너무 길지 않게 — 90자 이내 권장.

### PR body 규칙

- **너무 길지 않게**. Summary 는 3-6 bullet 으로 핵심만. 세부 파일 나열 금지.
- 커밋이 여러 영역(앱 코드 + Claude 환경 + 문서 + 툴체인 등)을 묶었다면 **영역별로 짧은 소제목** 사용 가능 (예: `### App`, `### Claude 작업 환경`, `### 툴체인`).
- `## Docs` 섹션은 위 추출 명령 결과로 **자동 생성** — Summary 에 문서 변경을 중복 나열하지 않음.
- Test plan 은 영향 표면(홈/캘린더/인사이트/로그/설정/인증 등) 기준으로 체크리스트.

## STEP 8 — 결과 보고

다음 정보를 짧게 보고:

- 사용된 브랜치 이름
- 커밋 SHA (짧은 형태, `git rev-parse --short HEAD`)
- PR URL (gh 출력에서)
- (STEP 5 에서 docs 갱신 있었으면) curator 가 추가/수정한 문서 파일 개수
- (필요 시) 다음 단계 안내 (예: "리뷰 받고 머지하세요")

## 안전 규칙

- main / master / develop / release 브랜치에 직접 push 금지.
- `--force` / `--no-verify` / `--no-gpg-sign` 금지.
- pre-commit hook 실패 시: hook 무시 X — 근본 원인 수정 후 새 커밋.
- 검증 실패 시 절대 진행하지 않음. 사용자에게 명확히 무엇이 왜 실패했는지 보고.
- 사용자의 staged changes 가 비어있으면 자동 `git add -A` 로 모두 스테이지. 단 `.env*`, credential 파일 류 보이면 경고 후 사용자 확인.
