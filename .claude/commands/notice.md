---
description: 앱 버전 공지사항(마이페이지 → 공지사항) 초안 작성
argument-hint: '[버전, 생략 시 package.json version]'
---

# /notice — 버전 공지 작성

1. 버전 = 인자 또는 `package.json` 의 `version`. 날짜 = 오늘(`YYYY-MM-DD`).
2. `src/content/notices/en.ts` 에 이미 같은 버전이 있으면 "이미 있어요, 다시 쓸까요?" 라고 먼저 묻는다.
3. `release-notes-writer` 에이전트를 호출한다 (버전·날짜 전달, 범위는 에이전트 기본값).
4. 에이전트가 돌려준 en / ko bullet 을 사용자에게 그대로 보여주고 수정 요청을 받는다. 수정은 두 파일에 같이 반영.
5. i18n 규칙상 사용자 노출 문구이므로 `i18n-localization-expert` 로 en/ko 한 번 검토.
6. 사용자가 확인하면 `src/content/notices/{en,ko}.ts` 만 커밋한다 (`docs(notices): <version> release notes`). push 는 하지 않는다.
