# decor — Unit test cases

Last run: 2026-08-13 — 35/35 passed

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
| 13 | isPhotoTransformEdited — null / undefined / default | `null`, `undefined`, `DEFAULT_PHOTO_TRANSFORM` | `false` | ✅ |
| 14 | isPhotoTransformEdited — near-identity within epsilon | `{scale: 1+1e-6, offsetXNorm: -1e-6, offsetYNorm: 1e-6}` | `false` (floating-point drift tolerated) | ✅ |
| 15 | isPhotoTransformEdited — scale differs meaningfully | `{scale: 1.5, ...zero offsets}` | `true` | ✅ |
| 16 | isPhotoTransformEdited — either offset differs | `offsetXNorm: 0.1`, `offsetYNorm: -0.05` | `true` | ✅ |
| 17 | photoTransformEqual — null vs default | `(null, DEFAULT)` | `true` | ✅ |
| 18 | photoTransformEqual — differences within epsilon | `(a, a+1e-6)` | `true` | ✅ |
| 19 | photoTransformEqual — visible scale delta | `(scale=1.5, scale=1.6)` | `false` | ✅ |
| 20 | isPhotoTransform — well-formed object | `{scale, offsetXNorm, offsetYNorm}` numbers | `true` | ✅ |
| 21 | isPhotoTransform — non-objects and missing fields | `null`, `'…'`, `{scale}`, `{scale, offsetXNorm}` | `false` | ✅ |
| 22 | isPhotoTransform — non-finite numbers | `NaN`, `Infinity` in any field | `false` | ✅ |
| 23 | computePhotoRender — identity on square/square | cell 100×100, image 200×200, identity | rendered 100×100, offsets 0 | ✅ |
| 24 | computePhotoRender — cover-fit wider image | cell 100×100, image 400×200, identity | rendered 200×100 | ✅ |
| 25 | computePhotoRender — denormalize offsets to px | offsetXNorm=0.25, offsetYNorm=-0.1, cell 100×100 | offsetPx (25, -10) | ✅ |
| 26 | computePhotoRender — scale multiplies baseScale | scale=2, cell 100×100, image 200×200 | rendered 200×200 | ✅ |
| 27 | computePhotoRender — zero natural safe fallback | natural {0,0}, cell 100×100 | falls back to cell size, offsets 0 | ✅ |
| 28 | clampPhotoTransform — scale < 1 pinned to 1 | scale=0.5 | scale=1 | ✅ |
| 29 | clampPhotoTransform — scale > 4 pinned to 4 | scale=10 | scale=4 | ✅ |
| 30 | clampPhotoTransform — square-cover has no slack | scale=1, offset 0.5/-0.5, cell 100×100, image 200×200 | offsets clamped to 0 | ✅ |
| 31 | clampPhotoTransform — pan within crop margin | cell 100×100, image 400×200, offsetXNorm=10 | offsetXNorm≈0.5 (horizontal only), Y clamped to 0 | ✅ |
| 32 | clampPhotoTransform — zero natural passes offsets | natural {0,0}, huge offsets | scale clamped, offsets untouched | ✅ |
| 33 | every slot in slotsForCount(1) maps back to count 1 | `count=1`, all slots from `slotsForCount(1)` | `countForSlot(s) === 1` for every `s` | ✅ |
| 34 | every slot in slotsForCount(2) maps back to count 2 | `count=2`, all slots from `slotsForCount(2)` | `countForSlot(s) === 2` for every `s` | ✅ |
| 35 | every slot in slotsForCount(4) maps back to count 4 | `count=4`, all slots from `slotsForCount(4)` | `countForSlot(s) === 4` for every `s` | ✅ |
