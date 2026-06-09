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

## STEP 2.5 — 머지된 로컬 브랜치 정리

PR 머지 시 GitHub 가 원격 브랜치를 자동 삭제 (repo Settings → "Automatically delete head branches" ON 전제). 그 결과 원격이 사라진 로컬 브랜치를 안전하게 정리.

```bash
git fetch --prune
git branch -vv | awk '/: gone\]/ {print $1}'
```

출력이 비어있으면 이 STEP 스킵하고 STEP 3 진행.

머지 확인 헬퍼 (각 후보 브랜치마다):
```bash
gh pr list --state merged --head <branch> --json number,mergedAt --limit 1
```

### 2.5.a — 현재 체크아웃된 브랜치가 후보인 경우 (= 내가 작업 중인 브랜치의 PR 이 머지된 케이스)

자기 자신은 직접 삭제 불가. PR 머지 확인되면 자동으로 main 이동 + 삭제.

1. 위 헬퍼로 머지 확인.
2. **머지 확인됨**:
   - uncommitted 변경이 있으면 `git stash push -u -m "auto-stash for /commit cleanup"` 으로 보관.
   - `git checkout main && git pull --ff-only origin main` — main 최신화.
   - `git branch -D <previous-branch>` — squash/rebase merge 로 커밋 해시가 달라 `-d` 가 거부할 수 있으니 강제 삭제 (PR 머지가 확인됐으므로 안전).
   - 스태시 된 게 있으면 `git stash pop` (conflict 시 사용자에게 알리고 중단).
   - 보고: "<branch> PR 머지 확인 → main 으로 이동 + 로컬 브랜치 삭제 완료."
   - 이후 흐름: 이제 main 위에 있으므로 STEP 3 (변경사항 있으면 새 브랜치 생성) 으로 진행. STEP 2 의 "현재 브랜치 ≠ main → STEP 4 로 점프" 결정은 무효화.
3. **머지 미확인**: 자동 이동/삭제 안 함. "현재 브랜치 <name> 원격이 사라졌지만 머지 PR 이 보이지 않아요. 수동 확인 필요." 안내하고 STEP 4 로 점프.

### 2.5.b — 다른 후보 브랜치 정리

현재 브랜치가 아닌 나머지 후보 각각:

1. 위 헬퍼로 머지 확인.
2. 머지 확인되면 `git branch -d <branch>` → 거부 시 `git branch -D <branch>` (squash merge 대응).
3. 머지 미확인: "<branch> 원격이 없는데 머지 PR 도 없어 보여요. 수동 확인 필요." 안내, 자동 삭제 안 함.

### 안전 조건

- `gh` 미설치/미인증 → 머지 확인 불가. 자동 삭제·이동 모두 건너뛰고 후보 목록만 보고.

삭제한 브랜치 및 자동 main 이동 여부는 STEP 8 보고에 포함.

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

단일 게이트로 lint + typecheck + Vitest unit + Playwright e2e (visual baseline + 런타임 에러 가드) 를 순차 실행.

```bash
pnpm test < /dev/null 2>&1
```

내부 체인 (`package.json` 의 `"test"` script): `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:e2e`.

- 어느 단계든 실패하면 즉시 중단하고 사용자에게 에러 출력 + 원인 보고.
- `pnpm lint` 가 interactive 프롬프트로 실패하면 (Next.js ESLint 마이그레이션 안내 등): "lint 설정이 필요해요 — 일단 건너뛰고 진행할까요?" 라고 사용자에게 묻고 답에 따라 진행/중단.
- `pnpm test:unit` 실패 시: 실패 케이스의 원인 (테스트 잘못 vs 구현 잘못) 을 사용자에게 보고하고 결정 받기. STEP 4.5 에서 처리될 가능성 있으므로, 단순 누락 케이스라면 STEP 4.5 호출 후 재실행도 옵션.
- `pnpm test:e2e` 가 시각 회귀로 실패하면 (`toHaveScreenshot` diff): 변경이 의도된 UI/카피 수정이라면 사용자 동의 후 `pnpm test:e2e:update` 로 baseline 갱신, 그 결과를 같이 스테이지에 포함. 의도하지 않은 회귀라면 코드 수정 후 재실행.
- 실제 lint/type/test 에러는 항상 블로킹 — `--no-verify` 같은 우회 금지.

