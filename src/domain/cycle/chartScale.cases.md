# chartScale — Unit test cases

Last run: 2026-08-17 — 20/20 passed

## niceScale

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | widens the range by 1 above the equal point (typical case) | `dataMin=28, dataMax=28` | `yMax >= yMin+1`, `tickStepValue=1` | ✅ |
| 2 | single point at HARD_MIN keeps the axis clamped to 15 | `dataMin=15, dataMax=15` | `yMin=15` | ✅ |
| 3 | single point at HARD_MAX keeps the axis clamped to 60 | `dataMin=60, dataMax=60` | `yMax=60` | ✅ |
| 4 | picks step=1 for a range small enough to fit at unit ticks | `dataMin=25, dataMax=30` | `tickStepValue=1`, `yMin=25`, `yMax=30` | ✅ |
| 5 | picks step=2 when step=1 would produce more than 7 ticks | `dataMin=20, dataMax=30` | `tickStepValue=2`, `ticks<=7` | ✅ |
| 6 | picks step=5 for wide ranges (20–40) | `dataMin=18, dataMax=42` | `tickStepValue=5`, `yMin%5=0`, `yMax%5=0`, `ticks<=7` | ✅ |
| 7 | picks step=10 when nothing else fits | `dataMin=20, dataMax=55` | `tickStepValue=10` | ✅ |
| 8 | clamps values below HARD_MIN to 15 | `dataMin=-5, dataMax=20` | `yMin >= 15` | ✅ |
| 9 | clamps values above HARD_MAX to 60 | `dataMin=50, dataMax=99` | `yMax <= 60` | ✅ |
| 10 | never returns a negative yMin | `dataMin=-100, dataMax=10` | `yMin >= 0` | ✅ |
| 11 | handles inverted min/max without throwing | `dataMin=40, dataMax=20` | no throw | ✅ |
| 12 | handles fractional values by rounding outward | `dataMin=25.7, dataMax=28.3` | `yMin<=25.7`, `yMax>=28.3` | ✅ |
| 13 | always returns at most 7 ticks for any valid range | pairs: `(15,15),(20,30),(15,60),(25,32),(40,45)` | `ticks <= 7` for all | ✅ |

> Case 7: `niceScale(20, 55)` triggers step=10 via the for-loop candidate `[1,2,5,10]`; the fallback at line 43–46 is dead code under `CYCLE_HARD_MIN/MAX` constraints (max valid span = 45 days, step=10 always satisfies `ticks<=7`).

## clampOverlayX

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 14 | leaves the pill centered when it fits comfortably in the middle | `x=150, minX=0, maxX=300, halfWidth=30` | `150` | ✅ |
| 15 | pushes the pill inward from the left boundary | `x=5, minX=0, maxX=300, halfWidth=30` | `30` | ✅ |
| 16 | pushes the pill inward from the right boundary | `x=295, minX=0, maxX=300, halfWidth=30` | `270` | ✅ |
| 17 | handles the single-data-point-at-far-right regression | `x=324, minX=25, maxX=324, halfWidth=30` | `294` (`gridXEnd-30`) | ✅ |
| 18 | falls back to the midpoint when the plot is narrower than the pill | `x=80, minX=0, maxX=100, halfWidth=50` | `50` | ✅ |
| 19 | is idempotent for already-clamped inputs | apply twice with same args | second result equals first | ✅ |
| 20 | respects zero half-width (degenerate pill) | `halfWidth=0`: `x=50→50`, `x=-10→0`, `x=200→100` | exact clamp to `[minX, maxX]` | ✅ |

> Case 18 covers the `safeMin > safeMax` branch (only branch in `clampOverlayX` besides the final clamp).
