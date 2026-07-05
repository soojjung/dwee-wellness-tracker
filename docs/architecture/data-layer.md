# 데이터 레이어: 어댑터 패턴 + 의존성 방향

dwee의 데이터 저장·조회 코드는 두 가지 원칙 위에 설계되어 있습니다.

1. **어댑터 패턴**: 저장 기술을 갈아끼울 수 있게 인터페이스와 구현을 분리.
2. **단방향 의존성**: 화면 → store → repository → adapter. 역방향 import 금지.

이 문서는 두 원칙이 코드에서 어떻게 구체화되는지, 왜 이렇게 짰는지를 설명합니다.

---

## 1. 어댑터 패턴 (Adapter Pattern)

### 1.1 비유: 콘센트와 플러그

전기 콘센트에 어떤 가전이든 꽂을 수 있는 이유는 **"콘센트 모양"이라는 약속**이
있기 때문입니다. 가전 제품(플러그)은 그 약속만 지키면 어떤 회사에서 만들든 동작합니다.

dwee의 데이터 저장도 같은 발상입니다.

- **콘센트 모양** = `Repository` 인터페이스 (메서드 시그니처 약속)
- **플러그** = `Adapter` (실제 저장 기술로 구현한 코드)

### 1.2 dwee에서의 구현

```
src/data/
├── repositories/                   ← 콘센트 모양 (인터페이스)
│   ├── PeriodRepository.ts         : list(), add(), update(), remove()
│   ├── ConditionRepository.ts      : getByDate(), upsert(), range()
│   ├── SettingsRepository.ts       : get(), update()
│   ├── MediaRepository.ts          : getPhotoCount/setPhotoCount, getHomePhoto/setHomePhoto/clearHomePhoto (slot×4),
│   │                                 getTextPosition/setTextPosition, getMainText/setMainText,
│   │                                 getSubText/setSubText, getTextOrder/setTextOrder
│   └── BookmarkRepository.ts       : list(), add(), remove(), has()
│
└── adapters/                       ← 플러그 (실제 구현)
    ├── indexeddb/                  ← IndexedDB로 구현한 어댑터들 (현재 wiring)
    │   ├── IndexedDBPeriodAdapter.ts
    │   ├── IndexedDBConditionAdapter.ts
    │   ├── IndexedDBSettingsAdapter.ts
    │   ├── IndexedDBMediaAdapter.ts
    │   ├── IndexedDBBookmarkAdapter.ts
    │   ├── keys.ts                 ← STORAGE_KEYS / DEPRECATED_KEYS / CURRENT_SCHEMA_VERSION (현재 v4)
    │   └── migrations.ts           ← v1→v4 순차 실행 (v3: home_hero blob → slot 0 이주)
    └── supabase/                   ← Supabase로 구현한 어댑터들 (MVP2.2 wiring 예정)
        ├── client.ts
        ├── SupabasePeriodAdapter.ts
        ├── SupabaseConditionAdapter.ts
        ├── SupabaseSettingsAdapter.ts
        └── SupabaseMediaAdapter.ts  ← home_photos(slot별) + home_decor_settings 테이블 사용.
                                        photo_count / text_position / text_order /
                                        main_text / sub_text 모두 구현 완료.
```

`indexeddb/`와 `supabase/` 폴더가 나란히 있어 **기술 교체는 `data/index.ts` 한 파일만 수정**하면 됩니다.

### 1.3 어댑터 교체 — 이미 두 구현체 존재

MVP2에서는 `data/index.ts`의 wiring 줄만 바꿉니다.

```ts
// 변경 전 (현재 — IndexedDB)
export const periodRepo: PeriodRepository = indexedDBPeriodAdapter;

// 변경 후 (Supabase wiring 시)
export const periodRepo: PeriodRepository = supabasePeriodAdapter;
```

→ **화면, store, 도메인 로직은 한 줄도 수정하지 않습니다.**
Repository 인터페이스 시그니처만 같으면 동작이 보장됩니다. 이게 어댑터 패턴의 가치입니다.

### 1.4 단일 진입점: `src/data/index.ts`

모든 외부(=store) 코드는 어댑터를 직접 import 하지 않고,
**`@/data` 한 곳만 import** 합니다.

```ts
// store/periodStore.ts
import { periodRepo, ensureMigrations } from '@/data';

await periodRepo.add({ startDate: '2026-05-06' });
```

→ store는 "지금 IndexedDB를 쓰는지 Supabase를 쓰는지" 알 필요가 없습니다.

---

## 2. 의존성 방향 (Dependency Direction)

