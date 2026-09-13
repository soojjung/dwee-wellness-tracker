---
name: feedback-styleguide-body-neutral-reasons
description: 체형 스타일 가이드(straight/wave/natural) 콘텐츠에서 "몸이 커/부해 보여요" 류 카피를 en으로 옮길 때 쓴 body-neutral 어휘 전략
metadata:
  type: feedback
---

`src/data/bodyType/styleGuide/{straight,wave,natural}.ts` 작성(2026-09-14) 때 확립한 패턴.

Figma ko 원문에는 "몸이 크고 둔해 보일 수 있어요", "골격이 강조돼 보여요", "체형이 답답해 보여요"처럼
스타일링 결과를 몸 자체에 대한 판단처럼 표현하는 문장이 많다. ko는 Figma 확정 카피라 그대로 옮기지만
(오타만 교정), en으로 쓸 때는 [[health-copy]] 톤(의료 단정·다이어트 유도·"살 빠져 보여요"류 금지)에
맞춰 주어를 "the garment/silhouette"나 "your frame(체형/골격을 가리키는 중립어)"으로 바꿔서 몸이 아닌
옷의 실루엣 효과를 설명하는 문장으로 재구성했다.

- "몸이 크고 둔해 보일 수 있어요" → "These can add bulk and make the silhouette feel heavier." (주어=옷)
- "골격이 강조돼 보여요" → "These can put more emphasis on the shoulders and frame." ("frame"을 골격의 중립 번역어로 채택)
- "체형이 답답해 보여요" → "These can feel tight and boxed-in on your frame."
- "세련되고 날씬해 보여요" → "This gives a sleek, streamlined look." ("날씬" 직역인 slim 대신 streamlined 사용)

**Why:** health-copy.md의 "다이어트 유도 금지"는 생리주기 도메인 카피 규칙이지만, 매거진/체형 진단
콘텐츠에도 같은 정신(몸에 대한 판단·평가 금지)이 적용되어야 한다는 게 이번 작업의 판단. "slimming",
"flattering your flaws", "weight/bulk on your body" 같은 표현은 피하고 옷·실루엣 중심 서술로 전환.

**How to apply:** 다음에 체형/스타일 콘텐츠를 영어로 옮길 때 "몸이 [형용사]해 보여요" 패턴을 만나면
주어를 옷/실루엣으로 바꾸고, "골격"은 "frame"으로, "체형"은 "your frame/shape"으로 일관되게 옮긴다.
"slim", "flattering" 같은 몸 평가성 형용사는 피하고 "streamlined", "polished", "balanced" 같은
스타일링 결과 형용사를 쓴다.
