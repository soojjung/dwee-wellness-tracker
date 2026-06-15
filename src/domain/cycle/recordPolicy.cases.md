# `recordPolicy` — Unit test cases

대상: `src/domain/cycle/recordPolicy.ts`

Last run: 2026-06-16 — 23/23 passed

## `reconcileForNewStart(existing, newStart)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns existingMatch when same startDate already exists (idempotent) | `existing=[log('a','2026-02-01','2026-02-05')]`, `newStart='2026-02-01'` | `existingMatch=existing[0]`, `closeUpdates=[]` | ✅ |
| 2 | returns existingMatch even if existing is still open (no double-add) | `existing=[log('a','2026-02-01')]`, `newStart='2026-02-01'` | `existingMatch=existing[0]`, `closeUpdates=[]` | ✅ |
| 3 | closes a single open record with endDate = newStart − 1 day | `existing=[log('a','2026-02-01')]`, `newStart='2026-03-01'` | `existingMatch=null`, `closeUpdates=[{id:'a',endDate:'2026-02-28'}]` | ✅ |
| 4 | closes all open records that start before the new startDate | `existing=[log('a','2026-01-15'),log('b','2026-02-10')]`, `newStart='2026-03-01'` | `existingMatch=null`, `closeUpdates=[{id:'a',endDate:'2026-02-28'},{id:'b',endDate:'2026-02-28'}]` | ✅ |
| 5 | does not touch open records whose startDate is after the new startDate | `existing=[log('past-open','2026-01-15'),log('future-open','2026-04-01')]`, `newStart='2026-03-01'` | `closeUpdates=[{id:'past-open',endDate:'2026-02-28'}]` (future-open 보존) | ✅ |
| 6 | skips already-closed records | `existing=[log('closed','2026-01-01','2026-01-06'),log('open','2026-02-01')]`, `newStart='2026-03-01'` | `closeUpdates=[{id:'open',endDate:'2026-02-28'}]` (closed 보존) | ✅ |
| 7 | returns no closeUpdates when existingMatch is found, even with other open records | `existing=[log('other-open','2026-01-15'),log('match','2026-03-01')]`, `newStart='2026-03-01'` | `existingMatch.id='match'`, `closeUpdates=[]` | ✅ |
| 8 | handles month boundary correctly for endDate calculation | `existing=[log('a','2026-05-15')]`, `newStart='2026-06-01'` | `closeUpdates=[{id:'a',endDate:'2026-05-31'}]` | ✅ |
| 9 | handles year boundary correctly | `existing=[log('a','2025-12-20')]`, `newStart='2026-01-05'` | `closeUpdates=[{id:'a',endDate:'2026-01-04'}]` | ✅ |
| 10 | returns empty closeUpdates on empty input | `existing=[]`, `newStart='2026-03-01'` | `existingMatch=null`, `closeUpdates=[]` | ✅ |

**Notes**
- 행 5: 시간 역행 (사용자가 며칠 전 데이터를 늦게 추가) 케이스에서 미래에 시작된 open record 는 close 하지 않는다.
- 행 7: existingMatch 가 잡히면 그 이외 다른 open record 는 사이드이펙트 없이 그대로 둔다 (가장 보수적인 정책).

## `defaultPeriodEndDate(startDate, periodLength)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 11 | returns startDate + 4 days for the default 5-day length | `startDate='2026-02-01'`, `periodLength=5` | `'2026-02-05'` | ✅ |
| 12 | handles a 3-day length | `startDate='2026-02-01'`, `periodLength=3` | `'2026-02-03'` | ✅ |
| 13 | handles a 1-day length (same day) | `startDate='2026-02-01'`, `periodLength=1` | `'2026-02-01'` | ✅ |
| 14 | crosses month boundary correctly | `startDate='2026-01-29'`, `periodLength=5` | `'2026-02-02'` | ✅ |
| 15 | crosses year boundary correctly | `startDate='2025-12-30'`, `periodLength=5` | `'2026-01-03'` | ✅ |

**Notes**
- 끝 날짜 포함이라 `endDate = startDate + (periodLength − 1) 일`. 1일 짜리면 endDate = startDate.
- `periodLength` 자체에는 가드를 두지 않음 — 호출처 (`settings.averagePeriodLength`) 가 1~14 범위 보장.

## `evaluateNewStart(existing, newStart)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 16 | returns idempotent when the same startDate already exists | `existing=[log('a','2026-06-10','2026-06-14')]`, `newStart='2026-06-10'` | `kind='idempotent'`, `match.id='a'` | ✅ |
| 17 | returns ok when there is no prior period | `existing=[]`, `newStart='2026-06-10'` | `kind='ok'` | ✅ |
| 18 | flags shortGap when the gap is under the threshold (14 days) | `existing=[log('a','2026-06-02','2026-06-06')]`, `newStart='2026-06-15'` | `kind='shortGap'`, `priorPeriod.id='a'`, `daysSincePrior=13` | ✅ |
| 19 | flags shortGap for the user scenario (6/10 then 6/16 → 6 days) | `existing=[log('a','2026-06-10','2026-06-14')]`, `newStart='2026-06-16'` | `kind='shortGap'`, `daysSincePrior=6` | ✅ |
| 20 | returns ok when the gap is exactly the threshold (15 days) | `existing=[log('a','2026-06-01')]`, `newStart='2026-06-16'` | `kind='ok'` | ✅ |
| 21 | compares against the nearest prior, not the earliest | `existing=[log('old','2026-05-01','2026-05-05'),log('recent','2026-06-10','2026-06-14')]`, `newStart='2026-06-16'` | `kind='shortGap'`, `priorPeriod.id='recent'`, `daysSincePrior=6` | ✅ |
| 22 | ignores future records when looking for prior | `existing=[log('future','2026-08-01'),log('prior','2026-06-01','2026-06-05')]`, `newStart='2026-06-20'` | `kind='ok'` | ✅ |
| 23 | keeps the threshold in sync with the aggregate outlier rule | — | `SHORT_CYCLE_THRESHOLD_DAYS === 15` | ✅ |

**Notes**
- 행 18: 간격 14일은 임계치(`SHORT_CYCLE_THRESHOLD_DAYS = 15`) 미만이므로 `shortGap`.
- 행 20: 간격이 정확히 15일이면 임계치 이상이므로 `ok` (경계값 포함 확인).
- 행 21: 여러 이전 기록이 있을 때 가장 가까운(최근) 것과 비교해야 한다.
- 행 23: `SHORT_CYCLE_THRESHOLD_DAYS` 상수가 `aggregate.ts` 이상치 필터(`gap >= 15`)와 같은 값(15)으로 고정되어 있는지 sanity check.
