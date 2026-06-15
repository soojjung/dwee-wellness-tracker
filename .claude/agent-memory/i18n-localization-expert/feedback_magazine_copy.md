---
name: Magazine copy tone patterns
description: 직역체·어색한 표현 사례와 수정 방향 — 매거진 글 리뷰(2026-06-15)에서 도출
type: feedback
---

magazine 카피 리뷰에서 잡아낸 반복 패턴:

1. **한국 뷰티 업계 용어 직역 금지** — "frame diagnosis"는 한국의 "골격 진단"을 직역한 표현. 영미권에서는 "body-type analysis"가 더 자연스럽다. 한국 패션/뷰티 개념어를 en에 쓸 때 항상 원어민 관점으로 재검토.

2. **추상적 은유 영어 표현 피하기** — "the skeleton reads clearly through the body"처럼 동사를 비유적으로 쓰는 표현은 원어민도 어색하게 느낀다. "Joints stand out and shoulders feel broad"처럼 직관적 동사·형용사 선택.

3. **형용사 stacking 주의** — "angular and squared"처럼 형용사 2개를 겹치면 중복·어색함. 의미가 명확한 한 단어("defined")로 줄이는 게 낫다.

4. **ko 괄호 참고 표기 지양** — `(참고용)` 처럼 괄호로 덧붙이는 패턴보다 `— 참고용으로 봐주세요` 처럼 문장 내 자연스럽게 녹이는 게 한국어에서 더 자연스럽다.

5. **"얇고 보드라우며"류 나열형 접속** — "A이고 B이며" 패턴이 문어체처럼 들릴 수 있음. "A이고, B"나 "A한 느낌이고" 형태로 구어체에 가깝게.

**Why:** 매거진은 일반 유저 대상 콘텐츠라 둥글고 자연스러운 어투가 핵심. 직역체나 업계 용어가 섞이면 앱 전반 톤에서 튄다.

6. **confidence 라벨 — 패션 "reading" 은유 일관성** — "Quick/Clear/Strong read" 조합은 en-US에서 직관적이지 않음. "Preliminary reading / Clear reading / Strong reading"이 확정 패턴. ko는 "1차 리딩 / 또렷한 리딩 / 강한 리딩"으로 통일.

7. **loading stayHint — quota 언급 시 위협적 어감 주의** — "your daily quota still counts" 같은 표현은 기술적·부담감을 줌. "today's reading still counts"처럼 사용자 행동 결과를 자연스럽게 설명하는 방향으로.

8. **error.imageRefused — "clearer" 대신 "different"** — "try a clearer photo"는 사용자 사진을 탓하는 어감. "try a different one"이 더 중립적·친절하다.

9. **미사용 키 제거 원칙** — `result.subtitle`처럼 UI에서 제거된 키는 양 locale에서 동시 제거. `articleCta.label`처럼 articles.ts가 직접 소유하는 데이터는 사전에 두지 않는다.

**Why:** 매거진은 일반 유저 대상 콘텐츠라 둥글고 자연스러운 어투가 핵심. 직역체나 업계 용어가 섞이면 앱 전반 톤에서 튄다.

**How to apply:** articles.ts처럼 en 콘텐츠를 직접 쓸 때 "한국어로 먼저 구상 후 직역"한 흔적이 있는지 이중 확인. 특히 한국 패션/뷰티 전문어는 en 대응어가 다를 수 있으므로 반드시 en 원어민 관용 표현으로 재작성.
