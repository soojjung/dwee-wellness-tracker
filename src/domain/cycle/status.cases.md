# classifyCycleStatus() — Test Cases

| Case | Records | Gaps (days) | Latest Period | Expected Status | Confidence | Notes |
|------|---------|-------------|----------------|-----------------|-----------|-------|
| Insufficient (< 3 records) | 2 | N/A | 5 | `insufficient` | `unknown` | §1: basic threshold |
| Short Period | 3 | [28, 28] | 2 | `shortPeriod` | `medium` | Latest completed period ≤ 2 days |
| Long Period | 3 | [28, 28] | 9 | `longPeriod` | `medium` | Latest completed period ≥ 8 days |
| Irregular (range ≥15) | 3 | [24, 39] | 5 | `irregular` | `medium` | Range = 15 days |
| Slightly Irregular (range 8~14) | 3 | [24, 32] | 5 | `slightlyIrregular` | `medium` | Range = 8 days |
| Stable | 4 | [28, 28, 28] | 5 | `stable` | `high` | Period 3~7d + cycle 21~35d + range ≤7d |
| Regular (short cycle) | 4 | [19, 19, 19] | 5 | `regular` | `medium` | Consistent but below stable 21d |
| Insufficient (gaps all >60d) | 3 | [] | 5 | `insufficient` | `unknown` | **CHANGED**: was `regular`. gaps=0, normal period → insufficient |
| Insufficient (gaps all <15d) | 3 | [] | 3 | `insufficient` | `unknown` | **CHANGED**: was `regular`. gaps=0, normal period → insufficient |
| ShortPeriod wins (gaps all >60d) | 3 | [] | 2 | `shortPeriod` | `low` | Period ≤2d has priority; gaps don't affect this |
| LongPeriod wins (gaps all >60d) | 3 | [] | 9 | `longPeriod` | `low` | Period ≥8d has priority; gaps don't affect this |
| Real user case (67/11/5 gaps) | 4 | [] | 4, 4, 1, 5 | `insufficient` | `unknown` | **NEW**: actual user data; gaps outside 15~60 → insufficient |
| Confidence high (4+ records) | 5 | [28, 28, 28, 28] | 5 | `stable` | `high` | §2: gaps ≥ 3 → `high` |
| Confidence medium (3 records) | 3 | [28, 28] | 5 | `stable` | `medium` | §2: gaps = 2 → `medium` |
| Confidence low (2 records) | 3 | [28] | 5 | `regular` | `low` | §2: gaps = 1 → `low` |

## Key Changes

### Insufficient status now covers:
1. Records < 3 (unchanged)
2. **Records ≥ 3 but gaps.length === 0** (NEW)
   - Reason: When all gaps fall outside 15~60d range, user input is likely misaligned (entry timing, data quality)
   - Exception: if latestLen ≤ 2 or ≥ 8, shortPeriod/longPeriod takes priority

### Confidence field:
- `unknown` = insufficient (data too sparse or intervals unanalyzable)
- `low` = 1 countable gap (2 records)
- `medium` = 2 countable gaps (3 records)
- `high` = 3+ countable gaps (4+ records)

### Priority order:
1. Records < 3 → insufficient
2. shortPeriod/longPeriod (base latestLen)
3. gaps.length === 0 → insufficient (if not short/longPeriod)
4. irregular / slightlyIrregular (gaps-based)
5. stable (period + cycle + range all stable)
6. regular (repeating but not stable)
