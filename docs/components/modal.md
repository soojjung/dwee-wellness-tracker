# 공통 컴포넌트 — 모달

모달·다이얼로그·바텀시트 작성 규칙의 단일 소스는 [`.claude/rules/modals.md`](../../.claude/rules/modals.md)다. 핵심만 요약:

- 조건부 렌더링되는 모달은 본문에서 `useBodyScrollLock()` + `useEscToClose(onClose)` 두 훅을 반드시 호출한다.
- z-index: 일반 모달 `z-40`, 다른 모달 위에 겹치는 컨센트/확인 모달은 `z-50`.
- 배경 오패시티: 기본 `bg-black/40` (가벼운 sheet 는 `bg-black/20`도 허용, 풀스크린 뷰어는 `bg-brand-gray900/70`).
- `role="dialog"` + `aria-modal="true"` + 제목과 연결된 `aria-labelledby` 필수.

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

바깥 div는 배경 dim + 클릭 취소(`onClick`에서 `e.target === e.currentTarget` 체크)만 맡고, 접근성 속성은 실제 콘텐츠 카드에 건다.

## 관련 문서

- [`.claude/rules/modals.md`](../../.claude/rules/modals.md) — 훅 위치, 스크롤 컨테이너, 카피 규칙 전체
