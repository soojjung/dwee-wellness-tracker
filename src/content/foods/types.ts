// 음식 콘텐츠의 언어 공통 형태. 사전(articles-ko / articles-en)이 이 형태를 따른다.

export interface FoodArticleSection {
  readonly heading: string;
  readonly body: string;
}

export interface FoodArticleTip {
  readonly emoji: string;
  readonly title: string;
  readonly body: string;
}

export interface FoodArticle {
  /** 히어로 사진 위에 얹는 한 줄 헤드라인. 시안에선 사진에 구워져 있던 문구. */
  readonly headline: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly FoodArticleSection[];
  readonly tipTitle: string;
  readonly tips: readonly FoodArticleTip[];
  /** 시안의 마무리는 한 문단일 때도, 두 문단일 때도 있다. */
  readonly closing: readonly string[];
}
