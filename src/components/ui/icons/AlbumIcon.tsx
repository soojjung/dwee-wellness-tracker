interface AlbumIconProps {
  className?: string;
}

/** Figma `icon_album` (202:1335) — filled photo/album glyph, 18×18 viewBox. */
export function AlbumIcon({ className }: AlbumIconProps) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M16.9277 13.75C16.5767 15.6005 14.9527 17 13 17H5C3.04731 17 1.42334 15.6005 1.07227 13.75H16.9277Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 1C15.2091 1 17 2.79086 17 5V12.25H13.3105L6.2373 5.17676C5.55391 4.49344 4.44609 4.49344 3.7627 5.17676L1 7.93945V5C1 2.79086 2.79086 1 5 1H13ZM12.5 4C11.6716 4 11 4.67157 11 5.5C11 6.32843 11.6716 7 12.5 7C13.3284 7 14 6.32843 14 5.5C14 4.67157 13.3284 4 12.5 4Z"
      />
      <path d="M4.82324 6.2373C4.92085 6.13977 5.07915 6.13977 5.17676 6.2373L11.1895 12.25H1V10.0605L4.82324 6.2373Z" />
    </svg>
  );
}
