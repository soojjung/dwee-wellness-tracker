'use client';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { Toast } from '@/components/ui/Toast';
import type { PrimaryBodyType } from '@/types';

/**
 * 받는 사람이 보게 되는 건 테스트 자체지만, 링크 미리보기는 내 체형 카드를 띄운다.
 * 이 경로가 OG 만 얹고 아티클로 넘긴다 — 정적 내보내기라 쿼리스트링으로는 OG 가
 * 안 바뀌어서 타입마다 실제 경로가 필요하다.
 */
const sharePath = (type: PrimaryBodyType) => `/magazine/personal-body-type/share/${type}`;
const TOAST_MS = 2000;

interface ShareTestBarProps {
  type: PrimaryBodyType;
}

/**
 * 결과 화면 하단에 고정되는 공유 CTA.
 *
 * `navigator.share` 는 모바일 Safari/Chrome 에만 있고 데스크톱엔 대개 없다.
 * 없으면 링크를 클립보드에 넣고 토스트로 알린다 — QnaScreen 의 복사 폴백과 같은 방식.
 */
export function ShareTestBar({ type }: ShareTestBarProps) {
  const t = useT();
  const r = t.magazine.diagnose.result;
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // 구형 Safari / non-secure context — 숨긴 textarea 로 폴백.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(r.linkCopied);
  }

  async function handleShare() {
    const url = `${window.location.origin}${sharePath(type)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: r.shareTitle, text: r.shareMessage, url });
        return;
      } catch {
        // 사용자가 공유 시트를 닫은 것도 여기로 온다. 그 경우 복사까지 하면
        // 취소했는데 뭔가 일어난 셈이라 어색하므로 조용히 끝낸다.
        return;
      }
    }
    await copyLink(url);
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md bg-brand-gray900">
        <button
          type="button"
          onClick={handleShare}
          className="flex h-[76px] w-full items-center justify-center px-4 text-base font-medium leading-normal text-brand-pink100 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-pink100"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {r.shareTest}
        </button>
      </div>
      <Toast message={toast} variant="topConfirm" />
    </>
  );
}
