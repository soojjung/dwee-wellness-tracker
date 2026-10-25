'use client';
import { supabase } from '@/data/adapters/supabase/client';
import { fileToBase64 } from '@/lib/image/fileToBase64';
import { downscaleImage } from '@/lib/image/downscale';
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

// 누끼 결과는 trimTransparentMargins 가 다시 1280px 로 줄여 저장한다. 원본(수 MB)을 그대로
// 보내면 업로드·remove.bg 처리·결과 PNG 다운로드가 모두 커져 스캔이 오래 걸린다(R8-11).
const CUTOUT_INPUT_MAX_EDGE = 1500;

/** 보내기 전에 줄인다. PNG·WebP 는 투명 영역이 검게 변하지 않게 PNG 로 둔다. */
async function shrinkForCutout(
  blob: Blob,
  mediaType: SupportedImageMediaType,
): Promise<{ blob: Blob; mediaType: SupportedImageMediaType }> {
  const type = mediaType === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const shrunk = await downscaleImage(blob, CUTOUT_INPUT_MAX_EDGE, 0.9, type);
  return shrunk === blob ? { blob, mediaType } : { blob: shrunk, mediaType: type };
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

  const { blob, mediaType } = await shrinkForCutout(input.blob, input.mediaType);
  let imageBase64: string;
  try {
    imageBase64 = await fileToBase64(blob);
  } catch {
    return { ok: false, error: 'missing_image' };
  }

  const { data, error } = await supabase.functions.invoke<EdgeResponse>(
    'sticker-cutout',
    {
      body: { imageBase64, imageMediaType: mediaType },
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
