'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { queueAppToast } from '@/lib/appToast';
import { Toast } from '@/components/ui/Toast';
import { submitWithdrawalFeedback } from '@/data/services/withdrawalFeedbackService';
import { BackIcon } from '@/components/ui/icons';

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
    // Fixed viewport height with the scrolling confined to the middle
    // column, so the reason list stops above the CTA rail instead of
    // running underneath it.
    <div className="relative flex h-dvh flex-col overflow-hidden bg-brand-white">
      {/* 뒤로가기 버튼만 본문 위에 띄운다 (FoodArticleScreen 과 같은 패턴). 상단 바에
          배경을 깔지 않아 스크롤할 때 본문이 버튼 아래로 그대로 지나간다 — 바 전체가
          흰 띠로 남아 보이던 것이 피드백. */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center px-4 pt-[calc(0.5rem+env(safe-area-inset-top,0px))]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t.myPage.withdraw.backAriaLabel}
          // Figma 262:3532 — 40px 원형 배경. 본문이 비쳐 보이도록 Gray/400 50% + blur.
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900"
        >
          <BackIcon className="size-10" />
        </button>
      </header>

      {/* 상단 여백 72 = 버튼 위 8 + 버튼 40 + 제목까지 24 (Figma 262:3527). 버튼이
          떠 있어도 첫 화면에서 제목이 가려지지 않는다. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-[calc(72px+env(safe-area-inset-top,0px))]">
        <h1 className="text-xl font-semibold leading-normal text-brand-gray900">
          {t.myPage.withdraw.title}
        </h1>
        <p className="mt-1 text-xs text-brand-gray600">{t.myPage.withdraw.subtitle}</p>

        {/* 행 간격 24 (Figma) = 텍스트 위아래 4px 탭 여백 + space-y-4. */}
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
                  className="flex w-full items-center justify-between gap-3 py-1 text-left text-base leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink300"
                >
                  <span className="flex-1">{t.myPage.withdraw.reasons[key]}</span>
                  <CheckCircle checked={isSelected} />
                </button>
                {key === 'other' && otherPicked ? (
                  <div
                    className={
                      'mt-2 rounded-2xl border bg-brand-white px-4 py-3 transition-colors ' +
                      (otherText.length === 0 ? 'border-brand-pink300' : 'border-brand-gray300')
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

      {/* 하단 CTA 바 — Figma 262:3524 (비활성: Gray/400 위 Gray/200 글자) /
          262:3610 (활성: Gray/900 위 Pink/100 글자). ShareTestBar 와 같은 "바 전체가
          버튼" 형태라 패딩 20 / 32(+safe-area) 을 바에 직접 준다. flex 형제라 스크롤
          영역이 정확히 그 위에서 끝난다. */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={
          'flex w-full shrink-0 items-center justify-center px-4 pt-5 text-xl font-semibold leading-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink100 ' +
          (canSubmit
            ? 'bg-brand-gray900 text-brand-pink100'
            : 'bg-brand-gray400 text-brand-gray200')
        }
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {submitting ? t.myPage.withdraw.busy : t.myPage.withdraw.cta}
      </button>

      {overLimitToast ? <Toast message={overLimitToast} variant="topConfirm" /> : null}
    </div>
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
