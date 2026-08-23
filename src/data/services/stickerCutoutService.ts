'use client';
import { supabase } from '@/data/adapters/supabase/client';
import { fileToBase64 } from '@/lib/image/fileToBase64';
import { base64ToBlob } from '@/lib/cutout/base64ToBlob';
import type {
  StickerCutoutError,
  StickerCutoutSuccess,
  SupportedImageMediaType,
} from '@/types';

interface CutoutInput {
  blob: Blob;
  mediaType: SupportedImageMediaType;
  /** Cancels the in-flight request when the user backs out mid-scan. */
  signal?: AbortSignal;
}

export type CutoutResult =
  | { ok: true; data: StickerCutoutSuccess }
  | { ok: false; error: StickerCutoutError };

interface EdgeResponsePayload {
  pngBase64: string;
  remaining: number;
}

interface EdgeResponse {
  ok: boolean;
  data?: EdgeResponsePayload;
  error?: StickerCutoutError;
}

interface InvokeErrorContext {
  json: () => Promise<unknown>;
}

async function ensureAnonSession(): Promise<void> {
  const { data, error } = await supabase.auth.getUser();
  if (!error && data?.user) return;
  const signIn = await supabase.auth.signInAnonymously();
  if (signIn.error) {
    console.error('[stickerCutoutService] anon sign-in failed', signIn.error);
    throw new Error('anon_signin_failed');
  }
}

async function extractFunctionError(err: unknown): Promise<StickerCutoutError> {
  const ctx = (err as { context?: InvokeErrorContext } | null)?.context;
  if (!ctx) return 'unknown';
  try {
    const body = (await ctx.json()) as { error?: StickerCutoutError };
    return body?.error ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const name = (err as { name?: string }).name;
  if (name === 'AbortError') return true;
  const cause = (err as { cause?: unknown }).cause;
  if (
    cause &&
    typeof cause === 'object' &&
    (cause as { name?: string }).name === 'AbortError'
  ) {
    return true;
  }
  // supabase-js wraps the underlying fetch error in FunctionsFetchError and
  // stores it under `.context`, not `.cause`. React StrictMode's dev-only
  // double-mount aborts the first in-flight request; without this check the
  // benign abort surfaces as a "Failed to send a request" red toast even
  // though the second mount's request succeeded.
  const context = (err as { context?: unknown }).context;
  return (
    !!context &&
    typeof context === 'object' &&
    (context as { name?: string }).name === 'AbortError'
  );
}

export async function removeStickerBackground(input: CutoutInput): Promise<CutoutResult> {
  try {
    await ensureAnonSession();
  } catch {
    return { ok: false, error: 'unauthenticated' };
  }

  let imageBase64: string;
  try {
    imageBase64 = await fileToBase64(input.blob);
  } catch {
    return { ok: false, error: 'missing_image' };
  }

  const { data, error } = await supabase.functions.invoke<EdgeResponse>(
    'sticker-cutout',
    {
      body: { imageBase64, imageMediaType: input.mediaType },
      signal: input.signal,
    },
  );

  if (error) {
    if (isAbortError(error)) return { ok: false, error: 'aborted' };
    console.error('[stickerCutoutService] invoke error', error);
    return { ok: false, error: await extractFunctionError(error) };
  }
  if (!data || data.ok === false || !data.data) {
    console.error('[stickerCutoutService] unexpected payload', data);
    return { ok: false, error: data?.error ?? 'unknown' };
  }
  return {
    ok: true,
    data: {
      blob: base64ToBlob(data.data.pngBase64, 'image/png'),
      remaining: data.data.remaining,
    },
  };
}
