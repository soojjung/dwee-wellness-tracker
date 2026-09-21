# builtinDedupe — Unit test cases

Last run: 2026-09-21 — 8/8 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns an empty Map when there are no duplicates | 4 distinct built-ins (family/friend/work/club), unique order/name/color | `new Map()` | ✅ |
| 2 | dedupes all four built-in types when each was seeded twice | 4 types × 2 copies each, second copy `createdAt` +5s | each `-2` id → its `-1` id | ✅ |
| 3 | dedupes three or more copies of the same built-in down to one keeper | `family-1/2/3`, ascending `createdAt` | `family-2→family-1`, `family-3→family-1` | ✅ |
| 4 | does not touch a copy the user renamed | `family-1` name `'Family'`, `family-renamed` name `'My Family'`, same order/color | `new Map()` | ✅ |
| 5 | does not touch a copy the user recolored | `family-1` color `pink`, `family-recolored` color `mint`, same order/name | `new Map()` | ✅ |
| 6 | ignores a non-built-in category even when name, color, and order match | `family-1` (`isBuiltIn:true`), `custom-family` (`isBuiltIn:false`, same name/color/order) | `new Map()` | ✅ |
| 7 | breaks a createdAt tie by id order | `b-id` and `a-id`, identical `createdAt`, `b-id` listed first | `b-id → a-id` (id order wins, not array order) | ✅ |
| 8 | produces the same result regardless of input order | case #2's family+friend fixture, array shuffled | same `Map` as unshuffled input | ✅ |

- Row 2/3: dedupe key is `order|colorId|name`; keeper is the earliest `createdAt` (ties broken by `id`, see row 7).
- Row 4/5/6: a category only counts as a duplicate when `isBuiltIn`, `order`, `colorId`, and `name` all match — any one difference means it's user-intended data, left alone.
