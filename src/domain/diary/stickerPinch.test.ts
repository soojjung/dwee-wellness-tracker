import { describe, it, expect } from 'vitest';
import {
  pinchGeometry,
  applyPinch,
  PLACEMENT_MIN_SCALE,
  PLACEMENT_MAX_SCALE,
  type Point,
  type PinchStart,
} from './stickerPinch';

function point(x: number, y: number): Point {
  return { x, y };
}

describe('pinchGeometry', () => {
  it('computes distance and zero angle for a horizontal pair', () => {
    const result = pinchGeometry(point(0, 0), point(10, 0));
    expect(result.dist).toBe(10);
    expect(result.angle).toBe(0);
  });

  it('computes distance and a quarter-turn angle for a vertical pair', () => {
    const result = pinchGeometry(point(0, 0), point(0, 10));
    expect(result.dist).toBe(10);
    expect(result.angle).toBeCloseTo(Math.PI / 2);
  });

  it('computes distance and angle for a diagonal pair (3-4-5 triangle)', () => {
    const result = pinchGeometry(point(0, 0), point(3, 4));
    expect(result.dist).toBe(5);
    expect(result.angle).toBeCloseTo(Math.atan2(4, 3));
  });

  it('falls back to dist = 1 when the two points coincide', () => {
    const result = pinchGeometry(point(5, 5), point(5, 5));
    expect(result.dist).toBe(1);
    expect(result.angle).toBe(0);
  });

  it('computes an angle pointing left (PI) when b is behind a on the x-axis', () => {
    const result = pinchGeometry(point(0, 0), point(-10, 0));
    expect(result.dist).toBe(10);
    expect(result.angle).toBeCloseTo(Math.PI);
  });
});

describe('applyPinch', () => {
  function start(overrides: Partial<PinchStart> = {}): PinchStart {
    return { dist: 10, angle: 0, scale: 1, rotation: 0, ...overrides };
  }

  it('scales up proportionally to the finger-distance ratio', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 20, angle: 0 });
    expect(result.scale).toBe(2);
  });

  it('scales down proportionally to the finger-distance ratio', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 5, angle: 0 });
    expect(result.scale).toBe(0.5);
  });

  it('reaches PLACEMENT_MAX_SCALE exactly at the boundary ratio without distortion', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 30, angle: 0 });
    expect(result.scale).toBe(PLACEMENT_MAX_SCALE);
  });

  it('clamps scale at PLACEMENT_MAX_SCALE when the ratio grows further', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 1000, angle: 0 });
    expect(result.scale).toBe(PLACEMENT_MAX_SCALE);
  });

  it('reaches PLACEMENT_MIN_SCALE exactly at the boundary ratio without distortion', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 3, angle: 0 });
    expect(result.scale).toBe(PLACEMENT_MIN_SCALE);
  });

  it('clamps scale at PLACEMENT_MIN_SCALE when the ratio shrinks further', () => {
    const result = applyPinch(start({ scale: 1, dist: 10 }), { dist: 0.001, angle: 0 });
    expect(result.scale).toBe(PLACEMENT_MIN_SCALE);
  });

  it('keeps rotation unchanged when the angle does not change', () => {
    const result = applyPinch(start({ angle: Math.PI / 4, rotation: 10 }), {
      dist: 10,
      angle: Math.PI / 4,
    });
    expect(result.rotation).toBe(10);
  });

  it('rotates by a positive 90 degrees when the angle increases by a quarter turn', () => {
    const result = applyPinch(start({ angle: 0, rotation: 0 }), { dist: 10, angle: Math.PI / 2 });
    expect(result.rotation).toBeCloseTo(90);
  });

  it('rotates by a negative 45 degrees when the angle decreases by an eighth turn', () => {
    const result = applyPinch(start({ angle: Math.PI / 2, rotation: 0 }), {
      dist: 10,
      angle: Math.PI / 4,
    });
    expect(result.rotation).toBeCloseTo(-45);
  });

  it('accumulates the rotation delta onto a non-zero start rotation', () => {
    const result = applyPinch(start({ angle: 0, rotation: 30 }), { dist: 10, angle: Math.PI / 2 });
    expect(result.rotation).toBeCloseTo(120);
  });

  it('takes the short way around when the angle crosses the -PI/PI seam', () => {
    // Finger sweeps from 170deg to -170deg: a 20deg arc across the atan2
    // discontinuity, not a 340deg jump the other way.
    const forward = applyPinch(start({ angle: (170 * Math.PI) / 180, rotation: 0 }), {
      dist: 10,
      angle: (-170 * Math.PI) / 180,
    });
    expect(forward.rotation).toBeCloseTo(20);

    const backward = applyPinch(start({ angle: (-170 * Math.PI) / 180, rotation: 90 }), {
      dist: 10,
      angle: (170 * Math.PI) / 180,
    });
    expect(backward.rotation).toBeCloseTo(70);
  });

  it('computes scale and rotation independently of each other', () => {
    const distOnly = applyPinch(start({ scale: 1, dist: 10, angle: 0, rotation: 5 }), {
      dist: 20,
      angle: 0,
    });
    expect(distOnly.scale).toBe(2);
    expect(distOnly.rotation).toBe(5);

    const angleOnly = applyPinch(start({ scale: 1, dist: 10, angle: 0, rotation: 5 }), {
      dist: 10,
      angle: Math.PI / 2,
    });
    expect(angleOnly.scale).toBe(1);
    expect(angleOnly.rotation).toBeCloseTo(95);
  });
});
