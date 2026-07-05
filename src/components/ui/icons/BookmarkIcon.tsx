interface BookmarkIconProps {
  filled: boolean;
  className?: string;
}

export function BookmarkIcon({ filled, className }: BookmarkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5v16.2a.5.5 0 0 1-.77.42L12 17.7l-5.23 3.42A.5.5 0 0 1 6 20.7V4.5Z" />
    </svg>
  );
}
