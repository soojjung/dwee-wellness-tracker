# `lib/date/monthWeeks` — Unit test cases

대상: `src/lib/date/monthWeeks.ts` 의 `buildMonth(year, monthIndex)` (생리 선택 시트 전용 월 그리드 — leading/trailing null 패딩, `calendarGrid` 와는 다른 null 패딩 의미).

Last run: 2026-09-21 — 10/10 passed

| #   | 설명 (`it` title)                                            | 입력          | 기대 결과                                    | 결과 |
| --- | --------------------------------------------------------------- | ------------- | ----------------------------------------------- | ---- |
| 1   | pads leading nulls up to the first weekday of the month         | `(2026, 8)`   | 첫 주 앞 2칸 `null`, 세 번째 칸 `'2026-09-01'` | ✅   |
| 2   | has no leading nulls when the month starts on Sunday             | `(2026, 1)`   | 첫 주 첫 칸 `'2026-02-01'`                      | ✅   |
| 3   | pads trailing nulls to complete the final week of 7              | `(2026, 8)`   | 마지막 주 길이 7, 끝 3칸 `null`                 | ✅   |
| 4   | produces exactly 5 weeks for a month needing 5 rows              | `(2026, 8)`   | `weeks.length === 5`                            | ✅   |
| 5   | produces exactly 4 weeks when the month exactly fills whole weeks | `(2026, 1)`  | `weeks.length === 4`, 모든 칸 non-null          | ✅   |
| 6   | produces exactly 6 weeks for a month needing 6 rows               | `(2026, 7)`  | `weeks.length === 6`                            | ✅   |
| 7   | every week has exactly 7 cells                                    | `(2026, 7)`  | 모든 주 `length === 7`                          | ✅   |
| 8   | builds the key as zero-padded YYYY-MM                             | `(2026,0)` / `(2026,11)` | `'2026-01'` / `'2026-12'`             | ✅   |
| 9   | renders ko and en month names                                     | `(2026, 5)`  | `labelKo='6월'`, `labelEn='June'`               | ✅   |
| 10  | lists every in-month date exactly once across all weeks, in order | `(2026, 8)`  | 30개, 첫 `'2026-09-01'`, 끝 `'2026-09-30'`      | ✅   |

**Notes**

- 요일 사실은 `src/lib/date/index.cases.md` 의 `calendarGrid` 노트와 동일한 기준(2026-09-01=Tue, 2026-02-01=Sun, 2026-08-01=Sat)을 재사용.
- 이 함수는 `calendarGrid` 와 달리 달 밖 날짜를 아예 `null` 로 비운다(이웃 달 날짜를 채우지 않음) — `PeriodSelectSheet` 의 시작/종료일 선택 그리드 전용.
- `src/components/app/PeriodSelectSheet.tsx` 에서 로컬 정의를 이곳으로 옮김 (as-is, 동작 변경 없음).
