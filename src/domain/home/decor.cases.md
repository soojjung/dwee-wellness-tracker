# decor — Unit test cases

Last run: 2026-07-21 — 15/15 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns [0] for count=1 | `count=1` | `[0]` | ✅ |
| 2 | returns [1, 2] for count=2 | `count=2` | `[1, 2]` | ✅ |
| 3 | returns [3, 4, 5, 6] for count=4 | `count=4` | `[3, 4, 5, 6]` | ✅ |
| 4 | slot arrays are non-overlapping across all counts | all counts flattened | `Set(all).size === all.length` | ✅ |
| 5 | slot arrays together cover all 7 slots exactly once | all counts flattened + sorted | `[0,1,2,3,4,5,6]` | ✅ |
| 6 | returns 1 for slot 0 | `slot=0` | `1` | ✅ |
| 7 | returns 2 for slot 1 | `slot=1` | `2` | ✅ |
| 8 | returns 2 for slot 2 | `slot=2` | `2` | ✅ |
| 9 | returns 4 for slot 3 | `slot=3` | `4` | ✅ |
| 10 | returns 4 for slot 4 | `slot=4` | `4` | ✅ |
| 11 | returns 4 for slot 5 | `slot=5` | `4` | ✅ |
| 12 | returns 4 for slot 6 | `slot=6` | `4` | ✅ |
| 13 | every slot in slotsForCount(1) maps back to count 1 | `count=1`, all slots from `slotsForCount(1)` | `countForSlot(s) === 1` for every `s` | ✅ |
| 14 | every slot in slotsForCount(2) maps back to count 2 | `count=2`, all slots from `slotsForCount(2)` | `countForSlot(s) === 2` for every `s` | ✅ |
| 15 | every slot in slotsForCount(4) maps back to count 4 | `count=4`, all slots from `slotsForCount(4)` | `countForSlot(s) === 4` for every `s` | ✅ |
