'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { queueAppToast } from '@/lib/appToast';
import { Toast } from '@/components/ui/Toast';
import { submitWithdrawalFeedback } from '@/data/services/withdrawalFeedbackService';

const MAX_OTHER_LEN = 100;

type ReasonKey =
  | 'noLongerNeeded'
  | 'missingFeatures'
  | 'hardToUse'
  | 'frequentErrors'
  | 'usingOther'
  | 'noPeriodNeeded'
  | 'healthFeaturesLacking'
  | 'predictionMismatch'
  | 'privacyConcern'
  | 'other';

const REASON_ORDER: readonly ReasonKey[] = [
  'noLongerNeeded',
  'missingFeatures',
  'hardToUse',
  'frequentErrors',
  'usingOther',
  'noPeriodNeeded',
  'healthFeaturesLacking',
  'predictionMismatch',
  'privacyConcern',
  'other',
] as const;

/**
 * 015_10~14 회원탈퇴 이유 수집 화면. Full-screen (bottom nav hidden via
 * the `(fullscreen)` route group). Multi-select checkboxes + optional
 * free-form text when the user picks "기타". Confirming here triggers
 * the actual `deleteAccount` call, queues the completion toast, and
 * hard-navigates to `/login` (015_16 style).
 */
export function WithdrawReasonScreen() {
  const t = useT();
  const router = useRouter();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const [selected, setSelected] = useState<Set<ReasonKey>>(new Set());
  const [otherText, setOtherText] = useState('');
  const [overLimitToast, setOverLimitToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const overLimitTimerRef = useRef<number | null>(null);

  const otherPicked = selected.has('other');

  // At least one reason must be selected. Text on "기타" is optional
  // per spec 7 (input field appears, no requirement) but the wording
  // "기타 입력 필드에 텍스트가 입력되는 순간 [탈퇴하기] 버튼 활성화"
  // in spec 11 is redundant with "1개 이상 선택 시 활성화" (spec 6) —
  // picking 기타 already counts as one selection.
  const canSubmit = !submitting && selected.size > 0;

  useEffect(() => {
    return () => {
      if (overLimitTimerRef.current !== null) {
        window.clearTimeout(overLimitTimerRef.current);
      }
    };
  }, []);

  function toggleReason(key: ReasonKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      // Deselecting 기타 clears the text so a later re-select starts fresh.
      if (key === 'other' && !next.has('other')) setOtherText('');
      return next;
    });
  }

  function handleOtherChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    if (value.length > MAX_OTHER_LEN) {
      // Spec 8: browser input is capped by `maxLength` on the textarea,
      // but Korean IME can still push past the cap on some devices.
      // Show a toast either way and truncate to be safe.
      showOverLimit();
      setOtherText(value.slice(0, MAX_OTHER_LEN));
      return;
    }
    setOtherText(value);
  }

  function showOverLimit() {
    setOverLimitToast(t.myPage.withdraw.overLimitToast);
    if (overLimitTimerRef.current !== null) {
      window.clearTimeout(overLimitTimerRef.current);
    }
    overLimitTimerRef.current = window.setTimeout(() => {
      setOverLimitToast(null);
      overLimitTimerRef.current = null;
    }, 2600);
  }

  function handleOtherKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Spec 9: Enter dismisses the software keyboard (mobile) by blurring
    // the textarea. On desktop, Shift+Enter still inserts a newline.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      (e.currentTarget as HTMLTextAreaElement).blur();
    }
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Submit the anonymous feedback BEFORE the delete call: once the
      // auth user is gone the client loses the JWT the RLS policy needs.
      // Fire-and-forget on failure — a dropped insert must not block the
      // user's actual delete request (they explicitly asked to leave).
      await submitWithdrawalFeedback({
        reasons: Array.from(selected),
        otherText: otherPicked ? otherText : null,
      });
      const result = await deleteAccount();
      if (!result.ok) {
        setSubmitting(false);
        return;
      }
      queueAppToast(t.myPage.withdrawDoneToast);
      // Client-side push (NOT `window.location.assign`) so the module-
      // scoped toast queue in `lib/appToast.ts` survives — a hard reload
      // would wipe `pending` before LoginScreen can consume it, and the
      // completion banner never fires. `deleteAccount()` already ran
      // `resetAllUserData` + `applyRepoMode('local')`, so no extra state
      // teardown is needed here.
      router.push('/login');
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-brand-white">
      <header className="flex items-center px-4 pb-2 pt-safe">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t.myPage.withdraw.backAriaLabel}
          className="flex h-10 w-10 items-center justify-center rounded-full text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <BackIcon />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-40">
        <h1 className="text-xl font-semibold leading-normal text-brand-gray900">
          {t.myPage.withdraw.title}
        </h1>
        <p className="mt-1 text-xs text-brand-gray600">
          {t.myPage.withdraw.subtitle}
        </p>

        <ul className="mt-6 space-y-4">
          {REASON_ORDER.map((key) => {
            const isSelected = selected.has(key);
            return (
              <li key={key}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={() => toggleReason(key)}
                  className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300"
                >
                  <span className="flex-1">
                    {t.myPage.withdraw.reasons[key]}
                  </span>
                  <CheckCircle checked={isSelected} />
                </button>
                {key === 'other' && otherPicked ? (
                  <div
                    className={
                      'mt-2 rounded-2xl border bg-brand-white px-4 py-3 transition-colors ' +
                      (otherText.length === 0
                        ? 'border-brand-pink300'
                        : 'border-brand-gray300')
                    }
                  >
                    <textarea
                      value={otherText}
                      onChange={handleOtherChange}
                      onKeyDown={handleOtherKeyDown}
                      maxLength={MAX_OTHER_LEN}
                      autoFocus
                      rows={4}
                      placeholder={t.myPage.withdraw.otherPlaceholder}
                      className="block h-24 w-full resize-none bg-transparent text-sm text-brand-gray900 placeholder:text-brand-gray400 focus-visible:outline-none"
                    />
                    <div className="mt-1 text-right text-[11px] text-brand-gray600">
                      {otherText.length}/{MAX_OTHER_LEN}
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Fixed footer — pin to the bottom of the mobile shell (max-w-md,
          centered) rather than the raw viewport so desktop preview
          widths don't stretch the button rail edge-to-edge. */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-brand-gray200 bg-brand-white px-4 pb-safe pt-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={
            'block w-full rounded-2xl py-4 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 ' +
            (canSubmit
              ? 'bg-brand-gray900 text-brand-white'
              : 'bg-brand-gray200 text-brand-gray600')
          }
        >
          {submitting ? t.myPage.withdraw.busy : t.myPage.withdraw.cta}
        </button>
      </div>

      {overLimitToast ? (
        <Toast message={overLimitToast} variant="topConfirm" />
      ) : null}
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

interface CheckCircleProps {
  checked: boolean;
}

function CheckCircle({ checked }: CheckCircleProps) {
  return (
    <span
      aria-hidden
      className={
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ' +
        (checked
          ? 'border-brand-gray900 bg-brand-gray900 text-brand-white'
          : 'border-brand-gray400 bg-brand-white text-transparent')
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  );
}
