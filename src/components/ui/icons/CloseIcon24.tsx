interface CloseIcon24Props {
  className?: string;
}

/**
 * 24-viewBox X glyph (strokeWidth 1.6). Distinct from `CancelIcon`
 * (strokeWidth 1.5) — shared across the photo-edit / account / camera
 * screens that all drew this exact path locally.
 */
export function CloseIcon24({ className }: CloseIcon24Props) {
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
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
