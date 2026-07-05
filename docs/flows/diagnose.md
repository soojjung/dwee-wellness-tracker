# /magazine/personal-body-type/diagnose 화면 플로우

> 위치: `src/app/(fullscreen)/magazine/personal-body-type/diagnose/page.tsx`, `src/components/diagnose/`

`(fullscreen)` 라우트 그룹에 속합니다 — AppShell·BottomTabNav 없음. 사용자가 직접 진단을 시작할 때만 진입하는 몰입형 플로우입니다.

결과 화면은 별도 라우트 `/magazine/personal-body-type/diagnose/result` (= `DiagnoseResultScreen`)로 분리되어 있으며, `sessionStorage` 키 `REPORT_SESSION_KEY` 로 리포트를 전달받습니다.

---

## 상태 머신

`DiagnoseScreen` 은 `step` 상태 하나로 전체 플로우를 관리합니다.

```
type Slot = 'front' | 'side' | 'back'

type Step =
  | { kind: 'select'; photos: Partial<Record<Slot, PhotoData>> }
  | { kind: 'loading'; blurUrl: string }
  | { kind: 'error'; code: BodyTypeAnalyzeError }
```

```mermaid
stateDiagram-v2
    [*] --> select : 진입

    select --> select : 슬롯 사진 추가/교체 (front · side · back)
    select --> loading : front 슬롯 채워진 상태에서 분석 시작

    loading --> result_page : 분석 성공 → sessionStorage 저장 후 result 라우트로 이동
    loading --> error : 네트워크/API 오류 또는 no_body_detected

    error --> select : 재시도

    note right of loading
        front 사진 fileToBase64 → analyzeBodyType
        (Supabase Edge Function → OpenAI gpt-4o Vision)
    end note

    note right of result_page
        /magazine/personal-body-type/diagnose/result
        (DiagnoseResultScreen)
    end note
```

---

## 단계별 설명

| 단계 | 표시 내용 | 전환 조건 |
|------|-----------|-----------|
| **select** | 인트로(제목·안내·톤·개인정보 고지) + 슬롯별 인라인 파일 입력 (front · side · back) | front 슬롯이 채워진 상태에서 분석 버튼 → loading |
| **loading** | 스피너 + "분석 중" 문구 + 이탈 방지 힌트 | 응답 수신 → result 라우트 이동 또는 error |
| **error** | 에러 코드별 메시지 + 재시도 버튼 | 재시도 → select |

- 분석에는 `front` 슬롯 사진만 사용됩니다. `side`, `back` 슬롯은 UX 보조 목적.
- `loading` 단계에서는 뒤로가기 링크가 숨겨집니다 (Edge Function 호출 중 이탈 방지).
- 결과 PNG 내보내기는 `DiagnoseResultScreen`에서 `html-to-image` 기반 `exportReportAsPng()` 호출.
- 사진은 **어디에도 저장되지 않습니다** — base64 변환 후 Edge Function 에 전달되고 함수 종료 시 폐기.

---

## 에러 코드 매핑

`BodyTypeAnalyzeError` 값과 사용자 노출 메시지 키 (`t.magazine.diagnose.error.*`):

| 코드 | 메시지 키 |
|------|-----------|
| `unauthenticated` | `error.unauthenticated` |
| `rate_limit_exceeded` | `error.rateLimitExceeded` |
| `image_too_large` | `error.imageTooLarge` |
| `invalid_media_type` | `error.invalidMediaType` |
| `missing_image` | `error.missingImage` |
| `image_refused` | `error.imageRefused` |
| `no_body_detected` | `error.noBodyDetected` |
| `openai_failed` / `report_parse_failed` | `error.openaiFailed` |
| `openai_unreachable` | `error.openaiUnreachable` |
| `invalid_shot_type` / `invalid_locale` / `unknown` | `error.unknown` |

---

## 데이터 흐름

```mermaid
flowchart TD
    Picker([슬롯 파일 입력\nfront · side · back])
    Base64[fileToBase64]
    Service[bodyTypeService.analyzeBodyType]
    EdgeFn[(Supabase\nEdge Function)]
    OpenAI{{OpenAI\ngpt-4o Vision}}
    Report([ReportView\nDiagnoseResultScreen])
    PNG([PNG 내보내기])

    Picker -->|front File| Base64
    Base64 -->|imageBase64| Service
    Service -->|invoke| EdgeFn
    EdgeFn -->|API call| OpenAI
    OpenAI -->|BodyTypeReport JSON| EdgeFn
    EdgeFn -->|result| Service
    Service -->|report| Report
    Report -->|html-to-image| PNG

    classDef ui fill:#FDE8EF,stroke:#E5A8BD,color:#5C3A4A;
    classDef logic fill:#E8F0FD,stroke:#A8BDE5,color:#3A4A5C;
    classDef store fill:#F0E8FD,stroke:#BDA8E5,color:#4A3A5C;
    classDef ext fill:#E8FDE8,stroke:#A8E5BD,color:#3A5C3A;
    class Picker,Report,PNG ui;
    class Base64,Service logic;
    class EdgeFn store;
    class OpenAI ext;
```

---

## 관련 파일·문서

- `src/components/diagnose/DiagnoseScreen.tsx` — 상태 머신 + 슬롯별 인라인 파일 입력
- `src/components/diagnose/DiagnoseResultScreen.tsx` — 결과 라우트 화면 (report 수신 + PNG 내보내기)
- `src/components/diagnose/ReportView.tsx` — 체형 결과 카드 렌더
- `src/components/diagnose/exportReport.ts` — `html-to-image` 기반 PNG 저장
- `src/data/services/bodyTypeService.ts` — Edge Function 호출 + 익명 세션 보장
- `src/lib/image/fileToBase64.ts` — File → base64 + 미디어 타입 검증
- `src/types/bodyType.ts` — `BodyTypeReport`, `PrimaryBodyType`, `BodyTypeAnalyzeError`
- `supabase/functions/body-type-analyze/` — Edge Function 본체
- `supabase/migrations/0003_body_type_calls.sql` — 일 5회 rate limit 테이블 + RLS
- `supabase/README.md` — Edge Function 배포·시크릿 설정 절차
