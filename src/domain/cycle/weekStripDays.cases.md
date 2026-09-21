# weekStripDays — Unit test cases

대상: `src/domain/cycle/weekStripDays.ts` 의 `predictedRange(predictedDate, length)` + `computeState(date, periods, predictedPeriod, fertile)` + `buildDays(today, periods, predictedDate, averagePeriodLength, predictionConfidence)`.

Last run: 2026-09-21 — 14/14 passed

## `predictedRange`

| #   | 설명 (`it` title)                              | 입력                              | 기대 결과                                  | 결과 |
| --- | ------------------------------------------------- | --------------------------------- | --------------------------------------------- | ---- |
| 1   | returns null when predictedDate is null            | `(null, 5)`                       | `null`                                         | ✅   |
| 2   | spans [predictedDate, predictedDate + length - 1]  | `('2026-06-01', 5)`               | `{start:'2026-06-01', end:'2026-06-05'}`       | ✅   |
| 3   | clamps a non-positive length to a single day       | `('2026-06-01', 0)` / `(-3)`      | `{start:end:'2026-06-01'}` (both)              | ✅   |

## `computeState`

우선순위: actualPeriod > predictedPeriod > predictedFertile > `null`. 고정 픽스처: `predictedPeriod={06-10~06-14}`, `fertile={05-20~05-26}`.

| #   | 설명 (`it` title)                                                  | 입력                                          | 기대 결과          | 결과 |
| --- | ---------------------------------------------------------------------- | ---------------------------------------------- | --------------------- | ---- |
| 4   | returns actualPeriod when the date falls in a real period record       | `periods=[06-01~06-05]`, `date='2026-06-03'`   | `'actualPeriod'`      | ✅   |
| 5   | prioritizes actualPeriod over an overlapping predicted period          | `periods=[06-10~06-12]`, `date='2026-06-11'`   | `'actualPeriod'`      | ✅   |
| 6   | returns predictedPeriod when inside the predicted range only           | `periods=[]`, `date='2026-06-12'`              | `'predictedPeriod'`   | ✅   |
| 7   | returns predictedFertile when inside the fertile window only           | `periods=[]`, `date='2026-05-22'`              | `'predictedFertile'`  | ✅   |
| 8   | returns null when the date matches none of the ranges                  | `periods=[]`, `date='2026-07-01'`              | `null`                | ✅   |
| 9   | returns null when predictedPeriod and fertile are both null            | `periods=[]`, `date='2026-06-12'`, both `null` | `null`                | ✅   |
| 10  | treats range boundaries as inclusive                                   | `date` at/just outside `06-10`/`06-14`         | in-range true, out false | ✅ |

## `buildDays`

| #   | 설명 (`it` title)                                                | 입력                                                | 기대 결과                                             | 결과 |
| --- | --------------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------- | ---- |
| 11  | returns 121 days spanning 60 days before/after today, inclusive       | `today='2026-06-15'`, no data                        | `length=121`, first `'2026-04-16'`, last `'2026-08-14'`   | ✅   |
| 12  | marks today actualPeriod when today falls in a real period            | `periods=[06-14~06-16]`, `today='2026-06-15'`        | today's `state='actualPeriod'`                            | ✅   |
| 13  | marks the predicted period range when a prediction exists             | `predictedDate='2026-06-10'`, `averagePeriodLength=4` | `'2026-06-11'` → `'predictedPeriod'`                       | ✅   |
| 14  | produces all-null states when there is no data at all                 | no periods, no prediction                            | every day `state=null`                                     | ✅   |

**Notes**

- `PAST_DAYS`/`FUTURE_DAYS` 는 각 60일 고정 상수 — `buildDays` 의 총 길이는 항상 `60+60+1=121`.
- `src/components/app/WeekStrip.tsx` 에서 그대로 이동. `isPeriodDate` 는 `./cellState`, `predictFertileWindow` 는 `./fertile` 에서 계속 재사용.
- 이 함수들을 쓰는 프레젠테이션 헬퍼(`cellChipClasses` 등)는 `src/components/app/weekStripStyles.ts` 로 분리됨 — 클래스 문자열 테스트는 여기 포함하지 않음(순수 Tailwind 문자열 매핑, 스냅샷 가치가 낮음).
