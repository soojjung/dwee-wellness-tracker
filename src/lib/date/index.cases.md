# `lib/date` — Unit test cases

대상: `src/lib/date/index.ts` 의 `ISO_DATE_RE` 정규식 + `isValidISODate(s: unknown): s is ISODate` 타입 가드.

Last run: 2026-06-10 — 17/17 passed

## `ISO_DATE_RE`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | matches a well-formed YYYY-MM-DD string | `'2026-02-01'` | `true` | ✅ |
| 2 | does not match strings missing zero padding | `'2026-2-1'` | `false` | ✅ |
| 3 | does not match strings without dashes | `'20260201'` | `false` | ✅ |

## `isValidISODate`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 4 | returns true for a well-formed date | `'2026-02-01'` | `true` | ✅ |
| 5 | returns true for a leap-year Feb 29 | `'2024-02-29'` | `true` | ✅ |
| 6 | returns true for year/month boundaries | `'2026-12-31'`, `'2026-01-01'` | `true` (both) | ✅ |
| 7 | returns false when the format is wrong (single-digit month/day) | `'2026-2-1'` | `false` | ✅ |
| 8 | returns false when the format is wrong (no dashes) | `'20260201'` | `false` | ✅ |
| 9 | returns false when the format is wrong (slashes) | `'2026/02/01'` | `false` | ✅ |
| 10 | returns false for a non-date string | `'not a date'` | `false` | ✅ |
| 11 | returns false for an invalid month (> 12) | `'2026-13-01'` | `false` | ✅ |
| 12 | returns false for an invalid day (Feb 30) | `'2026-02-30'` | `false` | ✅ |
| 13 | returns false for Feb 29 on a non-leap year | `'2025-02-29'` | `false` | ✅ |
| 14 | returns false for non-string inputs | `undefined`, `null`, `123`, `{}`, `[]` | `false` (all) | ✅ |
| 15 | returns false for an empty string | `''` | `false` | ✅ |

**Notes**
- `ISO_DATE_RE` 는 문자열 형식만 검사 (regex). 의미적 유효성(예: 2026-02-30, 2025-02-29)은 통과시킨다.
- `isValidISODate` 는 regex 통과 + `parseISO`의 `isValid` 둘 다 만족해야 true. 두 단계로 잘못된 값을 잡는다.
