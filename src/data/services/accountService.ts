'use client';
import { supabase } from '@/data/adapters/supabase/client';

export type DeleteAccountError =
  | 'unauthenticated'
  | 'storage_cleanup_failed'
  | 'auth_delete_failed'
  | 'missing_config'
  | 'network'
  | 'unknown';

export type DeleteAccountResult = { ok: true } | { ok: false; error: DeleteAccountError };

interface EdgeResponse {
  ok: boolean;
  data?: { userId: string };
  error?: DeleteAccountError;
}

interface InvokeErrorContext {
  json: () => Promise<unknown>;
}

async function extractFunctionError(err: unknown): Promise<DeleteAccountError> {
  const ctx = (err as { context?: InvokeErrorContext } | null)?.context;
  if (!ctx) return 'network';
  try {
    const body = (await ctx.json()) as { error?: DeleteAccountError };
    return body?.error ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function deleteAccount(): Promise<DeleteAccountResult> {
  const { data, error } = await supabase.functions.invoke<EdgeResponse>('delete-account', {
    body: {},
  });

  if (error) {
    console.error('[accountService] invoke error', error);
    return { ok: false, error: await extractFunctionError(error) };
  }
  if (!data || data.ok === false) {
    console.error('[accountService] unexpected payload', data);
    return { ok: false, error: data?.error ?? 'unknown' };
  }
  return { ok: true };
}
