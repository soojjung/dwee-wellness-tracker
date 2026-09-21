interface BackIcon24Props {
  className?: string;
}

/**
 * 24-viewBox chevron-back glyph (strokeWidth 1.6). Distinct from the
 * default `BackIcon` (40-viewBox, different path) — shared by the
 * home-customize header and photo-edit screen back buttons.
 */
export function BackIcon24({ className }: BackIcon24Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
