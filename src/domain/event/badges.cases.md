# badges — Unit test cases

Last run: 2026-07-29 — 37/37 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns an empty string unchanged | `title=''` | `''` | ✅ |
| 2 | returns a string of exactly MAX_BADGE_TITLE_LEN chars unchanged | `title='abcd'` (4 chars) | `'abcd'`, length=4 | ✅ |
| 3 | returns a string shorter than max unchanged | `title='hi'` | `'hi'` | ✅ |
| 4 | truncates an ASCII string longer than max to max chars | `title='abcdefgh'` | `'abcd'` | ✅ |
| 5 | truncates to an explicit max override | `title='abcdefgh'`, `max=3` | `'abc'` | ✅ |
| 6 | counts surrogate-pair emoji as single characters (spread semantics) | `title='🌸🌺🌻🌼'` (4 emoji) | `'🌸🌺🌻🌼'` (unchanged) | ✅ |
| 7 | truncates when emoji count exceeds max, preserving full emoji (no partial surrogate) | `title='🌸🌺🌻🌼🌷🏵️'` (6 code-points) | `[...result].length===4`, `six.startsWith(result)` | ✅ |
| 8 | handles a single multi-byte emoji (does not truncate) | `title='🌸'` | `'🌸'` | ✅ |
| 9 | handles mixed ASCII + emoji within max (no truncation) | `title='a🌸b'` (3 code-points) | `'a🌸b'` | ✅ |
| 10 | handles mixed ASCII + emoji exceeding max (truncates by code-point) | `title='a🌸bc'` (4 code-points — at max) | `'a🌸bc'` (unchanged) | ✅ |
| 11 | returns true when target equals start (inclusive lower bound) | `target='2026-03-01'`, `start='2026-03-01'`, `end='2026-03-05'` | `true` | ✅ |
| 12 | returns true when target equals end (inclusive upper bound) | `target='2026-03-05'`, `start='2026-03-01'`, `end='2026-03-05'` | `true` | ✅ |
| 13 | returns true when target is strictly between start and end | `target='2026-03-03'`, `start='2026-03-01'`, `end='2026-03-05'` | `true` | ✅ |
| 14 | returns false when target is before start | `target='2026-02-28'`, `start='2026-03-01'`, `end='2026-03-05'` | `false` | ✅ |
| 15 | returns false when target is after end | `target='2026-03-06'`, `start='2026-03-01'`, `end='2026-03-05'` | `false` | ✅ |
| 16 | returns true for a single-day range when target equals that day | `target='2026-06-15'`, `start='2026-06-15'`, `end='2026-06-15'` | `true` | ✅ |
| 17 | returns false for a single-day range when target is one day away | `target='2026-06-16'`, `start='2026-06-15'`, `end='2026-06-15'` | `false` | ✅ |
| 18 | handles year boundary correctly | `target='2026-01-01'`, `start='2025-12-31'`, `end='2026-01-02'` | `true` | ✅ |
| 19 | returns empty array when events list is empty | `events=[]`, `date='2026-03-10'` | `[]` | ✅ |
| 20 | includes an event whose startDate equals the target date | `event(startDate='2026-03-10')`, `date='2026-03-10'` | `[event]` | ✅ |
| 21 | includes an event whose endDate equals the target date | `event(endDate='2026-03-10')`, `date='2026-03-10'` | `[event]` | ✅ |
| 22 | includes an event that spans the target date | `event('2026-03-01','2026-03-31')`, `date='2026-03-15'` | `[event]` | ✅ |
| 23 | excludes an event whose range ends before the target date | `event('2026-03-01','2026-03-09')`, `date='2026-03-10'` | `[]` | ✅ |
| 24 | excludes an event whose range starts after the target date | `event('2026-03-11','2026-03-20')`, `date='2026-03-10'` | `[]` | ✅ |
| 25 | returns only the events whose range covers the target date when mixed | `[before, match, after]`, `date='2026-03-10'` | `[match]` | ✅ |
| 26 | returns multiple events when they all cover the target date | `[e1('03-01','03-31'), e2('03-10','03-10'), e3('03-08','03-12')]`, `date='2026-03-10'` | `[e1,e2,e3]` | ✅ |
| 27 | handles a single-day event on its day | `event('2026-07-04','2026-07-04')`, `date='2026-07-04'` | `[event]` | ✅ |
| 28 | returns empty array when no events match the date | `event('03-01','03-09')`, `date='2026-03-15'` | `[]` | ✅ |
| 29 | returns all matching events when count is under MAX_BADGES_PER_DAY | `2 events covering date` | `[e1,e2]` (2 items) | ✅ |
| 30 | returns exactly MAX_BADGES_PER_DAY events when count equals the cap | `3 events covering date` | `[e1,e2,e3]` (length=3) | ✅ |
| 31 | caps at MAX_BADGES_PER_DAY when more events match | `5 events covering date` | length=3, ids=`['1','2','3']` | ✅ |
| 32 | respects an explicit max override | `3 events covering date`, `max=1` or `max=2` | length=1 or 2 respectively | ✅ |
| 33 | returns empty array on empty events list | `events=[]`, any `date` | `[]` | ✅ |
| 34 | preserves input order up to the cap | `ids=['z','a','m','b']` covering date | ids of result=`['z','a','m']` | ✅ |
