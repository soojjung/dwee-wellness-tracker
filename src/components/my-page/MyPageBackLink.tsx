'use client';
import Link from 'next/link';
import { useHistoryBackClick } from '@/hooks/useHistoryBackClick';
import { BackIcon } from '@/components/ui/icons';

interface MyPageBackLinkProps {
  ariaLabel: string;
  /** 돌아갈 기록이 없을 때의 목적지. */
  href?: string;
}

/** 마이페이지 하위 화면의 뒤로가기 버튼. 동작은 `useHistoryBackClick` 참고. */
export function MyPageBackLink({ ariaLabel, href = '/settings' }: MyPageBackLinkProps) {
  const handleClick = useHistoryBackClick();

  return (
    <Link
      href={href}
      data-swipe-back
      onClick={handleClick}
      aria-label={ariaLabel}
      // Same 40px circle + BackIcon as FoodArticleScreen / magazine headers.
      className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
    >
      <BackIcon className="size-10" />
    </Link>
  );
}
