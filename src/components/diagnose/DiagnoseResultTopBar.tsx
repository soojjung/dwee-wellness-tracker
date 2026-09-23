'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { BackIcon, RetryIcon } from '@/components/ui/icons';

interface DiagnoseResultTopBarProps {
  articleHref: string;
  onRetry: () => void;
  /** 카드가 바 아래까지 올라온 상태. 어두운 히어로 대신 밝은 카드 위에 놓여 아이콘 색만 바뀐다. */
  stuck?: boolean;
}

/**
 * 결과 화면 상단 고정 바 — 왼쪽 뒤로가기, 오른쪽 "다른 사진으로 다시하기".
 *
 * `fixed` 라 히어로가 스크롤로 밀려나도 두 동작에 계속 닿는다. 바 자체는 배경이
 * 없고 버튼 두 개만 떠 있다 — 본문이 버튼 아래로 흘러 지나가는 게 시안이다. 반투명
 * 원 + blur 는 어두운 히어로와 밝은 카드 어느 쪽 위에서도 아이콘이 읽히게 한다.
 */
export function DiagnoseResultTopBar({
  articleHref,
  onRetry,
  stuck = false,
}: DiagnoseResultTopBarProps) {
  const t = useT();
  const r = t.magazine.diagnose.result;

  // 원은 늘 반투명 회색 + blur (FoodArticleScreen 과 같은 값). 아이콘만 히어로
  // 위에선 밝게, 카드 위에선 어둡게 바꿔 대비를 지킨다.
  const button = stuck
    ? 'bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[2px]'
    : 'bg-brand-gray400/50 text-brand-gray50 backdrop-blur-[2px]';

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex h-[calc(4rem+env(safe-area-inset-top,0px))] w-full max-w-md items-center justify-between px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
      <Link
        href={articleHref}
        data-swipe-back
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
        <RetryIcon className="size-10" />
      </button>
    </div>
  );
}
