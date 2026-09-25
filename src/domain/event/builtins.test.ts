import { describe, it, expect } from 'vitest';
import { BUILTIN_CATEGORY_SEEDS, defaultCategoryId, localizedCategoryName } from './builtins';

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

describe('localizedCategoryName', () => {
  const en = { family: 'Family', friend: 'Friend', work: 'Work', club: 'Club' };
  const ko = { family: '가족', friend: '친구', work: '회사', club: '모임' };
  const seeded = [en, ko];
  const named = (name: string, isBuiltIn: boolean, order: number) => ({
    id: 'x',
    name,
    isBuiltIn,
    order,
  });

  it('shows a ko-seeded built-in in en', () => {
    expect(localizedCategoryName(named('친구', true, 1), en, seeded)).toBe('Friend');
  });

  it('shows an en-seeded built-in in ko', () => {
    expect(localizedCategoryName(named('Work', true, 2), ko, seeded)).toBe('회사');
  });

  it('keeps a renamed built-in as the user named it', () => {
    expect(localizedCategoryName(named('절친', true, 1), en, seeded)).toBe('절친');
  });

  it('keeps a custom category name even if it matches a built-in name', () => {
    expect(localizedCategoryName(named('가족', false, 0), en, seeded)).toBe('가족');
  });

  it('does not swap in another slot’s name when a built-in was renamed to it', () => {
    // order 0 (family) renamed to "친구" — not its own seeded name, so it stays.
    expect(localizedCategoryName(named('친구', true, 0), en, seeded)).toBe('친구');
  });
});
