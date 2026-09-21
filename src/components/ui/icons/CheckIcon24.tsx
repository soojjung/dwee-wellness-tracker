interface CheckIcon24Props {
  className?: string;
}

/**
 * 24-viewBox check glyph (strokeWidth 2). Distinct from the default
 * `CheckIcon` (strokeWidth 1.8, different path) — shared across the
 * photo-edit / account / cutout-confirm / withdraw-reason screens.
 */
export function CheckIcon24({ className }: CheckIcon24Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
