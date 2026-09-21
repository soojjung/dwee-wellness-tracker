import { describe, it, expect } from 'vitest';
import { planBuiltinDedupe } from './builtinDedupe';
import type { ColorPaletteId, EventCategory } from '@/types';

function category(
  id: string,
  order: number,
  name: string,
  colorId: ColorPaletteId,
  isBuiltIn: boolean,
  createdAt: string,
): EventCategory {
  return { id, name, colorId, isBuiltIn, order, createdAt };
}

describe('planBuiltinDedupe', () => {
  it('returns an empty Map when there are no duplicates', () => {
    const categories = [
      category('family', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('friend', 1, 'Friend', 'lavender', true, '2026-01-01T00:00:00.000Z'),
      category('work', 2, 'Work', 'gray', true, '2026-01-01T00:00:00.000Z'),
      category('club', 3, 'Club', 'mint', true, '2026-01-01T00:00:00.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(new Map());
  });

  it('dedupes all four built-in types when each was seeded twice', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('family-2', 0, 'Family', 'pink', true, '2026-01-01T00:00:05.000Z'),
      category('friend-1', 1, 'Friend', 'lavender', true, '2026-01-01T00:00:00.000Z'),
      category('friend-2', 1, 'Friend', 'lavender', true, '2026-01-01T00:00:05.000Z'),
      category('work-1', 2, 'Work', 'gray', true, '2026-01-01T00:00:00.000Z'),
      category('work-2', 2, 'Work', 'gray', true, '2026-01-01T00:00:05.000Z'),
      category('club-1', 3, 'Club', 'mint', true, '2026-01-01T00:00:00.000Z'),
      category('club-2', 3, 'Club', 'mint', true, '2026-01-01T00:00:05.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(
      new Map([
        ['family-2', 'family-1'],
        ['friend-2', 'friend-1'],
        ['work-2', 'work-1'],
        ['club-2', 'club-1'],
      ]),
    );
  });

  it('dedupes three or more copies of the same built-in down to one keeper', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('family-2', 0, 'Family', 'pink', true, '2026-01-01T00:00:05.000Z'),
      category('family-3', 0, 'Family', 'pink', true, '2026-01-01T00:00:10.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(
      new Map([
        ['family-2', 'family-1'],
        ['family-3', 'family-1'],
      ]),
    );
  });

  it('does not touch a copy the user renamed', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('family-renamed', 0, 'My Family', 'pink', true, '2026-01-01T00:00:05.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(new Map());
  });

  it('does not touch a copy the user recolored', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('family-recolored', 0, 'Family', 'mint', true, '2026-01-01T00:00:05.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(new Map());
  });

  it('ignores a non-built-in category even when name, color, and order match', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('custom-family', 0, 'Family', 'pink', false, '2026-01-01T00:00:05.000Z'),
    ];
    expect(planBuiltinDedupe(categories)).toEqual(new Map());
  });

  it('breaks a createdAt tie by id order', () => {
    const categories = [
      category('b-id', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('a-id', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
    ];
    // Same createdAt for both -> the lexicographically smaller id ('a-id') is
    // kept, regardless of array order.
    expect(planBuiltinDedupe(categories)).toEqual(new Map([['b-id', 'a-id']]));
  });

  it('produces the same result regardless of input order', () => {
    const categories = [
      category('family-1', 0, 'Family', 'pink', true, '2026-01-01T00:00:00.000Z'),
      category('family-2', 0, 'Family', 'pink', true, '2026-01-01T00:00:05.000Z'),
      category('friend-1', 1, 'Friend', 'lavender', true, '2026-01-01T00:00:00.000Z'),
      category('friend-2', 1, 'Friend', 'lavender', true, '2026-01-01T00:00:05.000Z'),
    ];
    const shuffled = [categories[3]!, categories[0]!, categories[2]!, categories[1]!];
    expect(planBuiltinDedupe(shuffled)).toEqual(planBuiltinDedupe(categories));
    expect(planBuiltinDedupe(shuffled)).toEqual(
      new Map([
        ['family-2', 'family-1'],
        ['friend-2', 'friend-1'],
      ]),
    );
  });
});
