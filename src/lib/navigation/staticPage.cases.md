# `staticPage` — Unit test cases

대상: `src/lib/navigation/staticPage.ts`

Last run: 2026-10-16 — 7/7 passed

GNB 먹통 안전장치(R7-8)용. Capacitor iOS 는 확장자 없는 주소에 루트 index.html 을 주므로, 탭 페이지를 새로 열 땐 `index.html` 을 붙여 열고 부팅 직후 주소에서 뗀다.

## `staticPagePath(href)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | maps the root to /index.html | `'/'` | `'/index.html'` | ✅ |
| 2 | adds the slash and index.html to a tab path | `'/log'` | `'/log/index.html'` | ✅ |
| 3 | keeps an existing trailing slash | `'/magazine/'` | `'/magazine/index.html'` | ✅ |

## `stripIndexHtml(pathname)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 4 | strips index.html from the root | `'/index.html'` | `'/'` | ✅ |
| 5 | strips index.html from a nested path, keeping the trailing slash | `'/log/index.html'` | `'/log/'` | ✅ |
| 6 | returns null for a normal address | `'/log/'` | `null` | ✅ |
| 7 | ignores a file merely ending in index.html | `'/foo-index.html'` | `null` | ✅ |
