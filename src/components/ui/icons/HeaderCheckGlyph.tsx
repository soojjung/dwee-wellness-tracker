interface HeaderCheckGlyphProps {
  className?: string;
}

/**
 * Figma 256:15860 (icon_check) — 40-viewBox check glyph sized to fill a
 * 40px header button 1:1. Shared by EventFormSheet, PhotoImportModal and
 * DiaryCustomizeScreen's header confirm buttons.
 */
export function HeaderCheckGlyph({ className }: HeaderCheckGlyphProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M13.0001 20L16.8773 24.9851C17.2777 25.4999 18.0557 25.4999 18.456 24.9851L27 14" />
    </svg>
  );
}
