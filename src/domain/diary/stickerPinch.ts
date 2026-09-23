/**
 * 스티커 크기·회전 제스처의 순수 계산. 한 손가락 핸들 드래그와 두 손가락 핀치가
 * 같은 식을 쓴다: 기준점(핸들이면 스티커 중심, 핀치면 다른 손가락)에서 현재
 * 손가락까지의 거리 비율이 배율, 각도 차이가 회전이다.
 */
export interface Point {
  x: number;
  y: number;
}

export interface PinchGeometry {
  /** 두 점 사이 거리 (px). 0 이면 나눗셈을 피하려고 1 로 올린다. */
  dist: number;
  /** a → b 방향 각도 (rad). */
  angle: number;
}

export interface PinchStart extends PinchGeometry {
  scale: number;
  rotation: number;
}

export const PLACEMENT_MIN_SCALE = 0.3;
export const PLACEMENT_MAX_SCALE = 3;

export function pinchGeometry(a: Point, b: Point): PinchGeometry {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { dist: Math.hypot(dx, dy) || 1, angle: Math.atan2(dy, dx) };
}

export function applyPinch(
  start: PinchStart,
  now: PinchGeometry,
): { scale: number; rotation: number } {
  const scale = Math.min(
    PLACEMENT_MAX_SCALE,
    Math.max(PLACEMENT_MIN_SCALE, start.scale * (now.dist / start.dist)),
  );
  // atan2 jumps from +π to -π across the negative x-axis; take the short way
  // around so a 20° arc past the sticker's left side doesn't read as -340°.
  const rawDelta = ((now.angle - start.angle) * 180) / Math.PI;
  const delta = ((((rawDelta + 180) % 360) + 360) % 360) - 180;
  return { scale, rotation: start.rotation + delta };
}
