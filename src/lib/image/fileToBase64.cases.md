# fileToBase64 — Unit test cases

Last run: 2026-06-15 — 13/13 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | strips the data-URL prefix and returns only the base64 payload | FileReader result=`'data:image/jpeg;base64,abc123=='` | `'abc123=='` | ✅ |
| 2 | returns the full string when there is no comma (no prefix to strip) | FileReader result=`'justbase64noprefixatall'` | `'justbase64noprefixatall'` | ✅ |
| 3 | handles a data-URL whose base64 payload itself contains commas (only first comma is stripped) | FileReader result=`'data:image/png;base64,abc,def'` | `'abc,def'` | ✅ |
| 4 | handles an empty payload after the comma | FileReader result=`'data:image/jpeg;base64,'` | `''` | ✅ |
| 5 | rejects with file_read_failed when FileReader fires onerror | FileReader triggers `onerror` | rejects with `Error('file_read_failed')` | ✅ |
| 6 | rejects with file_read_failed when FileReader result is not a string | FileReader fires `onload` with `result=null` | rejects with `Error('file_read_failed')` | ✅ |
| 7 | returns "image/jpeg" for a JPEG file | `file.type='image/jpeg'` | `'image/jpeg'` | ✅ |
| 8 | returns "image/png" for a PNG file | `file.type='image/png'` | `'image/png'` | ✅ |
| 9 | returns "image/webp" for a WebP file | `file.type='image/webp'` | `'image/webp'` | ✅ |
| 10 | returns null for an unsupported type (image/gif) | `file.type='image/gif'` | `null` | ✅ |
| 11 | returns null for a non-image MIME type (application/pdf) | `file.type='application/pdf'` | `null` | ✅ |
| 12 | returns null for an empty MIME type string | `file.type=''` | `null` | ✅ |
| 13 | returns null for a MIME type that only partially matches (image/jpeg2000) | `file.type='image/jpeg2000'` | `null` | ✅ |

- Row 3: `result.indexOf(',')` finds the *first* comma, so `slice(comma + 1)` preserves any subsequent commas in the payload. This is the correct behaviour since base64 strings do not contain commas, but the test guards against naive `split(',')[1]` implementations.
- Row 6: `reader.result` can be `ArrayBuffer` if `readAsArrayBuffer` is called instead of `readAsDataURL`. The guard `typeof result !== 'string'` in the implementation rejects this case.
- Rows 1–6 require a `global.FileReader` stub because the vitest environment is `'node'` (no DOM). The stub is installed/removed per-test via `installFileReader()` / `removeFileReader()` helpers and does not replace any pure function.
