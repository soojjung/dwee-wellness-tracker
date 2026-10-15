# mediaStore — Draft-flow unit test cases

Last run: 2026-10-16 — 55/55 passed

Covers the draft mode introduced by the "commit on Customize home submit" refactor plus the
`picksConfirmed` gate. The store's committed lane (hydrate/setPhoto/etc.) is
covered indirectly through commit paths; direct tests can be added later if
that layer regresses.

## beginPhotoDraft

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 1 | activates the draft and snapshots committed state | committed count=2, empty urls | draftActive=true, count=2, picksConfirmed=true, arrays copied |
| 2 | defaults draft photoCount to 1 when nothing is committed | committed count=null | draftPhotoCount=1 |
| 3 | is idempotent — a second call while active is a no-op | active draft with 1 pick | draft urls / owned URLs unchanged, no revocations |
| 43 | clears the count on re-entry when its photos were all removed | committed 1장, clear slot 0, second call | count=null, picksConfirmed=false, cleared flag kept (dirty) |
| 44 | clears the count on re-entry when the set is only partly filled | 4장 with 2 picks, second call | count=null, picked blobs kept, no revocations |
| 45 | keeps the count on re-entry when every slot of it is filled | 1장 picked + confirmed, second call | count=1, picksConfirmed=true |

## discardPhotoDraft

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 4 | is a no-op when no draft is active | no draft | no state change, no revocations |
| 5 | resets all draft fields and revokes owned URLs | 2 owned URLs across 2 slots | draft fields cleared, both URLs revoked |
| 6 | does NOT revoke non-owned URLs (copied from committed) | committed url at slot 0 | committed url NOT in revokedUrls |

## draftSetPhotoCount

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 7 | is a no-op when no draft is active | | draftPhotoCount stays null |
| 8 | does nothing when count already matches (preserves picksConfirmed) | fresh draft, set count=1 (already 1) | picksConfirmed still true |
| 9 | resets picksConfirmed when the count actually changes | fresh draft, set 4 | count=4, picksConfirmed=false |

## draftSetPhoto

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 10 | is a no-op when no draft is active | | no URL created, no state change |
| 11 | populates url/blob/cleared and resets transform + picksConfirmed | fresh draft, pick blob | url=blob-mock, transform=null, cleared=false, owned URL added, picksConfirmed=false |
| 12 | revokes the prior owned URL when replacing a pick on the same slot | pick twice on same slot | first url revoked, owned=[second] |
| 13 | does NOT revoke a committed (unowned) URL when a slot gets picked over | committed url present | committed url NOT revoked, owned=[new] |
| 14 | drops a previously-cleared flag when the slot gets a new blob | cleared then set | cleared=false |

## draftClearPhoto

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 15 | is a no-op when no draft is active | | cleared flags stay false |
| 16 | revokes an owned URL and marks the slot cleared | pick then clear | url null, blob null, transform null, cleared=true, url revoked, picksConfirmed=false |
| 17 | does NOT revoke a committed (unowned) URL, still marks cleared | committed url + clear | committed NOT revoked, cleared=true |

## draftSetPhotoTransform

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 18 | is a no-op when no draft is active | | transforms stay null |
| 19 | stores the transform and leaves picksConfirmed untouched | active draft, set transform | transform saved, picksConfirmed unchanged |

## draftClearPhotoTransform

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 20 | is a no-op when no draft is active | | transforms stay null |
| 21 | resets the transform slot without touching picksConfirmed | set then clear | transform null, picksConfirmed unchanged |

## draftConfirmPicks

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 22 | is a no-op when no draft is active | | picksConfirmed stays false |
| 23 | flips picksConfirmed on | after a mutation that reset it | picksConfirmed=true |

## draftResetToDefault (R7-6)

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 23a | is a no-op when no draft is active | | picksConfirmed stays false |
| 23b | clears only the current count's slots, drops the count and confirms picks | count 2(슬롯 1·2) + 슬롯 0·3 에 다른 개수의 사진 | 슬롯 1·2 만 null·cleared, 0·3 유지, count null, picksConfirmed=true, dirty |
| 23c | revokes draft-owned URLs it clears | count 1 에 새로 고른 사진 → 리셋 | 그 URL revoke, owned 목록 비움 |
| 23d | commits as all photos cleared so the hero shows the default image | committed 1장 → 리셋 → commit | clearHomePhoto(0), setPhotoCount 호출 없음, committed URL 전부 null |
| 23e | opens the next draft as fresh when the committed count is not full | count 2 인데 슬롯 1·2 비어 있음(슬롯 0 만 사진) | draftPhotoCount null, picksConfirmed=false (HomeHero 와 같은 기준) |

## commitPhotoDraft

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 24 | is a no-op when no draft is active | | no repo calls |
| 25 | writes the new photoCount only when it changed | equal / then differing | first commit no setPhotoCount, second calls setPhotoCount(4) |
| 26 | persists a pending blob via setHomePhoto and resets its transform | pick slot 0 | setHomePhoto(0, blob) + clearPhotoTransform(0) called |
| 26a | resolves true on success and leaves the draft closed | pick slot 0 → commit | `true`, `draftActive=false` |
| 26b | resolves false and keeps the draft active when an upload fails | setHomePhoto rejects `offline` | `false`, `draftActive=true`, `error='offline'` (화면이 실패 토스트 표시 후 재시도 가능) |
| 27 | persists a cleared slot via clearHomePhoto | committed then cleared | clearHomePhoto + clearPhotoTransform called |
| 28 | sets a newly-introduced transform on an already-committed slot | committed url + new tx | setPhotoTransform(0, tx) |
| 29 | clears a transform when the draft drops it | committed non-null tx → draft null | clearPhotoTransform called, setPhotoTransform not called |
| 30 | deactivates the draft and mirrors changes into committed state | count+picks | draftActive=false, photoCount/URLs updated, draft URLs NOT revoked, picksConfirmed=false |
| 31 | revokes an old committed URL when a slot gets a new blob | committed url replaced | old committed URL revoked |

## isPhotoDraftDirty (pure predicate)

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 32 | returns false when the draft is inactive | draftActive=false | false |
| 33 | returns false when draft mirrors committed state exactly | identity snapshot | false |
| 34 | returns true when photoCount differs | draft=4, committed=1 | true |
| 35 | returns true when any slot has a pending blob | pendingBlobs[3]=blob | true |
| 36 | returns true when any slot was explicitly cleared | clearedPhotos[0]=true | true |
| 37 | returns true when a transform diverges from committed | draft tx=1.5x, committed null | true |
| 38 | treats identity vs null as equal (no false dirty on epsilon drift) | draft tx=DEFAULT vs null | false |

## Cross-cutting scenarios

| # | `it` title | 입력 | 기대 결과 |
|---|---|---|---|
| 39 | customize → edit-photos → back preserves picks (regression) | active draft, pick+confirm, second beginPhotoDraft | pick + picksConfirmed survive the re-mount |
| 40 | picksConfirmed resets on every pick mutation but not on crop edits | pick/confirm/transform/clear/confirm/count | flag flips exactly at pick+clear+count, unchanged on transform |
| 41 | discardPhotoDraft never leaks owned URLs across multiple pick replacements | pick 3x on same slot | 2 mid-replacement revocations + final on discard = every URL revoked |
| 42 | commitPhotoDraft with a pending blob transfers ownership without revoking the draft URL | pick + commit | draft URL preserved as committed URL, not in revokedUrls |
