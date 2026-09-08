# splitBody — Unit test cases

Last run: 2026-09-08 — 14/14 passed

| # | 설명 (`it` title) | 입력 | 기대 결과 | 결과 |
|---|---|---|---|---|
| 1 | returns the whole trimmed body as lead when no bullet pattern is found | `"평범한 문단입니다. 콜론이 전혀 없어요."` | `lead=전체`, `bullets=[]` | ✅ |
| 2 | splits a lead sentence and a single bullet | `"오늘은 컨디션이 좋아요. 수분 섭취: 물을 많이 마시면 좋아요."` | `lead='오늘은 컨디션이 좋아요.'`, `bullets=[{label:'수분 섭취', text:'물을 많이 마시면 좋아요.'}]` | ✅ |
| 3 | splits a lead sentence and two bullets (real article body shape) | `articles-ko.ts` 스타일 철분 본문 (도입 1문장 + 2불릿, 각 불릿 2문장) | `lead`=도입 문장, `bullets`=`[{label:'흡수율 높은 철분', ...}, {label:'산소를 온몸에 전달', ...}]` | ✅ |
| 4 | splits three or more bullets in order | `"첫 문장이에요. 라벨 하나: 텍스트 하나. 라벨 둘: 텍스트 둘. 라벨 셋: 텍스트 셋."` | `lead='첫 문장이에요.'`, 불릿 3개 순서대로 | ✅ |
| 5 | returns an empty lead when the body starts directly with a bullet | `"라벨: 설명입니다. 다음 라벨: 설명2입니다."` (`^` 분기) | `lead=''`, `bullets=[{label:'라벨',...}, {label:'다음 라벨',...}]` | ✅ |
| 6 | does not treat a colon without a following space as a bullet start | `"약을 먹을 때는 오전 9:30에 드세요. 그리고 저녁에도 챙기세요."` | `lead=전체`, `bullets=[]` (`:` 뒤 공백 없음) | ✅ |
| 7 | does not treat a label containing a period as a bullet start | `"문장이 끝났다. 라벨.끝: 설명이어요."` | `lead=전체`, `bullets=[]` (라벨에 `.` 포함) | ✅ |
| 8 | does not match a 1-character label (below the minimum length) | `"A: 이것은 라벨이 아니에요."` | `lead=전체`, `bullets=[]` | ✅ |
| 9 | matches a 2-character label (minimum length boundary) | `"AB: 설명입니다."` | `lead=''`, `bullets=[{label:'AB', text:'설명입니다.'}]` | ✅ |
| 10 | matches a 24-character label (maximum length boundary) | `"A".repeat(24) + ": 설명입니다."` | `lead=''`, `bullets=[{label:'A'.repeat(24), text:'설명입니다.'}]` | ✅ |
| 11 | does not match a 25-character label (over the maximum length) | `"A".repeat(25) + ": 설명입니다."` | `lead=전체`, `bullets=[]` | ✅ |
| 12 | returns empty lead and no bullets for an empty string | `""` | `lead=''`, `bullets=[]` | ✅ |
| 13 | trims leading and trailing whitespace from the lead | `"  단순한 문장입니다.  "` | `lead='단순한 문장입니다.'`, `bullets=[]` | ✅ |
| 14 | returns the same result when called twice with the same input (lastIndex regression) | `"월경을 하면 피곤해요. 철분 섭취: 소고기가 좋아요. 산소 전달: 헤모글로빈에 필요해요."` — 동일 입력으로 2회 연속 호출 | 1차 호출 결과 == 2차 호출 결과 (모듈 스코프 `g` 정규식의 `lastIndex` 잔존 버그 방지) | ✅ |

- #3: 실제 `articles-ko.ts` 철분 관련 본문을 그대로 사용. 도입 문장 1개 + 불릿 2개, 각 불릿은 2문장으로 구성되어 "다음 불릿 시작 직전까지" 텍스트 범위 규칙도 함께 검증.
- #6, #7: "문장 중간의 콜론이 불릿으로 오인되지 않아야 함" 요구사항 커버 — 각각 "콜론 뒤 공백 없음", "라벨에 마침표 포함" 두 가지 다른 이유로 매치되지 않는 경우.
