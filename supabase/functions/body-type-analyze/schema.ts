// JSON schema for OpenAI Structured Outputs (strict mode).
// Strict mode rejects validation keywords like `minimum`, `maximum`,
// `minItems`, `maxItems`, `pattern`, etc. — we express those size hints
// inside the system prompt instead.
//
// Every object lists all keys in `required` and sets
// `additionalProperties: false` (mandatory in strict mode).

const styleSectionSchema = {
  type: 'object',
  properties: {
    recommended: { type: 'array', items: { type: 'string' } },
    avoid: { type: 'array', items: { type: 'string' } },
    reason: { type: 'string' },
  },
  required: ['recommended', 'avoid', 'reason'],
  additionalProperties: false,
} as const;

export const BODY_TYPE_REPORT_SCHEMA = {
  type: 'object',
  properties: {
    analyzable: { type: 'boolean' },
    summary: {
      type: 'object',
      properties: {
        primaryType: { type: 'string', enum: ['straight', 'wave', 'natural'] },
        confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
        keyTraits: { type: 'array', items: { type: 'string' } },
        keywords: { type: 'array', items: { type: 'string' } },
      },
      required: ['primaryType', 'confidence', 'keyTraits', 'keywords'],
      additionalProperties: false,
    },

    frame: {
      type: 'object',
      properties: {
        shoulders: { type: 'string' },
        collarbones: { type: 'string' },
        waistPosition: { type: 'string' },
        hipPosition: { type: 'string' },
        boneVisibility: { type: 'string' },
        skinTexture: { type: 'string' },
        muscleTone: { type: 'string' },
        centerOfGravity: { type: 'string' },
      },
      required: [
        'shoulders',
        'collarbones',
        'waistPosition',
        'hipPosition',
        'boneVisibility',
        'skinTexture',
        'muscleTone',
        'centerOfGravity',
      ],
      additionalProperties: false,
    },

    proportions: {
      type: 'object',
      properties: {
        upperBody: { type: 'string' },
        lowerBody: { type: 'string' },
        waistLine: { type: 'string' },
        hipLine: { type: 'string' },
        overall: { type: 'string' },
      },
      required: ['upperBody', 'lowerBody', 'waistLine', 'hipLine', 'overall'],
      additionalProperties: false,
    },

    styleGuide: {
      type: 'object',
      properties: {
        tops: styleSectionSchema,
        bottoms: styleSectionSchema,
        dresses: styleSectionSchema,
        outerwear: styleSectionSchema,
      },
      required: ['tops', 'bottoms', 'dresses', 'outerwear'],
      additionalProperties: false,
    },

    fitCriteria: {
      type: 'object',
      properties: {
        good: { type: 'array', items: { type: 'string' } },
        bad: { type: 'array', items: { type: 'string' } },
        reason: { type: 'string' },
      },
      required: ['good', 'bad', 'reason'],
      additionalProperties: false,
    },

    details: {
      type: 'object',
      properties: {
        neckline: { type: 'string' },
        sleeves: { type: 'string' },
        waistDetail: { type: 'string' },
        length: { type: 'string' },
      },
      required: ['neckline', 'sleeves', 'waistDetail', 'length'],
      additionalProperties: false,
    },

    materials: {
      type: 'object',
      properties: {
        recommended: { type: 'array', items: { type: 'string' } },
        avoid: { type: 'array', items: { type: 'string' } },
        reason: { type: 'string' },
      },
      required: ['recommended', 'avoid', 'reason'],
      additionalProperties: false,
    },

    disclaimer: { type: 'string' },
  },
  required: [
    'analyzable',
    'summary',
    'frame',
    'proportions',
    'styleGuide',
    'fitCriteria',
    'details',
    'materials',
    'disclaimer',
  ],
  additionalProperties: false,
} as const;