## STEP 4.5 — 단위 테스트 보강 (unit-test-author)

순수 함수가 추가/변경됐을 때 Vitest 테스트와 케이스 표를 자동으로 작성·갱신·실행.

### 트리거 확인

```bash
git diff --name-only origin/main...HEAD -- 'src/domain/**/*.ts' 'src/lib/**/*.ts' \
  | grep -vE '\.test\.ts$|\.cases\.md$'
```

출력이 비어있으면 이 STEP 통째로 스킵하고 STEP 5 진행.

### 호출

`Agent` tool 의 `subagent_type=unit-test-author` 로 호출. 프롬프트에 다음을 포함:

- 위 트리거 명령의 출력 (테스트 대상 후보 파일 목록)
- `git diff --stat origin/main...HEAD` 요약
- 지시문: "(1) 위 파일들 중 `src/domain/**` 또는 `src/lib/**` 의 순수 함수에 대해 `*.test.ts` 와 짝 `*.cases.md` (마크다운 표) 를 신규 작성하거나 기존 케이스를 갱신해 줘. (2) `pnpm test:unit` 실행해서 모두 통과해야 완료로 보고. 실패 시 원인 (테스트 잘못 vs 구현 잘못) 진단 후 사용자에게 보고. (3) 스코프 밖 파일 (store, adapter, React 컴포넌트) 은 건너뛰고 그 이유 한 줄로 적어 줘."

### 결과 처리

- 에이전트가 `*.test.ts` / `*.cases.md` 를 추가/수정하면 working tree 에 반영됨. STEP 6 의 `git add -A` 에서 자동 포함.
- 에이전트가 "no unit test needed" 또는 "all targets out of scope" 로 회신 → 그대로 STEP 5 진행.
- 사용자에게 "단위 테스트 N개 추가/갱신, 모두 통과" 1줄로 보고.
- 만약 에이전트가 구현 버그를 발견해서 멈췄으면 (테스트가 깨졌고 테스트 잘못이 아닌 경우): commit 중단 후 사용자에게 버그 내용 보고. 사용자 결정 받고 진행.

### 안전 조건

- `pnpm test:unit` 가 STEP 4 에서 이미 실패해서 들어왔다면, STEP 4.5 에서 신규 케이스를 보강 + 재실행 후 STEP 4 의 unit 게이트를 다시 통과시켜야 STEP 5 로 진행 가능.
- 새로 만든 `.test.ts` / `.cases.md` 는 항상 `pnpm test:unit` 통과 상태로만 커밋에 포함.

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

**푸시 직후 SHA 캡처** (Docs 링크·이미지 URL 모두 이 SHA 기반으로 박음):

```bash
SHA=$(git rev-parse --short HEAD)
OWNER_REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
```

⚠️ **중요 — Bash 호출 분리되면 변수 사라짐.** Claude Code 의 Bash tool 은 호출마다 독립 셸 세션이라 `SHA` 같은 변수는 다음 호출까지 살아남지 않음. 두 가지 안전 패턴:

1. **SHA 캡처 + PR 생성을 한 Bash 호출 안에서**: `SHA=$(git rev-parse --short HEAD) && gh pr create --body "..."` 로 묶어서 실행. HEREDOC 안의 `$SHA` 가 정상 expand 됨 (`<<EOF` 사용, `<<'EOF'` 아님).
2. **PR body 작성 시 SHA 를 리터럴로 박기**: 캡처한 SHA 문자열을 직접 본문에 박아넣고 `<<'EOF'` (literal heredoc) 으로 안전하게 작성. 변수 미해결로 인한 `blob//<path>` 404 사고를 원천 차단.

