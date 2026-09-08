---
name: feedback-header-title-tech-collision
description: Bare "log" paired with a noun (e.g. "Event & log") reads as the software term "event log" — avoid; match the section's own label vocabulary instead
type: feedback
---

`report.diary.eventSheet.title` 초안이 `'Event & log'` 였음. 이 시트는 다이어리 `+` 버튼이 열던 [생리 추가]/[일정 추가] 2-메뉴를 통합한 것으로, 일정 + 생리 토글 + 컨디션(선택) 을 한 바텀시트에서 처리.

**Why:** en-US 화자에게 "event & log" 는 wellness 맥락보다 "Event Log"(Windows Event Viewer 등 IT 시스템 로그)라는 강한 기술적 연상을 먼저 준다. 부드럽고 지지적인 wellness 톤(CLAUDE.md 톤 가이드)과 정반대의 차갑고 기술적인 인상을 줄 위험이 있는 false-friend 케이스. 또한 그 시트 안의 실제 섹션 라벨은 `conditionLabel: 'Condition (optional)'` 이지 "Log" 가 아니어서, 헤더 타이틀이 자기 자신의 하위 라벨과 어휘가 어긋나는 문제도 있었음.

**How to apply:** 헤더/타이틀에 "log" 를 단독 명사로 다른 명사와 붙여 쓸 때(`X & log`, `log & Y`) 마다 (1) 일반적인 기술 용어(이벤트 로그, 시스템 로그, 에러 로그 등)와 충돌하지 않는지 확인하고 (2) 그 화면 안에서 실제로 쓰이는 섹션 라벨 어휘(예: "Condition")를 타이틀에 그대로 반영해 상하위 어휘 일관성을 맞출 것. 최종 채택: en `'Event & condition'` / ko `'일정 및 기록'` (ko 의 '기록' 은 한국어에서 이런 충돌이 없어 그대로 유지 — 언어별로 자연스러운 결과가 다를 수 있으므로 en/ko 를 1:1 로 맞추려 하지 말 것).
