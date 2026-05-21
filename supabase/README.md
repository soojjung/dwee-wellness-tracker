# supabase — 마이그레이션 & 어댑터 초안

이 폴더는 **MVP1 범위 밖**의 백엔드 자료 저장소입니다. 코드는 아직 `src/` 에 wiring 되어 있지 않아 typecheck/빌드에 영향 없습니다 (`tsconfig.json` 에서 exclude).

## 구조

```
supabase/
  migrations/
    0001_init.sql           — 초기 스키마 (profiles, period_logs, condition_logs, home_hero, home_overlays + RLS + 트리거)
  adapters/
    client.ts                       — supabase-js 클라이언트 + requireUserId()
    SupabaseSettingsAdapter.ts      — SettingsRepository 구현
    SupabasePeriodAdapter.ts        — PeriodRepository 구현
    SupabaseConditionAdapter.ts     — ConditionRepository 구현
    SupabaseMediaAdapter.ts         — MediaRepository 구현 (Storage bucket + DB 메타데이터)
```

## 적용 순서 (백엔드 도입 시점)

### 1. 의존성 설치
```bash
pnpm add @supabase/supabase-js
```

### 2. 환경 변수
`.env.local` 에:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. 마이그레이션 적용
**옵션 A (Supabase CLI):**
```bash
brew install supabase/tap/supabase
supabase link --project-ref <ref>
supabase db push
```
**옵션 B (대시보드 SQL Editor):** `migrations/0001_init.sql` 내용 통째로 붙여넣기 후 RUN.

### 4. 어댑터 이동 + wiring
- `supabase/adapters/*` → `src/data/adapters/supabase/` 로 이동
- `src/data/index.ts` 에서 어떤 어댑터를 쓸지 선택:
  ```ts
  // 전부 Supabase 로
  export const settingsRepo = supabaseSettingsAdapter;
  // 또는 하이브리드: IndexedDB 캐시 + 백그라운드 sync (별도 SyncAdapter 작성)
  ```
- `tsconfig.json` 의 `exclude` 에서 `supabase` 제거 (또는 이동 후 자연 해소)

### 5. 인증 추가
`LoginScreen` 의 Apple/Google 버튼에 `supabase.auth.signInWithOAuth(...)` 연결.

### 6. 기존 IndexedDB 데이터 마이그레이션 (선택)
첫 로그인 시 1회: IndexedDB 의 모든 데이터를 읽어 Supabase 로 INSERT. 끝나면 로컬 비우거나 캐시로만 유지.

## 핵심 설계 결정

- **클라이언트 UUID 유지** — `crypto.randomUUID()` 그대로. 오프라인 row도 충돌 없이 sync.
- **`updated_at` 트리거** — 모든 mutation 마다 자동 갱신. 다기기 충돌 시 last-write-wins 기준 컬럼.
- **`(user_id, start_date)` / `(user_id, date)` unique** — 같은 날 다기기 동시 입력 시 한쪽 INSERT 실패 → adapter 에서 항상 `upsert` 로 처리.
- **Storage 경로 규약** — `{user_id}/home_hero/current.{ext}` , `{user_id}/overlays/{id}.{ext}`. RLS 가 첫 폴더 segment(= user_id) 로 격리.
- **메타데이터 ↔ 파일 분리** — 좌표/순서는 DB, blob 은 Storage. 좌표만 바꿀 때 파일 재업로드 불필요.

## 충돌·동기화 시 주의

- `condition_logs` upsert 는 항상 `onConflict: 'user_id,date'` 사용.
- `period_logs` upsert 는 `onConflict: 'user_id,start_date'` 사용.
- Hard delete 사용 중. 다기기에서 "기기 A 에서 삭제 → 기기 B 에서 다시 보임" 문제 발생 시 `deleted_at` 컬럼 추가하여 soft delete 로 전환.

## 향후 확장

- Realtime publication 추가 (스키마 SQL 하단 주석 참조)
- 푸시 알림: Supabase Functions + FCM/APNs 별도 구성
- 데이터 export: `pg_dump` 또는 user-initiated CSV
