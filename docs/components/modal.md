# 공통 컴포넌트 설계 — 모달

## 위치 & 추출 시점

- 현재 모달·다이얼로그: `ConsentModal` (`src/components/diagnose/DiagnoseScreen.tsx`), `PeriodRangeDialog` (`src/components/app/PeriodRangeDialog.tsx`), `PeriodSelectSheet` (`src/components/app/PeriodSelectSheet.tsx`).
- 아직 공통 `Modal` 컴포넌트로 추출되지 않음. 세 번째 이상 중복되면 `src/components/ui/Modal.tsx` 로 추출.

## 필수 원칙

### 1) 배경(dim) 클릭 시 닫기
- overlay div 의 `onClick` 에서 `if (e.target === e.currentTarget) onClose()`. 카드 내부 클릭이 버블링되어도 target 비교로 걸러지므로 별도 stopPropagation 불필요.
- **예외**: 되돌리기 어려운 확인 다이얼로그(데이터 삭제 등)는 backdrop 클릭 닫기를 걸지 않는다. 명시적 취소/확인 버튼만 사용.

### 2) body scroll lock
- 모달 mount 동안 `document.body.style.overflow = 'hidden'`, unmount 시 이전 값 복원.
- useEffect cleanup 필수. 모달 뒤 페이지가 스크롤 되어 컨텍스트가 흐트러지는 것을 방지.

### 3) 접근성
- overlay: `role="dialog"` + `aria-modal="true"` + `aria-labelledby={titleId}`.
- 제목 요소에 대응 `id` 지정.
- Escape 키 닫기는 추후 공통 훅으로 정리 (현재 미구현).

### 4) 스타일 토큰
- Dim: `bg-black/30` (30%). Figma 의 `dim 15%` 는 로딩 화면 배경에만 사용 (모달과 다른 용도).
- 카드: `bg-brand-gray50 rounded-2xl`, 폭은 콘텐츠에 맞춰 조절 (예: `max-w-[333px]`).
- z-index: overlay `z-50`, 로딩 오버레이 `z-40` 보다 위.

### 5) 카피
- 모든 텍스트는 `useT()` 훅 경유. 인라인 문자열 금지.
- 취소/확인 라벨은 사전에서 (예: `t.magazine.diagnose.consent.cancel`).
