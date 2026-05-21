export type Confidence = 'low' | 'medium' | 'high' | 'unknown';

export type InsightPhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';

export type Insight =
  | { id: string; kind: 'data_needed'; confidence: Confidence }
  | { id: string; kind: 'cycle_regularity'; confidence: Confidence; averageDays: number }
  | { id: string; kind: 'cycle_phase'; confidence: Confidence; phase: InsightPhase }
  | { id: string; kind: 'pain_pattern'; confidence: Confidence; count: number }
  | { id: string; kind: 'mood_trend'; confidence: Confidence; count: number };

export type InsightKind = Insight['kind'];
