interface BookmarkIconProps {
  filled: boolean;
  className?: string;
}

// Figma 한 장 리본을 24 viewBox 로 정규화 (glyph 16.67 x 20). 상하 2px 여백은 stroke 가 잘리지 않게 하려는 것.
const PATH =
  'M3.6659 4.727C3.6659 3.2209 4.9097 2 6.4439 2H17.5561C19.0903 2 20.3341 3.2209 20.3341 4.727V20.1801C20.3341 21.7863 18.3675 22.6034 17.1928 21.4853L12.6446 17.4056C12.2854 17.0637 11.7146 17.0637 11.3554 17.4056L6.8072 21.4853C5.6325 22.6034 3.6659 21.7863 3.6659 20.1801V4.727Z';

/** 글 한 건의 저장 상태. 저장한 글 모음(복수)은 BookmarkStackIcon. */
export function BookmarkIcon({ filled, className }: BookmarkIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATH} />
    </svg>
  );
}
