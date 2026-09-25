# builtins — Unit test cases

Last run: 2026-09-13 — 304/304 passed (full suite; 5/5 in this module)

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | still contains a friend seed with order 1 and colorId lavender | `BUILTIN_CATEGORY_SEEDS.find(s => s.key === 'friend')` | `{key:'friend', colorId:'lavender', order:1}` | ✅ |
| 2 | returns the friend built-in even when it is not first in the list | `categories=[category('c-work',true,2), category('c-friend',true,1), category('c-family',true,0)]` | `'c-friend'` | ✅ |
| 3 | falls back to the first category when friend built-in is missing | `categories=[category('c-family',true,0), category('c-work',true,2)]` | `'c-family'` | ✅ |
| 4 | does not pick a custom (non-built-in) category with order 1 over the fallback | `categories=[category('c-first',true,5), category('c-custom-order1',false,1)]` | `'c-first'` | ✅ |
| 5 | returns null for an empty category list | `defaultCategoryId([])` | `null` | ✅ |

## localizedCategoryName

| # | `it` title | 입력 (name, isBuiltIn, order → locale) | 기대 결과 | 결과 |
|---|---|---|---|---|
| 6 | shows a ko-seeded built-in in en | `'친구', true, 1 → en` | `'Friend'` | ✅ |
| 7 | shows an en-seeded built-in in ko | `'Work', true, 2 → ko` | `'회사'` | ✅ |
| 8 | keeps a renamed built-in as the user named it | `'절친', true, 1 → en` | `'절친'` | ✅ |
| 9 | keeps a custom category name even if it matches a built-in name | `'가족', false, 0 → en` | `'가족'` | ✅ |
| 10 | does not swap in another slot's name when a built-in was renamed to it | `'친구', true, 0 → en` | `'친구'` | ✅ |

- Row 4: `c-custom-order1` has `order===1` but `isBuiltIn===false`, so it must not match the friend-seed lookup; result falls back to `categories[0]` (`c-first`), proving the built-in check gates the order match rather than order alone.
- `localizedCategoryName`: 기본 유형은 시드 당시 언어의 이름으로 저장된다. 이름이 어느 언어의 시드 이름과 같으면(= 안 바꿈) 현재 언어로 보여 주고, 사용자가 바꾼 이름은 그대로. 비교는 자기 자리(`order`)의 시드 이름끼리만 — Row 10. TestFlight R3-11.
