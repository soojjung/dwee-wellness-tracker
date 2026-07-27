interface DownloadIconProps {
  className?: string;
}

export function DownloadIcon({ className }: DownloadIconProps) {
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
      <path d="M20 13V25" />
      <path d="M15 20L20 25L25 20" />
      <path d="M13 28H27" />
    </svg>
  );
}
