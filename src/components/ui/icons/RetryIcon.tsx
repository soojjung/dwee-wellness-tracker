interface RetryIconProps {
  className?: string;
}

/** Figma 328:4497 (Component 10) 의 화살표 벡터. 원 배경은 버튼이 그린다. */
export function RetryIcon({ className }: RetryIconProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M12.1112 20.7136C12.1112 22.2956 12.5803 23.2412 13.4594 24.5566C14.3384 25.872 15.5879 26.8972 17.0497 27.5026C18.5115 28.108 20.12 28.2664 21.6719 27.9578C23.2237 27.6492 24.6492 26.8874 25.768 25.7687C26.8868 24.65 27.6488 23.2248 27.9574 21.6732C28.2661 20.1216 28.1077 18.5133 27.5022 17.0517C26.8967 15.5901 25.8713 14.3409 24.5557 13.4619C23.2401 12.583 22.2598 12.1678 20.1112 12.1139C17.9625 12.06 16.1928 12.9042 12.5359 16.0311" />
      <path d="M12.6551 12.3703L12.3693 16.7523L16.7513 17.0382" />
    </svg>
  );
}
