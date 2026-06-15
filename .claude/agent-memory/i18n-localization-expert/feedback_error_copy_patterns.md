---
name: Error message copy — avoid internal tech terms
description: 사용자에게 노출되는 에러 메시지에서 API/서버 내부 용어를 쓰는 반복 패턴 — 2026-06-16 en.ts audit에서 도출
type: feedback
---

`magazine.diagnose.error` 섹션에서 발견된 패턴. 사용자 에러 메시지에 기술 내부 용어가 그대로 노출됨.

**확정 P1 오류 사례 (2026-06-16 patch 제안 반영):**
- `openaiFailed`: `"The reading service didn't respond."` → `"The reading didn't come through."` — "service"는 내부 용어.
- `unauthenticated`: `"We couldn't open a session."` → `"Something went wrong on our end."` — "session"은 기술 용어.
- `openaiUnreachable`: `'Network looks unstable.'` → `'Your connection seems a bit unstable.'` — "Network looks"는 어색한 주어+동사, "Your connection seems"로 자연화.
- `noBodyDetected`: `"We couldn't find a clear body in this photo."` → `"We couldn't pick up a full body in this photo."` — "clear body"가 오독 가능 (투명한 몸체?). "pick up"으로 인식 동작 명확화.

**Why:** 사용자는 서버/API 내부 동작을 모른다. 기술 용어가 에러 메시지에 노출되면 사용자가 혼란을 느끼고 앱 신뢰도가 낮아진다.

**How to apply:** 에러 메시지 작성 시 항상 사용자 행동 결과를 기준으로 서술. "Something went wrong on our end" / "Please try again" 패턴 기본 사용. 기술 용어(session, service, API, endpoint, config)가 포함된 에러 문자열은 즉시 재작성.
