# loginEntrance — Unit test cases

Last run: 2026-09-19 — 4/4 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns false when nothing was queued | 사전에 `queueLoginEntrance()` 호출 없음 | `consumeLoginEntrance() === false` | ✅ |
| 2 | returns true once after queueLoginEntrance was called | `queueLoginEntrance()` → `consumeLoginEntrance()` | `=== true` | ✅ |
| 3 | returns false on a second consume after being drained | `queueLoginEntrance()` → `consumeLoginEntrance()` → `consumeLoginEntrance()` | 두 번째 호출 결과 `=== false` (한 번 소비하면 즉시 초기화) | ✅ |
| 4 | collapses duplicate queueLoginEntrance calls into a single consume | `queueLoginEntrance()` x2 → `consumeLoginEntrance()` x2 | 첫 결과 `true`, 두 번째 `false` (중복 queue 는 누적되지 않음) | ✅ |

- 각 테스트 후 `afterEach`에서 `consumeLoginEntrance()`를 호출해 모듈 스코프 상태(`pending`)가 테스트 간에 새지 않도록 격리함.
