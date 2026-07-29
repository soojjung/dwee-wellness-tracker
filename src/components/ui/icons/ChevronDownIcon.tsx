interface ChevronDownIconProps {
  className?: string;
}

export function ChevronDownIcon({ className = 'h-3 w-3' }: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 12 8"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
