'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';

interface DiagnoseResultTopBarProps {
  articleHref: string;
  onRetry: () => void;
  /** 카드가 바 아래까지 올라온 상태. 어두운 히어로 대신 밝은 카드 위에 놓인다. */
  stuck?: boolean;
}

/**
 * 결과 화면 상단 고정 바 — 왼쪽 뒤로가기, 오른쪽 "다른 사진으로 다시하기".
 *
 * `fixed` 라 히어로가 스크롤로 밀려나도 두 동작에 계속 닿는다. 반투명 배경 +
 * blur 는 어두운 히어로와 흰 카드 본문 어느 쪽 위에서도 아이콘이 읽히게 한다.
 */
export function DiagnoseResultTopBar({
  articleHref,
  onRetry,
  stuck = false,
}: DiagnoseResultTopBarProps) {
  const t = useT();
  const r = t.magazine.diagnose.result;

  // 히어로 위에선 반투명 회색 원 + 밝은 아이콘, 카드 위에선 그 반대라야 읽힌다.
  const button = stuck
    ? 'bg-brand-gray200 text-brand-gray900'
    : 'bg-brand-gray400/50 text-brand-gray50 backdrop-blur-sm';

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex h-16 w-full max-w-md items-center justify-between px-4 pt-3 ${
        stuck ? 'bg-brand-gray50' : ''
      }`}
    >
      <Link
        href={articleHref}
        aria-label={t.magazine.diagnose.backToArticle}
        className={`pointer-events-auto grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400 ${button}`}
      >
        <BackIcon className="size-10" />
      </Link>
      <button
        type="button"
        onClick={onRetry}
        aria-label={r.tryAgain}
        className={`pointer-events-auto grid size-10 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400 ${button}`}
      >
        <RetryIcon />
      </button>
    </div>
  );
}

function RetryIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-5"
    >
      <path d="M14 8a6 6 0 0 1-10.24 4.24" />
      <path d="M2 8a6 6 0 0 1 10.24-4.24" />
      <path d="M11 5H14V2" />
      <path d="M5 11H2V14" />
    </svg>
  );
}
