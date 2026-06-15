# supabase — 마이그레이션 & DB 스키마

이 폴더는 Supabase 백엔드 자산 저장소입니다. 어댑터 코드는 `src/data/adapters/supabase/` 로 이동 완료. 현재 `data/index.ts` wiring 은 IndexedDB 이며, Supabase wiring 은 MVP2.2 예정.

## 구조

```
supabase/
  migrations/
    0001_init.sql       — 초기 스키마 (profiles, period_logs, condition_logs,
                          home_hero, media bucket + RLS + 트리거)
    0002_media_v2.sql   — home_hero 폐기 + home_photos(4슬롯) +
                          home_decor_settings(photo_count, text_position,
                          text_order, main_text, sub_text) 신규 생성
  functions/
    body-type-analyze/  — 매거진 퍼스널 체형 진단 Edge Function (M2).
                          사진 base64 입력 → Anthropic Vision 호출 →
                          구조화 JSON 반환. 사진은 저장 X (in-memory).
                          M2.0 스켈레톤 상태. 본체는 M2.1.
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
```

## Supabase wiring 활성화 순서 (MVP2.2)

### 1. 환경 변수 확인
`.env.local` 에 값이 채워져 있는지 확인:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 2. 마이그레이션 적용
**옵션 A (Supabase CLI):**
```bash
brew install supabase/tap/supabase
supabase link --project-ref <ref>
supabase db push
```
**옵션 B (대시보드 SQL Editor):** `migrations/0001_init.sql` → `migrations/0002_media_v2.sql` 순서대로 내용 붙여넣기 후 각각 RUN.

### 3. `data/index.ts` wiring 교체
```ts
// 전부 Supabase 로
export const settingsRepo = supabaseSettingsAdapter;
// 또는 하이브리드: IndexedDB 캐시 + 백그라운드 sync (별도 SyncAdapter 작성)
```

### 4. 인증 연결
`LoginScreen` 의 Apple/Google 버튼에 `supabase.auth.signInWithOAuth(...)` 연결.

### 5. 기존 IndexedDB 데이터 마이그레이션 (선택)
첫 로그인 시 1회: IndexedDB 의 모든 데이터를 읽어 Supabase 로 INSERT. 끝나면 로컬 비우거나 캐시로만 유지.

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
