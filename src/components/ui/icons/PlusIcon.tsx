interface PlusIconProps {
  className?: string;
}

/** 일반 "추가" 글리프 (14px). 다이어리 헤더가 #57 이전에 쓰던 + 그대로다. */
export function PlusIcon({ className = 'size-3.5' }: PlusIconProps) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
