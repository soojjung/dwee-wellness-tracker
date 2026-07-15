# periodEdit — Unit test cases

Last run: 2026-07-15 — 40/40 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | normalizes missing endDate to startDate | `[log('a','2026-05-01'), log('b','2026-06-01','2026-06-05')]` | endDate of 'a' becomes `'2026-05-01'` | ✅ |
| 2 | sorts by startDate ascending | `[log('b','2026-06-01','2026-06-03'), log('a','2026-05-01')]` | key order `['a','b']` | ✅ |
| 3 | returns empty array for empty input | `[]` | `[]` | ✅ |
| 4 | finds a period on the start boundary | `drafts=['a':05-01~05-05]`, `d='2026-05-01'` | key `'a'` | ✅ |
| 5 | finds a period on the end boundary | `drafts=['a':05-01~05-05]`, `d='2026-05-05'` | key `'a'` | ✅ |
| 6 | finds a period on an interior day | `drafts=['a':05-01~05-05]`, `d='2026-05-03'` | key `'a'` | ✅ |
| 7 | returns null when date is before the period | `drafts=['a':05-01~05-05]`, `d='2026-04-30'` | `null` | ✅ |
| 8 | returns null when date is after the period | `drafts=['a':05-01~05-05]`, `d='2026-05-06'` | `null` | ✅ |
| 9 | returns null when drafts list is empty | `drafts=[]`, `d='2026-05-03'` | `null` | ✅ |
| 10 | picks a period whose end is within gapDays before d | `drafts=['a':05-01~05-05]`, `d='2026-05-06'` or `'2026-05-12'`, `gapDays=7` | key `'a'` | ✅ |
| 11 | excludes a period that ended more than gapDays ago | `drafts=['a':05-01~05-05]`, `d='2026-05-13'`, `gapDays=7` | `null` | ✅ |
| 12 | includes a period at exactly gapDays boundary (cutoff inclusive) | `drafts=['a':05-01~05-05]`, `d='2026-05-12'`, `gapDays=7` → cutoff `'2026-05-05'` | key `'a'` | ✅ |
| 13 | excludes a period that contains d (d is inside the range) | `drafts=['a':05-01~05-05]`, `d='2026-05-03'`, `gapDays=7` | `null` | ✅ |
| 14 | returns the latest-ending period among multiple candidates | `drafts=['a':04-01~04-05,'b':04-20~04-25]`, `d='2026-04-28'`, `gapDays=7` | key `'b'` | ✅ |
| 15 | returns null for empty drafts list | `drafts=[]`, `d='2026-05-10'`, `gapDays=7` | `null` | ✅ |
| 16 | merges touching periods and preserves originalId of first | `[new:1:05-06~05-09 (null), a:05-01~05-05 ('a')]` | `[a:05-01~05-09 ('a')]` | ✅ |
| 17 | merges overlapping periods | `[a:05-01~05-07 ('a'), b:05-05~05-10 ('b')]` | `[a:05-01~05-10 ('a')]` | ✅ |
| 18 | keeps disjoint periods separate | `[a:05-01~05-05, b:06-01~06-05]` | two separate drafts unchanged | ✅ |
| 19 | returns single period unchanged | `[a:05-01~05-05 ('a')]` | `[a:05-01~05-05 ('a')]` | ✅ |
| 20 | promotes originalId from later draft when first draft has none | `[new:1:05-01~05-03 (null), b:05-04~05-06 ('b')]` | merged, `originalId='b'` | ✅ |
| 21 | shrinks left when removing the start date | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-01'` | `[a:05-02~05-05]` | ✅ |
| 22 | shrinks right when removing the end date | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-05'` | `[a:05-01~05-04]` | ✅ |
| 23 | splits into two when removing a middle date | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-03'` | `[a:05-01~05-02, new:1:05-04~05-05]` | ✅ |
| 24 | removes the period entirely when it is a single-day range | `drafts=['a':05-01~05-01]`, targetKey `'a'`, `d='2026-05-01'` | `[]` | ✅ |
| 25 | passes through all drafts unchanged when targetKey not found | `drafts=['a':05-01~05-05]`, targetKey `'z'`, `d='2026-05-03'` | drafts unchanged | ✅ |
| 26 | passes through a draft unchanged when date is outside its range | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-10'` | drafts unchanged | ✅ |
| 27 | only removes the matching draft and preserves others | `drafts=['a':05-01~05-05,'b':06-01~06-05]`, targetKey `'a'`, `d='2026-05-01'` | `[a:05-02~05-05, b:06-01~06-05]` | ✅ |
| 28 | extends endDate forward | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-08'` | `[a:05-01~05-08]` | ✅ |
| 29 | does nothing when d is before current endDate | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-04'` | drafts unchanged | ✅ |
| 30 | does nothing when d equals current endDate (no change) | `drafts=['a':05-01~05-05]`, targetKey `'a'`, `d='2026-05-05'` | drafts unchanged | ✅ |
| 31 | does nothing when targetKey is not found | `drafts=['a':05-01~05-05]`, targetKey `'z'`, `d='2026-05-10'` | drafts unchanged | ✅ |
| 32 | merges with an adjacent later period when extending into it | `['a':05-01~05-05,'b':05-09~05-11]`, extend `'a'` to `'2026-05-10'` | `[a:05-01~05-11]` | ✅ |
| 33 | adds a disjoint new range to existing drafts | `drafts=['a':05-01~05-05]`, add `06-01~06-03` | `[a:05-01~05-05, new:1:06-01~06-03]` | ✅ |
| 34 | normalizes swapped start/end so lo <= hi | `drafts=[]`, add `'2026-06-03'~'2026-06-01'` | `[new:1:06-01~06-03]` | ✅ |
| 35 | merges into existing period when new range touches its end | `drafts=['a':05-01~05-05]`, add `05-06~05-09` | `[a:05-01~05-09]` | ✅ |
| 36 | merges into existing period when new range overlaps it | `drafts=['a':05-01~05-05]`, add `05-03~05-09` | `[a:05-01~05-09]` | ✅ |
| 37 | adds a single-day range to empty drafts | `drafts=[]`, add `'2026-05-15'~'2026-05-15'` | `[new:1:05-15~05-15]` | ✅ |
| 38 | returns empty array when working state matches original | `original=[log('a','2026-05-01','2026-05-05')]`, `working=toDrafts(original)` | `[]` | ✅ |
| 39 | detects add for a draft with no originalId | `original=[]`, `working=[new:1:05-01~05-03 (null)]` | `[{kind:'add', startDate:'2026-05-01', endDate:'2026-05-03'}]` | ✅ |
| 40 | detects remove when an original record is absent from working | `original=[log('a','2026-05-01','2026-05-03')]`, `working=[]` | `[{kind:'remove', id:'a'}]` | ✅ |
| 41 | detects update when endDate changed | `original=[log('a','05-01','05-05')]`, `working=[a:05-01~05-07]` | `[{kind:'update', id:'a', endDate:'2026-05-07'}]` | ✅ |
| 42 | detects update when startDate changed | `original=[log('a','05-01','05-05')]`, `working=[a:04-29~05-05]` | `[{kind:'update', id:'a', startDate:'2026-04-29'}]` | ✅ |
| 43 | detects split as update + add | `original=[log('a','05-01','05-05')]`, `working=[a:05-01~05-02, new:1:05-04~05-05]` | update + add | ✅ |
| 44 | handles mixed add/update/remove in one call | `original=[a,b]`, `working=[a (updated), new:1 (add)]` — b missing | update a + add new + remove b | ✅ |
| 45 | treats a PeriodLog with no endDate as a single-day record for change detection | `original=[log('a','2026-05-01')]`, `working=[a:05-01~05-01]` | `[]` (no change) | ✅ |

---

- Row 12: `cutoff = addDaysISO('2026-05-12', -7) = '2026-05-05'`. The endDate `'2026-05-05' >= cutoff` is inclusive, so the period qualifies.
- Row 20: `compact` preferentially keeps the first period's key/originalId; only promotes from the second when the first has `originalId: null`.
- Row 43: `removeDay` on a middle day produces two drafts; `computeChanges` maps the kept half to an update and the new fragment to an add.
