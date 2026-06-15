---
name: Single-word keyword direct translation pitfalls
description: home.keywords 섹션에서 한국어 단어를 영어 단독 단어로 직역하면 부자연스러운 패턴 — P0 오류 사례 포함
type: feedback
---

`home.keywords`는 `{ subtitle: 'Instead of X', main: '키워드 한 단어' }` 구조. 영어에서 단독 단어 키워드는 동사 원형이나 관용구(phrasal verb) 형태가 자연스럽다.

**확정 P0 오류:**
- `'Inside'` (한국어 "안에서" 직역) → `'Stay in'` 또는 `'Cozy up'`
- `'Empty'` (한국어 "비워두기" 직역) → `'Let it be'` 또는 `'Clear space'`

**확정 P1 오류:**
- `'Slow'` (형용사 단독) → `'Slow down'` (동사구)
- `'Steady'` (luteal 3번째, "유지" 직역) → `'Hold steady'` 또는 `'Maintain'`

**Why:** 한국어는 "명사형 명령"이 자연스럽지만 ("비워두기", "느리게") 영어 키워드는 동사 원형이나 phrasal verb가 훨씬 자연스럽다. 이 패턴은 ko를 먼저 구상한 뒤 단어 단위로 직역한 흔적.

**How to apply:** `home.keywords`에 새 키워드를 추가할 때 en 단독 단어가 동사 원형 또는 자연스러운 영어 관용구인지 먼저 확인. 명사/형용사 단독 사용 시 en-US 원어민 관점에서 이중 점검.
