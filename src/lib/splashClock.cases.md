# splashClock — Unit test cases

Last run: 2026-09-24 — 4/4 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns the full hold when the splash was never marked | mark 없음, `splashRemainingMs(2000, 5000)` | `2000` (mark 가 없으면 지금 막 보인 것으로 간주) | ✅ |
| 2 | counts from the mark, not from navigation start | `markSplashShown(3000)` → `splashRemainingMs(2000, 3500)` | `1500` | ✅ |
| 3 | returns 0 once the hold has passed | `markSplashShown(1000)` → now `3000`, `9000` | 둘 다 `0` (음수로 내려가지 않음) | ✅ |
| 4 | keeps the first mark when marked again | `markSplashShown(1000)` → `markSplashShown(2500)` → `splashRemainingMs(2000, 2500)` | `500` (두 번째 mark 무시) | ✅ |

- 각 테스트 후 `afterEach`에서 `resetSplashClock()`으로 모듈 스코프 상태(`shownAt`)를 초기화해 테스트 간 격리.
