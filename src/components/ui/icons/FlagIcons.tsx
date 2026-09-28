interface FlagIconProps {
  className?: string;
}

// 3:2 viewBox 둘 다 같은 크기로 그려 목록에서 나란히 놓였을 때 폭이 맞게 한다.
const VIEW_BOX = '0 0 36 24';

const US_STRIPE_H = 24 / 13;
const US_STAR_ROWS = [1.6, 4.2, 6.8, 9.4, 12];

export function FlagUSIcon({ className }: FlagIconProps) {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden className={className}>
      <rect width="36" height="24" fill="#FFFFFF" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} y={i * 2 * US_STRIPE_H} width="36" height={US_STRIPE_H} fill="#B22234" />
      ))}
      <rect width="14.4" height={US_STRIPE_H * 7} fill="#3C3B6E" />
      {US_STAR_ROWS.map((y, row) =>
        Array.from({ length: row % 2 === 0 ? 5 : 4 }, (_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={(row % 2 === 0 ? 1.6 : 3) + col * 2.8}
            cy={y}
            r="0.55"
            fill="#FFFFFF"
          />
        )),
      )}
    </svg>
  );
}

// 괘: 1 = 막대, 0 = 끊긴 막대. 중앙에서 바깥쪽 순서지만 네 괘 모두 좌우 대칭이라 순서 무관.
const TRIGRAMS: { angle: number; bars: readonly (0 | 1)[] }[] = [
  { angle: -56.31, bars: [1, 1, 1] }, // 건 ☰ 왼쪽 위
  { angle: 56.31, bars: [0, 1, 0] }, // 감 ☵ 오른쪽 위
  { angle: 123.69, bars: [0, 0, 0] }, // 곤 ☷ 오른쪽 아래
  { angle: -123.69, bars: [1, 0, 1] }, // 리 ☲ 왼쪽 아래
];

export function FlagKRIcon({ className }: FlagIconProps) {
  return (
    <svg viewBox={VIEW_BOX} aria-hidden className={className}>
      <rect width="36" height="24" fill="#FFFFFF" />
      <g transform="rotate(33.69 18 12)">
        <path d="M12 12a6 6 0 0 1 12 0z" fill="#CD2E3A" />
        <path d="M12 12a6 6 0 0 0 12 0z" fill="#0047A0" />
        <circle cx="15" cy="12" r="3" fill="#CD2E3A" />
        <circle cx="21" cy="12" r="3" fill="#0047A0" />
      </g>
      {TRIGRAMS.map(({ angle, bars }) => (
        <g key={angle} transform={`translate(18 12) rotate(${angle}) translate(0 -10.5)`}>
          {bars.map((solid, i) => {
            const y = (i - 1) * 1.6 - 0.5;
            return solid ? (
              <rect key={i} x="-3" y={y} width="6" height="1" fill="#000000" />
            ) : (
              <g key={i}>
                <rect x="-3" y={y} width="2.7" height="1" fill="#000000" />
                <rect x="0.3" y={y} width="2.7" height="1" fill="#000000" />
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