둘 중 어느 쪽이든 가능하지만 (2) 가 디버깅 친화적 (PR body 가 SHA 와 함께 그대로 보임).

**PR body 구성 전 문서 변경 추출** (PR body 에 포함시킬 데이터):

```bash
git diff --name-status origin/main...HEAD -- 'docs/**' '*.md' '.claude/rules/**' '.claude/agents/**' '.claude/commands/**' 'README*' 'CLAUDE.md'
```

- 출력이 있으면 status code 별로 그룹핑해 PR body 의 `## Docs` 섹션 bullet 으로 변환. **경로는 SHA 기반 절대 URL** (`https://github.com/<owner>/<repo>/blob/<sha>/<path>`) 로 — relative path 는 새로 추가된 파일이 base branch 에 아직 없을 때 404 가 나고, branch name 은 머지 후 broken. SHA 는 영구.
  - `A` → `➕ [<path>](https://github.com/<owner>/<repo>/blob/<sha>/<path>) (added)`
  - `M` → `✏️ [<path>](https://github.com/<owner>/<repo>/blob/<sha>/<path>) (modified)`
  - `D` → `🗑 <path> (removed)` — 삭제된 파일은 현재 트리에 없어 링크 불가, 텍스트만.
  - `R<score>` → `↪ [<old-path>](https://github.com/<owner>/<repo>/blob/<sha>~1/<old-path>) → [<new-path>](https://github.com/<owner>/<repo>/blob/<sha>/<new-path>) (renamed)` — old 는 직전 부모 커밋(`<sha>~1`).
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
- [x] <past-tense item already verified in this PR — e.g. "Ran `pnpm typecheck` and `pnpm lint` — both pass">
- [x] <e.g. "Verified Home FAB layout in browser at 375px and 1024px widths">
- [x] <e.g. "Manually tested period add via FAB modal — toast appears, data persists after reload">
- [ ] (only if something genuinely could not be verified) **Not yet verified:** <item>

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

- **항상 영어로 작성**. 커밋 메시지가 한국어여도 PR body 는 영어로 다시 표현.
- **너무 길지 않게**. Summary 는 3-6 bullet 으로 핵심만. 세부 파일 나열 금지.
- 커밋이 여러 영역(앱 코드 + Claude 환경 + 문서 + 툴체인 등)을 묶었다면 **영역별로 짧은 소제목** 사용 가능 (예: `### App`, `### Claude harness`, `### Toolchain`).
- `## Docs` 섹션은 위 추출 명령 결과로 **자동 생성** — Summary 에 문서 변경을 중복 나열하지 않음. 경로는 STEP 7 의 SHA 기반 절대 URL (`[<path>](https://github.com/<owner>/<repo>/blob/<sha>/<path>)`) 로 박음 — relative path 는 새 파일이면 404, branch URL 은 머지 후 broken.
- **이미지 임베드는 commit SHA 기반 raw URL** — GitHub PR body 안에서 markdown 의 relative path (`![](tests/snapshots/x.png)`) 는 자동 변환되지 않아 broken icon 으로 보이고, branch name 기반 URL 은 PR 머지 후 branch 삭제와 함께 broken 이 됨. **SHA 는 영구**. 형식:
  ```html
  <img src="https://raw.githubusercontent.com/<owner>/<repo>/<commit-sha>/<path>" width="240" />
  ```
  STEP 7 푸시 직후 `git rev-parse HEAD` 의 short SHA (7자 이상) 를 캡처해 모든 이미지 URL 에 박음. PR 에 추가 커밋이 푸시돼도 기존 URL 은 그대로 유효 (해당 SHA 가 트리에 영구 보존). 머지 후에도 동일하게 작동.
