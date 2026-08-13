# supabase — 마이그레이션 & DB 스키마

이 폴더는 Supabase 백엔드 자산 저장소입니다. 어댑터 코드는 `src/data/adapters/supabase/`. `src/data/index.ts` 가 auth 상태에 따라 어댑터를 자동 분기(STEP 2.1) — 인증 사용자 → Supabase, 익명/env-less → IndexedDB.

## 구조

```
supabase/
  migrations/
    0001_init.sql        — 초기 스키마 (profiles, period_logs, condition_logs,
                           home_hero, media bucket + RLS + 트리거)
    0002_media_v2.sql    — home_hero 폐기 + home_photos(4슬롯) +
                           home_decor_settings(photo_count, text_position,
                           text_order, main_text, sub_text) 신규 생성
    0003_body_type_calls.sql
                         — body_type_calls (Edge Function 일일 호출 카운터, 일 10회 limit)
    0004_anon_lockout.sql
                         — defensive RLS: 익명 user 의 Supabase 데이터 테이블
                           쓰기/읽기 차단. body_type_calls 는 익명 호출 유지.
    0005_home_photos_slot_widen.sql
                         — home_photos 슬롯 범위 확장
    0006_events.sql      — event_categories (built-in seed 4종 포함) +
                           event_logs (title, memo, start_date, end_date,
                           category_id) 신규 생성. RLS anon lockout.
    0007_event_period_link.sql
                         — event_logs.linked_period_id (→ period_logs,
                           on delete set null) 컬럼 추가
    0008_diary_stickers.sql
                         — diary_stickers (storageRef, ratio, source) +
                           media bucket 경로 규약 신규. RLS anon lockout.
    0009_diary_sticker_placements.sql
                         — diary_sticker_placements (sticker_id, year, month,
                           x, y, scale, rotation) 신규. RLS anon lockout.
    0010_home_photo_transform.sql
                         — home_photos.transform jsonb 컬럼 추가. 비파괴
                           크롭(pan/zoom) 메타데이터 저장. 페이로드
                           { scale, offsetXNorm, offsetYNorm }, null = 편집 없음.
  functions/
    body-type-analyze/   — 매거진 퍼스널 체형 진단 Edge Function.
                           사진 base64 입력 → gpt-4o Vision 호출 →
                           구조화 JSON 반환. 사진은 저장 X (in-memory).
    delete-account/      — 회원 탈퇴 Edge Function.
                           호출자 JWT 로 본인 확인 → service_role 로
                           media 버킷 오브젝트 재귀 삭제 →
                           auth.admin.deleteUser 호출.
                           public.* 테이블 rows 는 auth.users 의
                           on delete cascade 로 자동 삭제.
```

어댑터 코드 위치: `src/data/adapters/supabase/`

```
src/data/adapters/supabase/
  client.ts                       — supabase-js 클라이언트 + requireUserId()
  SupabaseSettingsAdapter.ts      — SettingsRepository 구현
  SupabasePeriodAdapter.ts        — PeriodRepository 구현
  SupabaseConditionAdapter.ts     — ConditionRepository 구현
  SupabaseMediaAdapter.ts         — MediaRepository 구현
                                    · home_photos 테이블: slot 별 Storage 경로
                                    · home_decor_settings 테이블: photo_count /
                                      text_position / text_order /
                                      main_text / sub_text
  SupabaseEventCategoryAdapter.ts — EventCategoryRepository 구현 (event_categories)
  SupabaseEventAdapter.ts         — EventRepository 구현 (event_logs)
  SupabaseDiaryStickerAdapter.ts  — DiaryStickerRepository 구현
                                    (diary_stickers + media bucket)
  SupabaseDiaryStickerPlacementAdapter.ts
                                  — DiaryStickerPlacementRepository 구현
                                    (diary_sticker_placements)
```

## Supabase 활성화 순서

