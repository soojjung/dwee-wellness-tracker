interface HeaderCancelGlyphProps {
  className?: string;
}

/**
 * Figma 256:15854 (icon_cancel) — 40-viewBox X glyph sized to fill a 40px
 * header button 1:1. Shared by EventFormSheet and PhotoImportModal's
 * header close buttons.
 */
export function HeaderCancelGlyph({ className }: HeaderCancelGlyphProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M14 14L26 26M26 14L14 26" />
    </svg>
  );
}
