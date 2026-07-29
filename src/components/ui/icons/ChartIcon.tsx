interface ChartIconProps {
  className?: string;
}

export function ChartIcon({ className = 'h-6 w-6' }: ChartIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <rect x="6" y="6" width="4" height="12" rx="1" />
      <rect x="14" y="9" width="4" height="9" rx="1" />
    </svg>
  );
}
