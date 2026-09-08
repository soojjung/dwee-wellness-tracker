---
name: project-home-foods-figma-swap
description: home.foods 사전을 카테고리형 4개 항목에서 Figma 확정 구체 식품명 5개(주기당)로 전면 교체한 작업 기록
metadata:
  type: project
---

**2026-09-08**: `home.foods` (`src/i18n/locales/en.ts`, `ko.ts`)의 4개 주기(menstrual/follicular/ovulation/luteal) 항목을 카테고리형 표현("따뜻한 영양국", "철분이 풍부한 채소" 등, 주기당 4개)에서 Figma 확정 구체 식품명(주기당 5개)으로 전면 교체.

- menstrual: beef-m, oyster-m, pumpkin-m, seaweed-m, dark-choco-m (소고기/굴/호박/해조류/다크초콜릿)
- follicular: walnut-f, tomato-f, tofu-f, broccoli-f, spinach-f (호두/토마토/두부/브로콜리/시금치)
- ovulation: blueberry-o, almond-o, olive-oil-o, mackerel-o, kale-o (블루베리/아몬드/올리브유/고등어/케일)
- luteal: sweet-potato-l, herbal-tea-l, salmon-l, avocado-l, banana-l (고구마/허브티/연어/아보카도/바나나)
- `unknown` phase(4개, cooked-warm-u 등)는 Figma 시안 대상이 아니라서 미변경.
- id 컨벤션: kebab-case + 주기 이니셜 suffix(m/f/o/l). 기존 id(`avocado-o`, `sweet-potato-l`, `fiber-banana-l`, `dark-choco-l` 등)는 이번 교체로 전부 폐기되고 재배치됨(예: avocado 는 luteal 로, dark chocolate 는 menstrual 로 이동) — 과거 id 를 참조하는 코드/테스트/스냅샷이 있으면 깨질 수 있음.

**Why:** Figma 확정본이 카테고리 대신 실제 식재료 이미지를 각 주기 사진에 배치하는 방식으로 바뀜. 이미지-라벨 1:1 매핑을 위해 구체 식품명이 필요했음.

**How to apply:** 다음에 이 섹션을 다시 건드릴 일이 있으면 위 id 목록이 현재 소스이며, `git log`/`en.ts`/`ko.ts` 로 최신 상태 재확인. `src/components/app/FoodSuggestions.tsx` 는 `t.home.foods[phase].items.slice(0, 4)` 로 **4개까지만 렌더**하고 있어(이번 작업 시점 기준), 5번째 항목이 화면에 보이려면 컴포넌트 쪽 slice 값과 `FOOD_POSITIONS`/`LABEL_POSITIONS` 배열(현재 4칸)도 5칸으로 늘어나야 함 — 이건 사용자가 별도로 작업 중이라고 밝힌 범위라 이번 작업에서는 건드리지 않음. 또한 `src/data/homeImagery` 의 `foodVisual(id)` 매핑도 새 20개 id 에 맞춰 갱신이 필요함 (이모지/비주얼 매핑, 사용자 작업 범위).
