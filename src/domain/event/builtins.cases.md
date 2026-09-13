# builtins — Unit test cases

Last run: 2026-09-13 — 304/304 passed (full suite; 5/5 in this module)

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | still contains a friend seed with order 1 and colorId lavender | `BUILTIN_CATEGORY_SEEDS.find(s => s.key === 'friend')` | `{key:'friend', colorId:'lavender', order:1}` | ✅ |
| 2 | returns the friend built-in even when it is not first in the list | `categories=[category('c-work',true,2), category('c-friend',true,1), category('c-family',true,0)]` | `'c-friend'` | ✅ |
| 3 | falls back to the first category when friend built-in is missing | `categories=[category('c-family',true,0), category('c-work',true,2)]` | `'c-family'` | ✅ |
| 4 | does not pick a custom (non-built-in) category with order 1 over the fallback | `categories=[category('c-first',true,5), category('c-custom-order1',false,1)]` | `'c-first'` | ✅ |
| 5 | returns null for an empty category list | `defaultCategoryId([])` | `null` | ✅ |

- Row 4: `c-custom-order1` has `order===1` but `isBuiltIn===false`, so it must not match the friend-seed lookup; result falls back to `categories[0]` (`c-first`), proving the built-in check gates the order match rather than order alone.
