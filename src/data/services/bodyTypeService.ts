'use client';
import { supabase } from '@/data/adapters/supabase/client';
import type {
  BodyTypeAnalyzeError,
  BodyTypeReport,
  Locale,
  ShotType,
  SupportedImageMediaType,
} from '@/types';

interface AnalyzeInput {
  imageBase64: string;
  imageMediaType: SupportedImageMediaType;
  shotType: ShotType;
  locale: Locale;
}

export interface AnalyzeSuccess {
  report: BodyTypeReport;
  remaining: number;
}

export type AnalyzeResult =
  | { ok: true; data: AnalyzeSuccess }
  | { ok: false; error: BodyTypeAnalyzeError };

async function ensureAnonSession(): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) return;
  const signIn = await supabase.auth.signInAnonymously();
  if (signIn.error) {
    console.error('[bodyTypeService] anon sign-in failed', signIn.error);
    throw new Error('anon_signin_failed');
  }
}

interface InvokeErrorContext {
  json: () => Promise<unknown>;
}

async function extractFunctionError(err: unknown): Promise<BodyTypeAnalyzeError> {
  const ctx = (err as { context?: InvokeErrorContext } | null)?.context;
  if (!ctx) return 'unknown';
  try {
    const body = (await ctx.json()) as { error?: BodyTypeAnalyzeError };
    return body?.error ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

interface EdgeResponse {
  ok: boolean;
  data?: AnalyzeSuccess;
  error?: BodyTypeAnalyzeError;
}

export async function analyzeBodyType(input: AnalyzeInput): Promise<AnalyzeResult> {
  try {
    await ensureAnonSession();
  } catch {
    return { ok: false, error: 'unauthenticated' };
  }

  const { data, error } = await supabase.functions.invoke<EdgeResponse>(
    'body-type-analyze',
    { body: input },
  );

  if (error) {
    console.error('[bodyTypeService] invoke error', error);
    return { ok: false, error: await extractFunctionError(error) };
  }
  if (!data || data.ok === false || !data.data) {
    console.error('[bodyTypeService] unexpected payload', data);
    return { ok: false, error: data?.error ?? 'unknown' };
  }
  return { ok: true, data: data.data };
}
