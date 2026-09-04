---
description: 모달·다이얼로그·바텀시트 작성 규칙
paths:
  - 'src/components/**'
---

# 모달 규칙

`role="dialog"` + `aria-modal="true"` 를 가진 모든 오버레이(다이얼로그·바텀시트·컨센트 모달·풀스크린 크롭 뷰)에 공통 적용.

## 1) 훅 두 개 반드시 호출

모달 컴포넌트 본문에서:

```tsx
useBodyScrollLock();   // 뒤 페이지 스크롤 잠금 → 데스크톱에서 이중 스크롤바 방지
useEscToClose(onClose); // Esc 로 닫기 (submitting 중이면 handleClose 가 알아서 무시)
```

- 조건부 렌더링되는 모달만 사용 (마운트 = 오픈). 항상 마운트되는 컴포넌트에 넣지 말 것.
- `useBodyScrollLock` 는 body/html 의 `overflow: hidden` 을 count-based 로 관리 — 중첩 모달 OK.

## 2) 백드롭 클릭 취소

- 루트 `<div class="fixed inset-0 ...">` 에 `onClick={handleCancel}` 부착.
- 내부 sheet 는 `onClick={(e) => e.stopPropagation()}` 로 버블링 차단.
- 제출 중 (`submitting`) 이면 `handleCancel` 초입에서 return.

## 3) 스크롤 컨테이너 규칙

콘텐츠가 뷰포트를 넘을 수 있는 sheet 는:

- 외곽 sheet: `flex flex-col overflow-hidden`, `maxHeight: '90dvh'` (bottom sheet) 또는 `max-h-[90vh]` (centered).
- 스크롤 영역: `min-h-0 flex-1 overflow-y-auto`.
- 헤더/푸터는 `flex-shrink-0` (기본), 스크롤 영역만 확장.
- **스크롤바 두 개 금지** — sheet 자체는 `overflow-hidden`, 스크롤은 안쪽 컨테이너 하나에서만.

## 4) 접근성

- `role="dialog"` + `aria-modal="true"` 필수.
- `aria-labelledby` (title 이 있으면) 또는 `aria-label` 지정.
- 닫기 버튼에 `aria-label={t.home.cancel}` 또는 유사 사전 키.

## 5) z-index

- 일반 모달: `z-40`.
- 다른 모달 위에 겹치는 컨센트/확인 모달: `z-50`.

## 6) 배경 오패시티

- 콘텐츠 위 어둡히기: `bg-black/40` (기본) — 가벼운 sheet 라면 `bg-black/20` 도 허용.
- 이미지·비디오 뷰어처럼 콘텐츠에 집중해야 하는 풀스크린: `bg-brand-gray900/70`.

## 7) 훅 위치

- 훅 파일: `src/hooks/useBodyScrollLock.ts`, `src/hooks/useEscToClose.ts`.
- 새 공통 모달 훅은 같은 폴더에 추가.

## 8) 2버튼 확인 팝업의 취소 버튼

가로 2등분(취소/확인) 팝업에서 왼쪽 취소 버튼 배경은 `bg-brand-gray300` + `hover:bg-brand-gray400/60` 로 통일 (기존 `hover:bg-brand-gray200`, 배경 없음 조합은 사용 금지).

```
className="bg-brand-gray300 py-3.5 text-sm font-medium text-brand-gray900 transition-colors hover:bg-brand-gray400/60 ..."
```

`DiscardDraftDialog` 가 최초 적용 사례이며 `CancelEditDialog`, `LogoutConfirmDialog`, `WithdrawConfirmDialog`, `DeleteStickersDialog`, `DiaryCustomizeScreen`(`DiscardDialog`) 이 따른다. 동일 클래스 문자열이 여러 파일에 복붙되어 있으므로 새 2버튼 팝업 추가 시 이 값을 그대로 재사용할 것 — 값이 또 어긋나면 공유 컴포넌트/클래스 상수로 추출 검토.
