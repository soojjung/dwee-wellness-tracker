# phase — Unit test cases

Last run: 2026-09-30 — 24/24 passed

Test reference: `src/domain/cycle/phase.test.ts`

Context: Grace window (PERIOD_LATE_GRACE_DAYS = 14) added 2026-09-30 to keep 'luteal' phase while period is due/late but not yet logged. Once overdue > 14 days, falls back to 'unknown'.

## currentPhase — No periods / negative dayInCycle

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns unknown when no periods exist | `periods=[]` | `{ phase: 'unknown', confidence: 'unknown' }` | ✅ |
| 2 | returns unknown when today is before last period start | `lastPeriod='2026-06-05', today='2026-06-04'` (dayInCycle < 0) | `{ phase: 'unknown', confidence: 'low' }` | ✅ |

## currentPhase — Menstrual phase

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 3 | returns menstrual for day 0-4 (within period length) | `startDate='2026-06-04', today='2026-06-04', periodLen=5` (dayInCycle=0) | `phase: 'menstrual'` | ✅ |
| 4 | returns menstrual for day 4 (end of 5-day period) | `startDate='2026-06-04', today='2026-06-08'` (dayInCycle=4) | `phase: 'menstrual'` | ✅ |
| 5 | leaves menstrual phase at day 5 | `startDate='2026-06-04', today='2026-06-09'` (dayInCycle=5) | `phase: 'follicular'` (not menstrual) | ✅ |

## currentPhase — Follicular phase

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 6 | returns follicular after menstrual, before ovulation | `startDate='2026-06-04', today='2026-06-10'` (dayInCycle=6, cycle=28, ovulation=14) | `phase: 'follicular'` | ✅ |
| 7 | stays follicular on day 11 (before ovulation window starts at day 12) | `startDate='2026-06-04', today='2026-06-15'` (dayInCycle=11, ovulation window starts at 12) | `phase: 'follicular'` | ✅ |

## currentPhase — Ovulation phase

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 8 | returns ovulation around day 14 (cycle 28) | `startDate='2026-06-04', today='2026-06-16'` (dayInCycle=12, window 12-15) | `phase: 'ovulation'` | ✅ |
| 9 | ovulation window is days 12-15 for 28-day cycle | loop `dayInCycle=12..16, check phase='ovulation'` | `ovulationDays=[12,13,14,15]` | ✅ |

Notes on ovulation window:
- `ovulationDay = cycle - 14 = 28 - 14 = 14`
- window: `dayInCycle >= ovulationDay - 2` && `dayInCycle <= ovulationDay + 1`
- bounds: `dayInCycle ∈ [12, 15]`

## currentPhase — Normal luteal phase

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 10 | returns luteal after ovulation, before predicted cycle end | `startDate='2026-06-04', today='2026-06-24'` (dayInCycle=20, cycle=28) | `phase: 'luteal'` | ✅ |
| 11 | leaves luteal phase at cycle end | `startDate='2026-06-04', today='2026-07-01'` (dayInCycle=27) | `phase: 'luteal'` (still in) | ✅ |

## currentPhase — Grace window (period due/late, not logged)

Grace window = 14 days. Period overdue by up to 14 days stays 'luteal' with low confidence. Beyond 14 days → 'unknown'.

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 12 | returns luteal with low confidence when period is due (dayInCycle >= cycle) | `startDate='2026-06-04', today='2026-07-02'` (dayInCycle=28, cycle=28) | `{ phase: 'luteal', confidence: 'low' }` | ✅ |
| 13 | returns luteal with low confidence at cycle + 7 days (mid-grace) | `startDate='2026-06-04', today='2026-07-09'` (dayInCycle=35) | `{ phase: 'luteal', confidence: 'low' }` | ✅ |
| 14 | returns luteal with low confidence at cycle + 13 days (end of grace window) | `startDate='2026-06-04', today='2026-07-15'` (dayInCycle=41) | `{ phase: 'luteal', confidence: 'low' }` | ✅ |
| 15 | returns unknown at cycle + 14 days (outside grace window) | `startDate='2026-06-04', today='2026-07-16'` (dayInCycle=42) | `{ phase: 'unknown', confidence: 'low' }` | ✅ |
| 16 | returns unknown at cycle + 30 days (far beyond grace window) | `startDate='2026-06-04', today='2026-08-02'` (dayInCycle=58) | `{ phase: 'unknown', confidence: 'low' }` | ✅ |

Grace window boundaries (cycle=28):
- `dayInCycle ∈ [28, 41]` → `phase='luteal', confidence='low'`
- `dayInCycle ≥ 42` → `phase='unknown'`

## currentPhase — Confidence levels

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 17 | returns low confidence with 1 period outside grace window | `periods=[a], dayInCycle=10` | `confidence: 'low'` | ✅ |
| 18 | returns low confidence with 2 periods outside grace window | `periods=[a,b], dayInCycle=10` | `confidence: 'low'` | ✅ |
| 19 | returns medium confidence with 3+ periods outside grace window | `periods=[a,b,c], dayInCycle=10` | `confidence: 'medium'` | ✅ |
| 20 | returns low confidence with 3+ periods but in grace window | `periods=[a,b,c], dayInCycle=30` (in grace) | `{ phase: 'luteal', confidence: 'low' }` | ✅ |

Confidence rule:
- Grace window active (dayInCycle ≥ cycle): always `'low'`
- Grace window inactive: `'medium'` if periods.length ≥ 3, else `'low'`

## currentPhase — PERIOD_LATE_GRACE_DAYS constant

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 21 | is set to 14 days | `PERIOD_LATE_GRACE_DAYS` | `14` | ✅ |

## currentPhase — Edge cases (non-standard cycle lengths)

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 22 | works with 21-day cycle (short) | `averageCycleLength=21; startDate='2026-06-04'` | day 21 → luteal; day 22 → luteal(low); day 35 → unknown | ✅ |
| 23 | works with 35-day cycle (long) | `averageCycleLength=35; startDate='2026-06-04'` | day 35 → luteal; day 36 → luteal(low); day 49 → unknown | ✅ |

Grace window adjusts with cycle length:
- 21-day cycle: grace ends at day 35 (21+14)
- 28-day cycle: grace ends at day 42 (28+14)
- 35-day cycle: grace ends at day 49 (35+14)

## currentPhase — Multiple periods (most recent is used)

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 24 | uses last period for dayInCycle calculation | `periods=[a:'2026-05-01', b:'2026-06-04'], today='2026-06-14'` | dayInCycle from b (10 days), phase='follicular' | ✅ |

## Design notes

- Introduced `PERIOD_LATE_GRACE_DAYS = 14` constant to bound the pre-period (luteal) assumption when a period is due/late but no start date has been logged.
- Grace window rationale: ~14 days matches the luteal phase length in a standard 28-day cycle. Allows a reasonable buffer for cycle variation and late periods without asserting menstrual without a record.
- Confidence during grace window is always 'low' to signal uncertainty to UI consumers (not yet a logged period).
- Snapshot seeds (seedForPhase.ts) use 60 days ago for 'unknown', which is > 28 + 14 = 42, so grace window doesn't affect snapshot data.
