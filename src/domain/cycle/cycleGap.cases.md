# isCountableCycleGap() — Test Cases

| Days | Result | Boundary? | Notes |
|------|--------|-----------|-------|
| 0 | false | — | No cycle gap |
| 1 | false | — | Same-day entry (invalid) |
| 14 | false | ✓ | Below CYCLE_GAP_MIN_DAYS (15) |
| **15** | **true** | ✓ | **Lower boundary** (inclusive) |
| 16~59 | true | — | Valid range |
| 28 | true | — | Typical cycle |
| 30 | true | — | Common variation |
| 35 | true | — | Upper stable range |
| **60** | **true** | ✓ | **Upper boundary** (inclusive) |
| 61 | false | ✓ | Above CYCLE_GAP_MAX_DAYS (60) |
| 67 | false | — | User data: "too large gap" |
| 90 | false | — | ~3-month gap |

## Constants

```ts
export const CYCLE_GAP_MIN_DAYS = 15;  // Minimum countable cycle interval
export const CYCLE_GAP_MAX_DAYS = 60;  // Maximum countable cycle interval
```

## Rationale

- **15 days min**: Excludes same-menstruation double-entry or repeated same-day logs
- **60 days max**: Excludes missed-entry periods (data quality threshold, not medical)
- Used uniformly in: `status.ts`, `aggregate.ts`, `chartScale.ts`, `recordPolicy.ts`
