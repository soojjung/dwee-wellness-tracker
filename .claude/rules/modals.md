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
- **알려진 예외**: `PhotoRatioScreen` 은 `useEscToClose`만 호출하고 `useBodyScrollLock`이 빠져 있다. `StickerScanScreen` 은 반대로 `useBodyScrollLock`만 호출하고 `useEscToClose`가 빠져 있다. 둘 다 풀스크린 단계 화면이라 body 스크롤/Esc 취소 영향이 적어 방치된 상태 — 새 코드를 이 패턴 그대로 복붙하지 말 것. 고칠 때는 코드가 아니라 이 문서를 먼저 갱신.

## 2) 백드롭 클릭 취소

- 루트 `<div class="fixed inset-0 ...">` 에 `onClick={handleCancel}` 부착.
- 내부 sheet 는 `onClick={(e) => e.stopPropagation()}` 로 버블링 차단.
- 제출 중 (`submitting`) 이면 `handleCancel` 초입에서 return.
- 대안: 바깥 `onClick` 에서 `e.target === e.currentTarget` 일 때만 취소 (`DiagnoseConsentModal`). 둘 중 하나만 쓸 것.

## 3) 스크롤 컨테이너 규칙

콘텐츠가 뷰포트를 넘을 수 있는 sheet 는:

- 외곽 sheet: `flex flex-col overflow-hidden`.
- 높이 (폰 폭 바텀시트): `h-[calc(100dvh-120px-env(safe-area-inset-top,0px))]` — 상태바 아래 120px 를 남겨 뒤 화면 제목이 보이게. 내용이 짧은 시트는 `h-` 대신 `max-h-` 로 같은 값 (`PeriodEditSheet`). 기준 사용처: `EventFormSheet`·`PeriodRecordSheet`·`PeriodEditSheet`.
- 높이 (넓은 화면 `sm` 이상, 가운데 뜨는 시트): `sm:h-auto sm:max-h-[90vh]`.
- **알려진 예외**: `PhotoImportModal` 은 `maxHeight: '90dvh'` (위 기준 이전 값). 새 시트는 이 값을 따르지 말 것.
- 스크롤 영역: `min-h-0 flex-1 overflow-y-auto`.
- 헤더/푸터는 `flex-shrink-0` (기본), 스크롤 영역만 확장.
- **스크롤바 두 개 금지** — sheet 자체는 `overflow-hidden`, 스크롤은 안쪽 컨테이너 하나에서만.

## 3-1) 시트 폭

- 폰 폭: `w-full max-w-md` 바텀시트.
- 넓은 화면(`sm` 이상): `sm:max-w-[416px]` — 화면 카드(앱 열 448px 에서 좌우 16px 안쪽)보다 넓어 보이지 않게 (R8-3). 가운데 뜨는 시트·아래 붙는 시트 모두.

## 4) 접근성

- `role="dialog"` + `aria-modal="true"` 필수.
- `aria-labelledby` (title 이 있으면) 또는 `aria-label` 지정.
- 닫기 버튼에 `aria-label={t.home.cancel}` 또는 유사 사전 키.

## 4-1) 포커스 트랩 (자동)

- 루트 레이아웃의 `ModalFocusTrap`(`src/components/app/ModalFocusTrap.tsx`)이 가장 위(DOM 마지막)의 `aria-modal="true"` 안에서만 Tab / Shift+Tab 이 돌게 하고, 열릴 때 포커스를 모달로, 닫힐 때 연 버튼으로 돌려준다.
- 모달 쪽에서 할 일은 `role="dialog"` + `aria-modal="true"` 를 모달 루트(또는 dim 안쪽 카드 — `DiagnoseConsentModal`)에 두는 것뿐. 따로 훅을 달지 않는다.
- 보기 전용으로 겹쳐 그리는 요소(예: 스와이프 중 옆 달 `DiaryNeighborMonth`)에는 `aria-modal` 을 쓰지 말 것 — `inert` + `aria-hidden` 으로 둔다.

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

`DiscardDraftDialog` 가 최초 적용 사례이며 `CancelEditDialog`, `LogoutConfirmDialog`, `WithdrawConfirmDialog`, `DeleteStickersDialog`, `DiaryCustomizeScreen`(`DiscardDialog`), `DeleteEventDialog` 가 따른다.

**공유 컴포넌트로 추출 완료**: 위 7개 모두 `src/components/ui/ConfirmDialog.tsx`의 얇은 래퍼다 — 취소 버튼 색상을 포함한 마크업 전체(핑크 경고 배지, 제목/본문, 취소·확인 분할 푸터, `useBodyScrollLock`/`useEscToClose`)가 이 컴포넌트에 있다. 새 2버튼 확인 팝업을 추가할 때는 클래스를 복붙하지 말고 `ConfirmDialog`를 직접 사용할 것.