- **Test plan = 이 PR 에서 이미 검증된 항목의 로그** — 사용자에게 떠넘기는 체크리스트가 아님. 과거형/완료형 (`Ran ...`, `Verified ...`, `Manually tested ...`). **이미 검증된 항목은 `- [x]` 체크된 체크박스** 로 ("done" 시각 표현). 검증하지 못한 항목만 `- [ ] **Not yet verified:** <item>` 로 빈 체크박스 사용 — 이 경우 PR 본문 안에서 한눈에 미검증 항목이 드러남.

## STEP 8 — Figma 스냅샷 동기화 (dwee 전용)

`tests/snapshots/ko/home-*.png` 가 이 PR 에서 변경됐으면 Figma "Snapshots (ko)" 페이지의 frame 들을 자동 갱신. 변경 없으면 skip.

> **스코프**: `home-*.png` 만 동기화 대상. `customize-*.png` / `log-*.png` / `photo-edit-*.png` 는 e2e 시각 회귀 전용 baseline 이며 Figma 에 업로드하지 않는다.

### 트리거 확인

```bash
git diff --name-only origin/main...HEAD -- 'tests/snapshots/ko/home-*.png'
```

출력이 비어있으면 이 STEP 통째로 스킵하고 STEP 9 진행. 출력이 있으면 그 파일들만 sync.

### 동기화 상수 (dwee 프로젝트 고정)

- Figma fileKey: `E3KcglTsT2dQTnoMyL8YiP`
- Target page name: `Snapshots (ko)`
- Frame naming convention: `home-{phase}` (phase ∈ {menstrual, follicular, ovulation, luteal, unknown})

### ⚠️ 신뢰성 핵심 (2026-06-10 이슈로 확정)

`upload_assets`(count=1, nodeId 지정) + multipart POST 의 single-URL 응답이 `{success: true, imageHash: ...}` 로 와도 **frame 의 `fills` 속성은 자동 갱신되지 않는 경우가 있다**. BlobStore 에 imageHash 만 등록되고 frame 은 옛 fill 을 유지한 채로 끝남. 따라서 다음 2-step 패턴을 **항상** 따른다:

1. **Step A — Upload**: `upload_assets count=1 nodeId=<id>` 로 submitUrl 받기 → multipart POST → 응답에서 `imageHash` 캡처.
2. **Step B — Apply (필수)**: `use_figma` 로 `node.fills = [{type:'IMAGE', imageHash, scaleMode:'FILL'}]` 직접 설정. **이 단계를 생략하면 frame 에 새 fill 이 안 박힌다.**
3. **Step C — Verify**: `get_screenshot nodeId=<id>` 로 frame 캡처해서 새 PNG 가 실제로 박혔는지 눈으로 확인. screenshot 이 옛 버전이면 Step B 가 안 됐다는 신호 — `use_figma` 호출을 다시 검토.

`upload_assets` 단독으로 끝내지 말 것. submitUrl 의 응답 `success: true` 는 BlobStore 등록 성공일 뿐, frame 적용 성공이 아니다.

### 동기화 절차