### 1. 환경 변수
`.env.local` 에 staging 프로젝트 값을 채움:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
env 가 비어있으면 `isSupabaseConfigured === false` → `data/index.ts` 가 IndexedDB 로 자동 fallback. dev/CI 환경에서는 그대로 두어도 됨.

### 2. 마이그레이션 적용
0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007 → 0008 → 0009 → 0010 순서.

**옵션 A (Supabase CLI):**
```bash
brew install supabase/tap/supabase
supabase link --project-ref <ref>
supabase db push
```
**옵션 B (대시보드 SQL Editor):** 각 `migrations/*.sql` 파일을 0001부터 0010까지 순서대로 붙여넣고 RUN.

### 3. Auth provider 활성화 (Supabase 대시보드 → Authentication → Providers)
- **Email** — enable. "Confirm email" 은 MVP 단계에서는 off 권장 (signUp 직후 세션 발급되어야 STEP 2.2 흐름이 즉시 로그인됨).
- **Anonymous sign-ins** — enable. `authStore.signInAnonymously()` 가 이 provider 를 사용. 끄면 첫 진입 시 `anonFailed` 에러.
- **Apple / Google** — 활성화 완료. Apple client_secret JWT 는 6개월 만료 → `scripts/gen-apple-secret.mjs` 로 재생성 후 Supabase 대시보드 → Auth → Providers → Apple → "Secret Key" 에 붙여넣기.

### 4. wiring
`src/data/index.ts` 가 `authStore` 의 user 상태를 보고 mode 를 토글 (STEP 2.1 완료). 추가 코드 작업 없음.

### 5. 기존 IndexedDB 데이터 마이그레이션
사용자가 익명 상태에서 만든 로컬 데이터는 첫 email/OAuth 로그인 시 1회 Supabase 로 upsert (STEP 2.3 예정). 결정 (C1) 은 local-wins.

## STEP 2.8 — RLS 검증 SQL

staging 에 0001~0004 적용 직후 한 번 돌려서 정책이 의도대로 동작하는지 확인.

### 인증 user 로 CRUD (통과해야 함)
Supabase SQL Editor 의 "Run as" 에서 임의 staging 사용자 선택, 또는 service-role 대신 anon-key 로 클라이언트에서 시도.
```sql
-- 본인 row insert/select/update 모두 통과해야 함
insert into period_logs (user_id, start_date) values (auth.uid(), current_date);
select * from period_logs where user_id = auth.uid();
update period_logs set end_date = current_date where user_id = auth.uid();
```

### 익명 user (anonymous JWT) — 거부 확인 (0004 의 핵심)
브라우저 콘솔에서:
```js
await supabase.auth.signInAnonymously();
const r = await supabase.from('period_logs').insert({ user_id: (await supabase.auth.getUser()).data.user.id, start_date: '2026-06-16' });
console.log(r.error); // 정책 위반 (42501) 이어야 함
```

### 타 유저 데이터 접근 — 거부 확인
같은 클라이언트에서 다른 사용자의 user_id 로 select 시도:
```js
await supabase.from('period_logs').select('*').eq('user_id', '<other-user-uuid>');
// data 가 빈 배열이어야 함 (정책이 filter)
```

### body_type_calls — 익명 통과 확인 (의도된 예외)
```js
// 매거진 diagnose 호출이 익명 user 에서도 카운트되어야 하므로
await supabase.from('body_type_calls').insert({ user_id: (await supabase.auth.getUser()).data.user.id });
// 통과 (RLS 차단 없음)
```

### Storage media bucket — 익명 차단 확인
```js
const f = new Blob(['test']);
const r = await supabase.storage.from('media').upload(`${userId}/home_photos/0.png`, f);
console.log(r.error); // 익명 user 면 정책 위반이어야 함
```

검증 통과 후 `staging` 라벨로 마이그레이션 적용 끝.

## 핵심 설계 결정

