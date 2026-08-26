'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { Toast } from '@/components/ui/Toast';

const SUPPORT_EMAIL = 'sojjung3@gmail.com';
const TOAST_MS = 2000;

export function QnaScreen() {
  const t = useT();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
    } catch {
      // Older Safari / non-secure contexts — fall back to a hidden textarea.
      const ta = document.createElement('textarea');
      ta.value = SUPPORT_EMAIL;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(t.myPage.qna.copiedToast);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center px-4">
          <Link
            href="/settings"
            aria-label={t.myPage.qna.backAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
        </header>
        <main className="px-4">
          <section className="rounded-2xl bg-brand-white px-5 py-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]">
            <div className="flex flex-col items-center text-center">
              <span
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-pink50"
                aria-hidden
              >
                <MailIcon />
              </span>
              <h2 className="text-base font-semibold leading-tight text-brand-gray900">
                {t.myPage.qna.cardTitle}
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-[1.5] text-brand-gray700">
                {t.myPage.qna.cardDescription}
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-brand-gray100 px-4 py-3">
              <span className="truncate text-sm text-brand-gray900">{SUPPORT_EMAIL}</span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label={t.myPage.qna.copyAriaLabel}
                className="shrink-0 text-sm font-medium text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {t.myPage.qna.copyButton}
              </button>
            </div>
          </section>
        </main>
      </div>
      <Toast message={toast} variant="topConfirm" />
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
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-brand-pink300"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
