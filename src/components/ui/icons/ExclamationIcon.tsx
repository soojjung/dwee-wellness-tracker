interface ExclamationIconProps {
  className?: string;
}

/** Shared alert badge glyph for destructive-confirm dialogs (ConfirmDialog). */
export function ExclamationIcon({ className }: ExclamationIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 6v8" />
      <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
