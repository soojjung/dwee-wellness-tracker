import { describe, it, expect } from 'vitest';
import { BUILTIN_CATEGORY_SEEDS, defaultCategoryId } from './builtins';

interface CategoryLike {
  id: string;
  isBuiltIn: boolean;
  order: number;
}

function category(id: string, isBuiltIn: boolean, order: number): CategoryLike {
  return { id, isBuiltIn, order };
}

describe('BUILTIN_CATEGORY_SEEDS', () => {
  it('still contains a friend seed with order 1 and colorId lavender', () => {
    const friend = BUILTIN_CATEGORY_SEEDS.find((s) => s.key === 'friend');
    expect(friend).toEqual({ key: 'friend', colorId: 'lavender', order: 1 });
  });
});

describe('defaultCategoryId', () => {
  it('returns the friend built-in even when it is not first in the list', () => {
    const categories = [
      category('c-work', true, 2),
      category('c-friend', true, 1),
      category('c-family', true, 0),
    ];
    expect(defaultCategoryId(categories)).toBe('c-friend');
  });

  it('falls back to the first category when friend built-in is missing', () => {
    const categories = [category('c-family', true, 0), category('c-work', true, 2)];
    expect(defaultCategoryId(categories)).toBe('c-family');
  });

  it('does not pick a custom (non-built-in) category with order 1 over the fallback', () => {
    const categories = [category('c-first', true, 5), category('c-custom-order1', false, 1)];
    expect(defaultCategoryId(categories)).toBe('c-first');
  });

  it('returns null for an empty category list', () => {
    expect(defaultCategoryId([])).toBeNull();
  });
});
