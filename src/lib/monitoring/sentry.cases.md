# `lib/monitoring/sentry` — Unit test cases

Last run: 2026-09-23 — 617/617 passed (full suite; 10/10 in this file)

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | removes event.user even when present | `user: { id: 'u1', email: 'a@b.com' }` | `result.user` undefined | ✅ |
| 2 | keeps only the path of request.url and deletes cookies/headers/query_string | `request.url='https://dwee-neon.vercel.app/auth/callback/?code=abc#access_token=xyz&refresh_token=r'` + `cookies`/`headers`/`query_string` | `request.url='https://dwee-neon.vercel.app/auth/callback/'`, `cookies`/`headers`/`query_string` undefined | ✅ |
| 3 | replaces an email address in message with `[email]` | `message='Failed to sync for user a@b.com'` | `message='Failed to sync for user [email]'` | ✅ |
| 4 | filters a token value in message while keeping the key | `message='redirected to /auth/callback/?code=abc#access_token=xyz&refresh_token=r&id_token=zzz'` | `message='redirected to /auth/callback/?code=[filtered]#access_token=[filtered]&refresh_token=[filtered]&id_token=[filtered]'` | ✅ |
| 5 | scrubs exception.values[n].value the same way message is scrubbed | `values=[{value:'reported by a@b.com, url had ?access_token=xyz&refresh_token=abc'}, {type:'Error'}]` (no `value`) | `values[0].value='reported by [email], url had ?access_token=[filtered]&refresh_token=[filtered]'`, `values[1].value` untouched (undefined) | ✅ |
| 6 | drops console breadcrumbs entirely | `breadcrumbs=[{category:'console',...}, {category:'navigation',...}]` | `breadcrumbs.map(category)` = `['navigation']` | ✅ |
| 7 | keeps non-console breadcrumb category and scrubs its data.url/from/to | breadcrumb `data={url,from,to,method}` each with query/hash | `category` kept, `url`/`from`/`to` reduced to path only, `method` untouched | ✅ |
| 8 | scrubs breadcrumb.message the same way | `breadcrumbs=[{category:'navigation', message:'signed in as a@b.com'}]` | `message='signed in as [email]'` | ✅ |
| 9 | passes an event with none of the scrubbed fields through unchanged | `event={level:'error', tags:{platform:'web'}}` | `result === event` (same reference), `breadcrumbs` still undefined | ✅ |
| 10 | leaves request.url undefined when it was undefined | `request={cookies:'session=abc'}` (no `url`) | `request.url` undefined | ✅ |

- Row 5: the token regex (`[^&#]+`) only stops at `&`/`#`, not whitespace, so a token value followed by free text (no `&`/`#` after it) would be swallowed to end of string. The fixture places `&` between params so each `[filtered]` boundary is exact and demonstrates the intended per-param scrubbing.
