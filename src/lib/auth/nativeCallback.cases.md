# `lib/auth/nativeCallback` 테스트 케이스

Last run: 2026-09-22 — 9/9 passed (`pnpm test:unit`)

## `isNativeAuthCallback`

| #   | 설명 (`it` title)                                | 입력                                              | 기대 결과 | 결과 |
| --- | ------------------------------------------------ | ------------------------------------------------- | --------- | ---- |
| 1   | accepts the bare redirect                        | `dwee://auth/callback`                            | `true`    | ✅   |
| 2   | accepts query, hash and trailing-slash variants  | `?code=1`, `#access_token=t`, `/?code=1` 접미     | `true`    | ✅   |
| 3   | rejects other deep links and look-alike prefixes | `dwee://magazine`, `dwee://auth/callbackx`, https | `false`   | ✅   |

## `toWebCallbackPath`

| #   | 설명 (`it` title)                               | 입력                                                  | 기대 결과                                        | 결과 |
| --- | ----------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ | ---- |
| 4   | forwards a PKCE code query                      | `dwee://auth/callback?code=abc`                       | `/auth/callback/?code=abc`                       | ✅   |
| 5   | forwards an implicit-flow hash                  | `dwee://auth/callback#access_token=t&refresh_token=r` | `/auth/callback/#access_token=t&refresh_token=r` | ✅   |
| 6   | keeps query and hash together, in order         | `dwee://auth/callback?code=abc#x=y`                   | `/auth/callback/?code=abc#x=y`                   | ✅   |
| 7   | drops a trailing slash before the query         | `dwee://auth/callback/?code=abc`                      | `/auth/callback/?code=abc`                       | ✅   |
| 8   | returns the bare page for a redirect w/o params | `dwee://auth/callback`                                | `/auth/callback/`                                | ✅   |
| 9   | returns null for a non-callback URL             | `dwee://magazine`                                     | `null`                                           | ✅   |
