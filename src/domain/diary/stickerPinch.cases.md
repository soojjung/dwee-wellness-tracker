# `stickerPinch` — Unit test cases

대상: `src/domain/diary/stickerPinch.ts`

Last run: 2026-09-24 — 17/17 passed

## `pinchGeometry(a, b)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | computes distance and zero angle for a horizontal pair | `a=(0,0)`, `b=(10,0)` | `dist=10`, `angle=0` | ✅ |
| 2 | computes distance and a quarter-turn angle for a vertical pair | `a=(0,0)`, `b=(0,10)` | `dist=10`, `angle≈PI/2` | ✅ |
| 3 | computes distance and angle for a diagonal pair (3-4-5 triangle) | `a=(0,0)`, `b=(3,4)` | `dist=5`, `angle≈atan2(4,3)` | ✅ |
| 4 | falls back to dist = 1 when the two points coincide | `a=(5,5)`, `b=(5,5)` | `dist=1`, `angle=0` | ✅ |
| 5 | computes an angle pointing left (PI) when b is behind a on the x-axis | `a=(0,0)`, `b=(-10,0)` | `dist=10`, `angle≈PI` | ✅ |

**Notes**
- 행 4: `Math.hypot(0,0) || 1` 분기 — 0 거리일 때 나눗셈(scale 계산) 보호를 위한 fallback 확인.

## `applyPinch(start, now)`

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 6 | scales up proportionally to the finger-distance ratio | `start={dist:10,angle:0,scale:1,rotation:0}`, `now={dist:20,angle:0}` | `scale=2` | ✅ |
| 7 | scales down proportionally to the finger-distance ratio | `start={dist:10,scale:1,...}`, `now={dist:5,angle:0}` | `scale=0.5` | ✅ |
| 8 | reaches PLACEMENT_MAX_SCALE exactly at the boundary ratio without distortion | `start={dist:10,scale:1,...}`, `now={dist:30,angle:0}` | `scale=3` (`=PLACEMENT_MAX_SCALE`) | ✅ |
| 9 | clamps scale at PLACEMENT_MAX_SCALE when the ratio grows further | `start={dist:10,scale:1,...}`, `now={dist:1000,angle:0}` | `scale=3` | ✅ |
| 10 | reaches PLACEMENT_MIN_SCALE exactly at the boundary ratio without distortion | `start={dist:10,scale:1,...}`, `now={dist:3,angle:0}` | `scale=0.3` (`=PLACEMENT_MIN_SCALE`) | ✅ |
| 11 | clamps scale at PLACEMENT_MIN_SCALE when the ratio shrinks further | `start={dist:10,scale:1,...}`, `now={dist:0.001,angle:0}` | `scale=0.3` | ✅ |
| 12 | keeps rotation unchanged when the angle does not change | `start={angle:PI/4,rotation:10}`, `now={dist:10,angle:PI/4}` | `rotation=10` | ✅ |
| 13 | rotates by a positive 90 degrees when the angle increases by a quarter turn | `start={angle:0,rotation:0}`, `now={dist:10,angle:PI/2}` | `rotation≈90` | ✅ |
| 14 | rotates by a negative 45 degrees when the angle decreases by an eighth turn | `start={angle:PI/2,rotation:0}`, `now={dist:10,angle:PI/4}` | `rotation≈-45` | ✅ |
| 15 | accumulates the rotation delta onto a non-zero start rotation | `start={angle:0,rotation:30}`, `now={dist:10,angle:PI/2}` | `rotation≈120` | ✅ |
| 16 | takes the short way around when the angle crosses the -PI/PI seam | `start={angle:170°,rotation:0}`, `now={angle:-170°}` / 반대 방향 `start={angle:-170°,rotation:90}`, `now={angle:170°}` | `rotation=20` / `rotation=70` (최단 경로 정규화) | ✅ |
| 17 | computes scale and rotation independently of each other | `start={scale:1,dist:10,angle:0,rotation:5}`; case A `now={dist:20,angle:0}`; case B `now={dist:10,angle:PI/2}` | A: `scale=2, rotation=5`; B: `scale=1, rotation≈95` | ✅ |

**Notes**
- 행 8, 10: 클램프 경계값(정확히 3, 정확히 0.3)에서 부동소수점 왜곡 없이 정확히 일치하는지 확인 (`1*(30/10)===3`, `1*(3/10)===0.3` 검증됨).
- 행 16: atan2 는 `-π`/`π` 경계에서 값이 튀므로 `applyPinch` 가 각도 델타를 `(-180°, 180°]` 로 정규화한다(2026-09-24 수정). 정규화 전에는 170°→-170° 의 20° 움직임이 -340° 회전으로 계산돼 스티커가 왼쪽에서 거의 한 바퀴 튀었다.
- 행 17: 하나의 `it` 안에서 두 개의 독립된 시나리오(거리만 변경 / 각도만 변경)를 비교해 scale·rotation 계산이 서로 간섭하지 않음을 확인.
