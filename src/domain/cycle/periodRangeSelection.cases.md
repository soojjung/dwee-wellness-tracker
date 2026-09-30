# `periodRangeSelection` — Unit test cases

대상: `src/domain/cycle/periodRangeSelection.ts`

Last run: 2026-09-30 — 14/14 passed

## `tapRangeDate(selection, date)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | sets the start when there is no selection yet | `selection=null`, `date='2026-06-10'` | `{start:'2026-06-10',end:null}` | ✅ |
| 2 | clears the selection when the lone start is tapped again | `selection={start:'2026-06-10',end:null}`, `date='2026-06-10'` | `null` | ✅ |
| 3 | sets the end when a later date is tapped after the start | `selection={start:'2026-06-10',end:null}`, `date='2026-06-14'` | `{start:'2026-06-10',end:'2026-06-14'}` | ✅ |
| 4 | sets the end even when the second tap is before the start (order-independent) | `selection={start:'2026-06-10',end:null}`, `date='2026-06-05'` | `{start:'2026-06-10',end:'2026-06-05'}` | ✅ |
| 5 | starts a brand-new range when tapping again after a full range exists | `selection={start:'2026-06-10',end:'2026-06-14'}`, `date='2026-06-20'` | `{start:'2026-06-20',end:null}` | ✅ |
| 6 | starts a new range even if the tapped date is inside the existing range | `selection={start:'2026-06-10',end:'2026-06-14'}`, `date='2026-06-12'` | `{start:'2026-06-12',end:null}` | ✅ |

**Notes**
- 행 4: `end` 은 탭한 순서 그대로 저장한다 (정렬은 `rangeBounds` 책임). 시작보다 이른 날짜를 두 번째로 눌러도 그대로 받아들인다.
- 행 6: "가득 찬 범위에서 다시 탭하면 새 범위 시작" 규칙은 탭한 위치가 기존 범위 안이든 밖이든 동일하게 적용된다.

## `rangeBounds(selection)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 7 | returns hi=null for a start-only selection | `{start:'2026-06-10',end:null}` | `{lo:'2026-06-10',hi:null}` | ✅ |
| 8 | keeps forward order as-is | `{start:'2026-06-10',end:'2026-06-14'}` | `{lo:'2026-06-10',hi:'2026-06-14'}` | ✅ |
| 9 | flips a reversed tap order into lo/hi | `{start:'2026-06-14',end:'2026-06-10'}` | `{lo:'2026-06-10',hi:'2026-06-14'}` | ✅ |
| 10 | handles a same-day range | `{start:'2026-06-10',end:'2026-06-10'}` | `{lo:'2026-06-10',hi:'2026-06-10'}` | ✅ |

## `isInPeriodRange(selection, date)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 11 | returns false for every date when selection is null | `selection=null`, `date='2026-06-10'` | `false` | ✅ |
| 12 | is true only for the start date when only a start is tapped | `selection={start:'2026-06-10',end:null}` | `'2026-06-10'→true`, `'2026-06-11'→false`, `'2026-06-09'→false` | ✅ |
| 13 | is true for every date within a forward range, inclusive | `selection={start:'2026-06-10',end:'2026-06-12'}` | `'2026-06-10'/'11'/'12'→true`, `'2026-06-13'→false` | ✅ |
| 14 | is true for every date within a reversed-tap range, inclusive | `selection={start:'2026-06-14',end:'2026-06-12'}` | `'2026-06-12'/'13'/'14'→true`, `'2026-06-11'→false` | ✅ |

**Notes**
- 행 12~14: `isInPeriodRange` 는 `rangeBounds` 로 정렬한 뒤 포함 여부만 판단하는 얇은 래퍼 — 탭 순서와 무관하게 항상 올바른 범위를 하이라이트한다.
