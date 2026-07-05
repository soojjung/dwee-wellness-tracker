interface BackIconProps {
  className?: string;
}

export function BackIcon({ className }: BackIconProps) {
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
      <path d="M22 27L15 20L22 13" />
    </svg>
  );
}
