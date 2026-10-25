# 공통 컴포넌트 — 모달

모달·다이얼로그·바텀시트 작성 규칙의 단일 소스는 [`.claude/rules/modals.md`](../../.claude/rules/modals.md)다. 핵심만 요약:

- 조건부 렌더링되는 모달은 본문에서 `useBodyScrollLock()` + `useEscToClose(onClose)` 두 훅을 반드시 호출한다 (알려진 예외 2개는 rules §1).
- z-index: 일반 모달 `z-40`, 다른 모달 위에 겹치는 컨센트/확인 모달은 `z-50`.
- 배경 오패시티: 기본 `bg-black/40` (가벼운 sheet 는 `bg-black/20`도 허용, 풀스크린 뷰어는 `bg-brand-gray900/70`).
- `role="dialog"` + `aria-modal="true"` 필수. 이름은 화면에 제목 요소가 있으면 `aria-labelledby`, 없으면 `aria-label`.
- 키보드 포커스 트랩은 자동 — 모달마다 훅을 달지 않는다 (아래 §키보드 포커스).
- 넓은 화면(`sm` 이상)에서 시트 폭은 `sm:max-w-[416px]` — 화면 카드(좌우 16px 안쪽)보다 넓어 보이지 않게. 폰 폭에선 전체 폭 바텀시트 그대로.

## 재사용 컴포넌트

- **2버튼 확인 팝업**: `src/components/ui/ConfirmDialog.tsx`. 가로 2등분(취소/확인) 팝업 7종(`DiscardDraftDialog`, `CancelEditDialog`, `LogoutConfirmDialog`, `WithdrawConfirmDialog`, `DeleteStickersDialog`, `DiaryCustomizeScreen`의 `DiscardDialog`, `DeleteEventDialog`)이 모두 이 컴포넌트의 얇은 래퍼다. 새 2버튼 확인 팝업을 추가할 때는 직접 마크업을 복붙하지 말고 `ConfirmDialog`를 사용할 것.
- **바텀시트**: `src/components/ui/DraggableBottomSheet.tsx` (3-snap: peek/medium/full, 전체 표면 드래그).

## 예시 — 카드 레벨 aria 배치

overlay(바깥 dim div)가 아니라 **안쪽 카드**에 `role="dialog"` + `aria-modal="true"` + `aria-labelledby`를 붙이는 패턴은 `DiagnoseConsentModal.tsx`의 `ConsentModal`을 참고:

```tsx
<div onClick={backdropCancel} className="fixed inset-0 z-50 ... bg-black/30">
  <div role="dialog" aria-modal="true" aria-labelledby="diagnose-consent-title" className="...">
    <h2 id="diagnose-consent-title">{c.title}</h2>
    ...
  </div>
</div>
```

바깥 div는 배경 dim + 클릭 취소만 맡고, 접근성 속성은 실제 콘텐츠 카드에 건다. 백드롭 클릭 취소는 기본이 rules §2 방식(바깥 `onClick` + 안쪽 카드 `e.stopPropagation()`)이고, 이 예시처럼 바깥 `onClick` 에서 `e.target === e.currentTarget` 를 확인하는 방식도 허용한다.

## 키보드 포커스 (포커스 트랩)

루트 레이아웃(`src/app/layout.tsx`)에 한 번 마운트된 [`ModalFocusTrap`](../../src/components/app/ModalFocusTrap.tsx)이 앱의 모든 모달을 처리한다 (R8-13).

| 시점 | 동작 |
|---|---|
| 모달이 뜰 때 | 포커스를 모달로 옮긴다. 안에 이미 포커스가 있으면(`autoFocus` 입력칸 등) 그대로 둔다. 모달 상자 자체에는 포커스 테두리를 그리지 않는다(`globals.css`). |
| 열려 있는 동안 | Tab / Shift+Tab 이 **가장 위 모달 안에서만** 돈다. 비활성 버튼·숨은 요소(`display:none` file input)·`inert` 안쪽은 건너뛴다. |
| 겹쳐 열릴 때 | DOM 에서 마지막 `aria-modal="true"` 가 가장 위로 본다 (예: 일정 시트 위 일정 유형 편집). 위 모달이 닫히면 그걸 연 버튼(아래 모달 안)으로 돌아간다. |
| 닫힐 때 | 모달을 열기 전에 포커스가 있던 요소로 돌려준다 (예: 일정 모달 → [추가하기] 버튼). |

모달 쪽 조건은 루트(또는 위 예시처럼 안쪽 카드)에 `role="dialog"` + `aria-modal="true"` 를 두는 것뿐이다. 반대로 대화상자가 아닌데 위에 겹쳐 그리는 보기 전용 요소(스와이프 중 옆 달 `DiaryNeighborMonth`)에는 `aria-modal` 을 쓰지 말고 `inert` + `aria-hidden` 으로 둔다 — `aria-modal` 을 달면 포커스가 그리로 갇힌다.

## 관련 문서

- [`.claude/rules/modals.md`](../../.claude/rules/modals.md) — 훅·백드롭 취소·스크롤 컨테이너·폭·접근성·포커스 트랩·2버튼 팝업 규칙 전체
