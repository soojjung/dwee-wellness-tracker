# `lib/errorMessage` — Unit test cases

대상: `src/lib/errorMessage.ts` 의 `errorMessage(e: unknown): string`. `catch` 블록에서 받은 값을 `Error` 로 단언(cast)해 `.message` 를 꺼내는 헬퍼 — 런타임 가드는 없음 (의도된 계약).

Last run: 2026-09-21 — 7/7 passed

| #   | 설명 (`it` title)                                              | 입력                          | 기대 결과              | 결과 |
| --- | ---------------------------------------------------------------- | ------------------------------- | ------------------------ | ---- |
| 1   | returns the message from a native Error instance                 | `new Error('boom')`             | `'boom'`                 | ✅   |
| 2   | returns the message from an Error subclass instance              | `new TypeError('nope')`         | `'nope'`                 | ✅   |
| 3   | returns the message property from a plain object shaped like an Error | `{ message: 'custom failure' }` | `'custom failure'`       | ✅   |
| 4   | returns undefined when the object has no message property        | `{}`                             | `undefined`               | ✅   |
| 5   | returns undefined when called with a string primitive            | `'plain string'`                | `undefined`               | ✅   |
| 6   | throws when called with null                                     | `null`                           | throws                   | ✅   |
| 7   | throws when called with undefined                                | `undefined`                      | throws                   | ✅   |

**Notes**

- 함수 시그니처는 `string` 을 반환한다고 선언하지만, 실제로는 `(e as Error).message` 캐스팅이라 `message` 프로퍼티가 없는 입력에서는 런타임에 `undefined` 를 반환한다 (row #4, #5) — 타입과 실제 동작의 차이를 그대로 문서화. 고치지 않음 (`errorMessage.ts` 상단 주석에 "이 헬퍼의 의도된 계약"이라 명시되어 있음).
- `null`/`undefined` 입력은 프로퍼티 접근 자체가 `TypeError` 를 던진다 (row #6, #7) — 호출측이 `catch (e)` 로 받은 값을 그대로 넘긴다는 전제이므로 이 경계는 실무에서 거의 발생하지 않지만, 명시적으로 문서화.