1. **Figma 파일 페이지 listing**: `mcp__plugin_figma_figma__get_metadata` (fileKey 만 — nodeId 생략하면 페이지 목록 반환). "Snapshots (ko)" 페이지의 GUID 확보.
2. **페이지 없으면 (최초 setup)**: `use_figma` 로 새 페이지 생성 → `upload_assets count=5 batchCommit=true` 로 5개 upload URL + commitUrl 받기 → 5개 PNG multipart POST (`curl -F "file=@<path>;type=image/png"`) → commitUrl 호출 → `use_figma` 로 생성된 frame 5개를 새 페이지로 이동·이름 (`home-{phase}`) 변경·원본 PNG dimension 으로 `resize(w, h)` ·가로 40px 간격으로 정렬·`setCurrentPageAsync(newPage)` 로 전환. (이 단계는 초기 1회만 — 페이지가 생긴 다음 commit 부터는 4번으로 갑니다.)
3. **페이지 있으면**: 해당 페이지에 `get_metadata` 호출 → frame 들의 이름과 `id` 수집 (`home-{phase}` 매칭) + 각 frame 의 `width`/`height`.
4. **변경 파일별 처리 (Upload + Apply + Verify, 위 2-step 패턴 따름)**: STEP 8 트리거 단계에서 추출한 변경 PNG 파일 각각에 대해:
   - 파일명에서 phase 추출 (`home-{phase}.png`).
   - PNG dimension 확인 (`file <png>` 헤더 파싱) 후 frame dimension 과 비교 — 다르면 `use_figma` 로 `node.resize(w, h)` 먼저 호출 (가로 간격 유지하려면 다음 frame 들 `x` 도 같이 보정).
   - **Step A — Upload**: 매칭 frame 있으면 `upload_assets count=1 nodeId=<id>` 로 submitUrl 받기 → multipart POST → `imageHash` 캡처. 매칭 frame 없으면 (신규 phase 등) `use_figma` 로 빈 frame 생성 + append + resize 한 뒤 그 frame ID 로 동일 호출.
   - **Step B — Apply**: 모든 hash 가 모이면 한 `use_figma` 호출로 `await figma.setCurrentPageAsync(snapshotsPage)` 후 각 frame 에 `node.fills = [{type:'IMAGE', imageHash, scaleMode:'FILL'}]` 적용 (배열로 새로 할당해야 변경 감지됨). 반환값에 mutated node IDs 포함.
   - **Step C — Verify**: 적용된 frame 중 최소 1개에 대해 `get_screenshot nodeId=<id> maxDimension=600` 호출해서 결과 PNG 다운로드 → Read 로 시각 확인. 옛 카피·옛 레이아웃이 보이면 Step B 가 반영 안 된 것 — `use_figma` 의 스크립트를 점검하고 재시도.
5. **원본 dimension 재확인 (resize 필수성)**: PNG 사이즈는 phase 별로 다를 수 있음 (높이가 달라짐). 새 PNG dimension 과 frame dimension 이 일치하면 resize 생략 가능하지만 다르면 반드시 `node.resize(w, h)` — `scaleMode: FILL` 이라 비율이 다르면 crop 된다.

### 안전 조건

- Figma MCP 미연결 또는 도구 호출 실패 → 이 STEP 만 skip, "Figma sync 실패 — 수동 동기화 필요" 로 보고. commit/PR 결과는 영향 없음 (이미 STEP 7 까지 끝났음).
- upload URL 은 single-use, 10분 만료 — 받자마자 바로 POST.
- Step B (`use_figma` 로 fill 적용) 누락은 가장 흔한 실패 모드. 보고 단계에서 "Step C verify 통과" 까지 확인했다고 명시할 것.

## STEP 9 — 결과 보고

다음 정보를 짧게 보고:

- 사용된 브랜치 이름
- 커밋 SHA (짧은 형태, `git rev-parse --short HEAD`)
- PR URL (gh 출력에서)
- (STEP 2.5 에서 삭제 있었으면) 정리한 로컬 브랜치 이름 목록 + 자동 main 이동 여부
- (STEP 5 에서 docs 갱신 있었으면) curator 가 추가/수정한 문서 파일 개수
- (STEP 8 에서 Figma sync 있었으면) 동기화된 phase 목록 + 새로 만든 frame 수 (있으면)
- (필요 시) 다음 단계 안내 (예: "리뷰 받고 머지하세요")

## 안전 규칙

- main / master / develop / release 브랜치에 직접 push 금지.
- `--force` / `--no-verify` / `--no-gpg-sign` 금지.
- pre-commit hook 실패 시: hook 무시 X — 근본 원인 수정 후 새 커밋.
- 검증 실패 시 절대 진행하지 않음. 사용자에게 명확히 무엇이 왜 실패했는지 보고.
- 사용자의 staged changes 가 비어있으면 자동 `git add -A` 로 모두 스테이지. 단 `.env*`, credential 파일 류 보이면 경고 후 사용자 확인.
