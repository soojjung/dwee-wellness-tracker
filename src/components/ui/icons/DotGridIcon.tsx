interface DotGridIconProps {
  className?: string;
}

const DOT_POSITIONS: readonly [number, number][] = [
  [5, 5],
  [10.5, 5],
  [16, 5],
  [5, 10.5],
  [10.5, 10.5],
  [16, 10.5],
  [5, 16],
  [10.5, 16],
  [16, 16],
];

export function DotGridIcon({ className = 'h-6 w-6' }: DotGridIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      {DOT_POSITIONS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={3} height={3} rx={1} />
      ))}
    </svg>
  );
}
