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

## STEP 5 — 커밋 메시지 작성

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

## STEP 6 — 푸시 + PR

```bash
git push -u origin <new-branch>
```

PR 생성 (HEREDOC):

```bash
gh pr create --title "<PR title — 영어, 명백한 스코프>" --body "$(cat <<'EOF'
## Summary
- <bullet 1>
- <bullet 2>
- (필요 시) <bullet 3>

## Test plan
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm lint` 통과 (또는 N/A)
- [ ] 영향받은 화면 브라우저 확인 — <화면 이름>
- [ ] (필요 시) 추가 검증 항목

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
- 커밋이 여러 영역(앱 코드 + Claude 환경 + 문서 + 툴체인 등)을 묶었다면 **영역별로 짧은 소제목** 사용 가능 (예: `### App`, `### Claude 작업 환경`, `### 문서`, `### 툴체인`).
- `.claude/`, `docs/` 등 Claude/메타 작업이 포함된 경우 **반드시 별도 항목으로 언급** — 코드 변경만 적으면 무엇이 들어갔는지 PR 보고 기억 못 함.
- Test plan 은 영향 표면(홈/캘린더/인사이트/로그/설정/인증 등) 기준으로 체크리스트.

## STEP 7 — 결과 보고

다음 정보를 짧게 보고:

- 사용된 브랜치 이름
- 커밋 SHA (짧은 형태, `git rev-parse --short HEAD`)
- PR URL (gh 출력에서)
- (필요 시) 다음 단계 안내 (예: "리뷰 받고 머지하세요")

## 안전 규칙

- main / master / develop / release 브랜치에 직접 push 금지.
- `--force` / `--no-verify` / `--no-gpg-sign` 금지.
- pre-commit hook 실패 시: hook 무시 X — 근본 원인 수정 후 새 커밋.
- 검증 실패 시 절대 진행하지 않음. 사용자에게 명확히 무엇이 왜 실패했는지 보고.
- 사용자의 staged changes 가 비어있으면 자동 `git add -A` 로 모두 스테이지. 단 `.env*`, credential 파일 류 보이면 경고 후 사용자 확인.