### 2.1 핵심 그림

```
┌────────────────────────────────────┐
│ app/  (화면 = Next.js page)        │
└──────────────┬─────────────────────┘
               │ uses
               ▼
┌────────────────────────────────────┐
│ store/  (Zustand)                  │
└──────────────┬─────────────────────┘
               │ uses
               ▼
┌────────────────────────────────────┐
│ data/repositories/  (인터페이스)   │
└──────────────┬─────────────────────┘
               │ implemented by
               ▼
┌────────────────────────────────────┐
│ data/adapters/indexeddb/  (구현)   │
└────────────────────────────────────┘

domain/cycle/, lib/insight/  ← 순수 함수, 어디서든 호출 가능
constants/, types/           ← 어디서든 import 가능
```

화살표는 **"어느 쪽이 어느 쪽을 알고 있느냐"** 를 가리킵니다.
화살표는 한 방향으로만 흐르며, **역방향 import는 금지**입니다.

### 2.2 금지 사례

다음 import 들은 모두 **금지**입니다.

```ts
// ❌ 화면이 저장소를 직접 사용 (store를 거치지 않음)
// app/log/page.tsx
import { periodRepo } from '@/data';

// ❌ store가 화면을 import (위쪽 레이어 침범)
// store/periodStore.ts
import HomePage from '@/app/page';

// ❌ Repository 인터페이스가 IndexedDB 구현을 알고 있음
// data/repositories/PeriodRepository.ts
import { indexedDBPeriodAdapter } from '../adapters/indexeddb/...';

// ❌ 순수 도메인 함수가 Zustand store를 호출
// domain/cycle/predictor.ts
import { usePeriodStore } from '@/store/periodStore';
```

### 2.3 허용 사례

```ts
// ✅ 화면이 store를 사용
// app/page.tsx
import { usePeriodStore } from '@/store/periodStore';

// ✅ store가 repo를 사용
// store/periodStore.ts
import { periodRepo } from '@/data';

// ✅ store/화면이 순수 도메인 함수·유틸을 사용 (좌우 import OK)
import { averageCycleLength } from '@/domain/cycle/aggregate';
import { formatKR } from '@/lib/date';
import { COPY } from '@/constants/copy';
import type { PeriodLog } from '@/types';
```

### 2.4 왜 단방향이어야 하는가

**1) 교체 비용을 한 곳에 가둔다**
저장 기술을 바꿀 때 변경 지점이 `data/adapters/`로 국한됩니다.
위쪽 레이어가 아래쪽을 우회 import 하면 이 보장이 깨집니다.

**2) 테스트가 쉬워진다**
도메인 로직(`domain/cycle/`, `lib/insight/`)이 store나 저장소를 모르므로,
단순 입출력만으로 단위 테스트가 가능합니다.

**3) 사고의 부담을 줄인다**
한 파일을 읽을 때 "이 파일이 무엇을 알고 있는지"가 폴더 위치만 봐도 명확해집니다.
양방향 의존이 생기면 추적이 폭발적으로 어려워집니다.

---

## 3. 체크리스트 (코드 리뷰용)

새 코드를 작성하거나 리뷰할 때 다음을 확인합니다.

- [ ] 화면(`src/app/**`)에서 `@/data`를 직접 import 하지 않았는가?
- [ ] store에서 `@/data` 외 다른 어댑터 경로를 직접 import 하지 않았는가?
- [ ] Repository 인터페이스 파일이 어댑터를 import 하지 않는가?
- [ ] `domain/cycle/**`, `lib/insight/**` 가 부수효과 없는 순수 함수인가?
- [ ] 새 어댑터 추가 시 기존 인터페이스 시그니처를 바꾸지 않았는가?

---

## 관련 파일·문서

- `CLAUDE.md` — "코딩 표준" 섹션의 의존성 방향 규칙
- `.claude/rules/storage.md` — 저장소 규칙 가드레일
- `src/data/index.ts` — 단일 진입점
- `src/data/repositories/*.ts` — Repository 인터페이스 (Period / Condition / Settings / Media / Bookmark)
- `src/data/adapters/indexeddb/*.ts` — 로컬 구현 (현재 wiring, schema v4)
- `src/data/adapters/supabase/*.ts` — 원격 구현 (MVP2.2 wiring 예정)
- `src/domain/home/decor.ts` — PhotoCount / PhotoSlot / TextPosition / TextOrder 타입·상수
- `src/store/mediaStore.ts` — MediaRepository 소비 store
- `docs/flows/customize.md` — 홈 커스터마이즈 화면 플로우
