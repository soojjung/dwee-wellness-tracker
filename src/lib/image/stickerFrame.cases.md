# stickerFrame — Unit test cases

Last run: 2026-09-21 — 20/20 passed

## STICKER_RATIO_ASPECT

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | maps 1:1 to aspect 1 and 4:3 to aspect 0.75 (portrait 3:4 frame) | `STICKER_RATIO_ASPECT` | `{'1:1':1, '4:3':0.75}` | ✅ |

## stickerRatioForAspect

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 2 | returns 4:3 for an aspect clearly below the cutoff | `aspect=0.5` | `'4:3'` | ✅ |
| 3 | returns 4:3 for an aspect just below the 0.875 cutoff | `aspect=0.87` | `'4:3'` | ✅ |
| 4 | returns 1:1 exactly at the 0.875 cutoff (inclusive) | `aspect=0.875` | `'1:1'` | ✅ |
| 5 | returns 1:1 for an aspect above the cutoff | `aspect=1` | `'1:1'` | ✅ |
| 6 | returns 1:1 for a wide (landscape) aspect | `aspect=1.5` | `'1:1'` | ✅ |

## centerCropRect

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 7 | crops the sides (left/right) when the source is wider than the target | `width=400, height=200, targetAspect=1` | `{sx:100, sy:0, sw:200, sh:200}` | ✅ |
| 8 | crops the top/bottom when the source is taller than the target | `width=200, height=400, targetAspect=1` | `{sx:0, sy:100, sw:200, sh:200}` | ✅ |
| 9 | returns the full frame untouched when the aspect already matches | `width=300, height=300, targetAspect=1` | `{sx:0, sy:0, sw:300, sh:300}` | ✅ |
| 10 | keeps the cropped region centered and inside the original bounds (4:3 target) | `width=1080, height=1350, targetAspect=0.75` | `{sx:33.75, sy:0, sw:1012.5, sh:1350}`, region ⊆ original | ✅ |

## opaqueBounds

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 11 | returns null when every pixel is fully transparent | `5x5, all alpha=0, threshold=10` | `null` | ✅ |
| 12 | returns a 1x1 box for a single opaque pixel | `pixel(2,3) alpha=255` | `{x:2,y:3,width:1,height:1}` | ✅ |
| 13 | spans all four corners when they are the only opaque pixels | `(0,0),(4,0),(0,4),(4,4) alpha=255` in 5x5 | `{x:0,y:0,width:5,height:5}` | ✅ |
| 14 | excludes a pixel whose alpha exactly equals the threshold | `pixel(2,2) alpha=10, threshold=10` | `null` | ✅ |
| 15 | only counts pixels strictly above the threshold in a mixed image | `(1,1) alpha=10 (==thr)`, `(3,3) alpha=11 (>thr)`, `threshold=10` | `{x:3,y:3,width:1,height:1}` | ✅ |

## expandBounds

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 16 | expands by the 1px downscale fudge factor when scale=1 and padding=0 | `bounds={x:10,y:10,w:5,h:5}, scale=1, padding=0, full=100x100` | `{x:9,y:9,width:7,height:7}` | ✅ |
| 17 | scales thumbnail-space bounds up to full-resolution coordinates | same bounds, `scale=0.25, padding=0, full=1000x1000` | `{x:36,y:36,width:28,height:28}` | ✅ |
| 18 | adds the requested padding around the scaled bounds | same bounds, `scale=1, padding=5, full=100x100` | `{x:4,y:4,width:17,height:17}` | ✅ |
| 19 | clamps the top-left corner to 0 instead of going negative | `bounds={x:0,y:0,w:2,h:2}, scale=1, padding=0, full=50x50` | `{x:0,y:0,width:3,height:3}` | ✅ |
| 20 | clamps the bottom-right corner to the full image size | `bounds={x:95,y:95,w:5,h:5}, scale=1, padding=0, full=100x100` | `{x:94,y:94,width:6,height:6}` (not 101) | ✅ |

- Row 16 note: `(bounds.x - 1)/scale` and `(bounds.x + bounds.width + 1)/scale` are a fudge factor — a downscaled thumbnail can lose up to 1px (thumbnail-scale) of true edge, so bounds widen by that much before padding is added.
