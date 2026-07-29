# palette — Unit test cases

Last run: 2026-07-29 — 9/9 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | contains exactly 7 palette entries | `PALETTE_IDS` | `length===7` | ✅ |
| 2 | contains all expected color ids | `[...PALETTE_IDS].sort()` | `['apricot','gray','lavender','melon','mint','peach','pink']` | ✅ |
| 3 | returns the correct bg for pink | `paletteFor('pink').bg` | `'#FDE2EF'` | ✅ |
| 4 | returns the correct fg for pink | `paletteFor('pink').fg` | `'#AE0063'` | ✅ |
| 5 | returns the correct dot for pink | `paletteFor('pink').dot` | `'#F689BC'` | ✅ |
| 6 | returns the correct bg for mint | `paletteFor('mint').bg` | `'#D4F2E7'` | ✅ |
| 7 | returns the correct fg for lavender | `paletteFor('lavender').fg` | `'#4C3C87'` | ✅ |
| 8 | returns an entry whose id field matches the requested id | all `PALETTE_IDS` | each `paletteFor(id).id === id` | ✅ |
| 9 | every PALETTE entry has non-empty bg, fg, and dot strings | all `PALETTE_IDS` | each `bg.length > 0`, `fg.length > 0`, `dot.length > 0` | ✅ |
