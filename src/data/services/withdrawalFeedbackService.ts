'use client';
import { supabase } from '@/data/adapters/supabase/client';

export interface WithdrawalFeedbackPayload {
  reasons: readonly string[];
  otherText: string | null;
}

/**
 * Records a soon-to-be-deleted user's reasons for leaving. Anonymous
 * (no user_id in the row), INSERT-only from the client — see migration
 * `0011_withdrawal_feedbacks.sql`. Fire-and-forget: the caller runs
 * this right before `deleteAccount` and does NOT block deletion on an
 * insert failure. We surface a boolean so telemetry can flag drops.
 */
export async function submitWithdrawalFeedback(
  payload: WithdrawalFeedbackPayload,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (payload.reasons.length === 0) {
    return { ok: false, error: 'empty_reasons' };
  }
  const otherText = payload.otherText?.trim() || null;
  const { error } = await supabase.from('withdrawal_feedbacks').insert({
    reasons: payload.reasons,
    other_text: otherText,
  });
  if (error) {
    console.error('[withdrawalFeedbackService] insert failed', error);
    return { ok: false, error: error.code ?? 'unknown' };
  }
  return { ok: true };
}
