export type BodyTypeConfidence = 'low' | 'medium' | 'high';

export type ShotType = 'full-body' | 'upper-body';

export type SupportedImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

export type PrimaryBodyType = 'straight' | 'wave' | 'natural';

/** 정적 스타일 가이드 — 유형별 고정 콘텐츠(Figma 522-8571 / 522-9391 / 522-10258). */
export interface StyleGuideGroup {
  readonly items: readonly string[];
  readonly reason: string;
}

export interface StyleGuideCategory {
  readonly good: readonly StyleGuideGroup[];
  readonly avoid: readonly StyleGuideGroup[];
}

export type StyleGuideCategoryKey =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'materials'
  | 'fit'
  | 'neckline'
  | 'sleeves'
  | 'length'
  | 'pattern'
  | 'decoration';

export type StyleGuideContent = Readonly<Record<StyleGuideCategoryKey, StyleGuideCategory>>;

export interface StyleSection {
  readonly recommended: readonly string[];
  readonly avoid: readonly string[];
  readonly reason: string;
}

export interface BodyTypeReport {
  readonly analyzable: boolean;
  readonly summary: {
    readonly primaryType: PrimaryBodyType;
    readonly confidence: BodyTypeConfidence;
    readonly keyTraits: readonly string[];
    readonly keywords: readonly string[];
  };
  readonly frame: {
    readonly shoulders: string;
    readonly collarbones: string;
    readonly waistPosition: string;
    readonly hipPosition: string;
    readonly boneVisibility: string;
    readonly skinTexture: string;
    readonly muscleTone: string;
    readonly centerOfGravity: string;
  };
  readonly proportions: {
    readonly upperBody: string;
    readonly lowerBody: string;
    readonly waistLine: string;
    readonly hipLine: string;
    readonly overall: string;
  };
  readonly styleGuide: {
    readonly tops: StyleSection;
    readonly bottoms: StyleSection;
    readonly dresses: StyleSection;
    readonly outerwear: StyleSection;
  };
  readonly fitCriteria: {
    readonly good: readonly string[];
    readonly bad: readonly string[];
    readonly reason: string;
  };
  readonly details: {
    readonly neckline: string;
    readonly sleeves: string;
    readonly waistDetail: string;
    readonly length: string;
  };
  readonly materials: {
    readonly recommended: readonly string[];
    readonly avoid: readonly string[];
    readonly reason: string;
  };
  readonly disclaimer: string;
}

export type BodyTypeAnalyzeError =
  | 'unauthenticated'
  | 'rate_limit_exceeded'
  | 'image_too_large'
  | 'invalid_media_type'
  | 'missing_image'
  | 'invalid_shot_type'
  | 'invalid_locale'
  | 'image_refused'
  | 'no_body_detected'
  | 'openai_failed'
  | 'openai_unreachable'
  | 'report_parse_failed'
  | 'aborted'
  | 'unknown';
