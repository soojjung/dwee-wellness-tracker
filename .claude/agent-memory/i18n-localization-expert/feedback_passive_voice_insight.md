---
name: Insight copy — avoid passive voice and medical-record tone
description: insight 도메인에서 수동태·의료 일지 어투가 반복되는 패턴 — 2026-06-16 en.ts audit에서 도출
type: feedback
---

`insight.painPattern`과 `insight.moodTrend`에서 수동태 + 의료 기록 어투 발견.

**확정 P1 오류 사례:**
- `'Pain was logged on '` → 수동태, 의료 기록 어투. `'You logged pain on '` 으로 교체.
- `'Low mood appeared on '` → 증상 출현 어투. `'You logged a lower mood on '` 으로 교체.
- `insight.cyclePhase.body.luteal`: `'mild fatigue can show up'` → "can"이 단정에 가까움. `'may show up'` 으로 교체.

**Why:** dwee 톤 규칙은 사용자를 주어로 세우고, 추정형 어미를 사용한다. 수동태는 앱이 사용자를 "관찰 대상"으로 보는 의료 기록 느낌을 준다. 2인칭 능동태("you logged")가 공감적이고 사용자 주도적으로 읽힌다.

**How to apply:** insight 카피에서 "X was logged", "X appeared", "X occurred" 패턴이 보이면 "You logged X" 또는 "X may show up" 패턴으로 전환. 수치 관련 문장에는 반드시 "may", "tends to", "for reference only" 중 하나 동반.