- **클라이언트 UUID 유지** — `crypto.randomUUID()` 그대로. 오프라인 row도 충돌 없이 sync.
- **`updated_at` 트리거** — 모든 mutation 마다 자동 갱신. 다기기 충돌 시 last-write-wins 기준 컬럼.
- **`(user_id, start_date)` / `(user_id, date)` unique** — 같은 날 다기기 동시 입력 시 한쪽 INSERT 실패 → adapter 에서 항상 `upsert` 로 처리.
- **Storage 경로 규약** — `{user_id}/home_photos/{slot}.{ext}`. RLS 가 첫 폴더 segment(= user_id) 로 격리.

## 충돌·동기화 시 주의

- `condition_logs` upsert 는 항상 `onConflict: 'user_id,date'` 사용.
- `period_logs` upsert 는 `onConflict: 'user_id,start_date'` 사용.
- Hard delete 사용 중. 다기기에서 "기기 A 에서 삭제 → 기기 B 에서 다시 보임" 문제 발생 시 `deleted_at` 컬럼 추가하여 soft delete 로 전환.

## Edge Functions

### delete-account

계정 영구 삭제. 클라이언트 → `supabase.functions.invoke('delete-account')` → Edge Function이 다음 순서로 처리.

1. 호출자 JWT 검증 (`userClient.auth.getUser()`)
2. `service_role` 클라이언트로 `media/{userId}/…` 오브젝트 재귀 열거 + `storage.remove()`
3. `auth.admin.deleteUser(userId)` — `public.*` 행은 `on delete cascade`로 자동 삭제

**응답 유실 대비:** 클라이언트(`accountService.ts`)는 응답 수신 실패 시 세션을 재확인하여 서버 삭제 성공을 감지, 로컬 세션을 정리한다.

환경 변수: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (자동 주입 — 별도 `secrets set` 불필요).

배포:
```bash
supabase functions deploy delete-account
```

### body-type-analyze (M2)

매거진 퍼스널 체형 진단. 클라이언트 → `supabase.functions.invoke('body-type-analyze', { body })` → Edge Function 이 OpenAI gpt-4o Vision 호출 → 구조화 JSON 응답. **사진은 어디에도 저장하지 않음** (Storage 사용 X, 함수 내 in-memory 처리 후 폐기).

요청 바디 (`RequestBody`):
- `imageBase64`: 사진의 base64 문자열 (최대 ~18 MB)
- `imageMediaType`: `'image/jpeg' | 'image/png' | 'image/webp'`
- `shotType`: `'full-body' | 'upper-body'`
- `locale`: `'en' | 'ko'`

### 시크릿 설정 (한 번만)

1. OpenAI API 키 발급: https://platform.openai.com/api-keys → Create new secret key. `sk-proj-...` 또는 `sk-...` 형식. 한 번만 보여주니 안전한 곳에 복사.
2. Supabase CLI 설치·로그인 (없으면):
   ```bash
   brew install supabase/tap/supabase
   supabase login
   supabase link --project-ref <project-ref>
   ```
3. 시크릿 등록:
   ```bash
   supabase secrets set OPENAI_API_KEY=sk-...
   ```
4. 로컬 테스트:
   ```bash
   supabase functions serve body-type-analyze --env-file supabase/.env.local
   ```
   (`supabase/.env.local` 에 `OPENAI_API_KEY=` 한 줄. **커밋 금지** — `.gitignore` 의 `.env*.local` 패턴이 커버.)
5. 배포:
   ```bash
   supabase functions deploy body-type-analyze
   ```
   JWT 검증은 기본 ON. 익명 세션 JWT 도 통과되므로 별도 플래그 불필요.

### 타입체크 제외

함수는 Deno 런타임이라 Next.js `tsc` 와 호환 X. `tsconfig.json` 의 `exclude` 에 `supabase/functions` 포함됨. 로컬 lint 가 필요하면 Deno 익스텐션을 별도 설치.

## 향후 확장

- Realtime publication 추가 (스키마 SQL 하단 주석 참조)
- 푸시 알림: Supabase Functions + FCM/APNs 별도 구성
- 데이터 export: `pg_dump` 또는 user-initiated CSV
