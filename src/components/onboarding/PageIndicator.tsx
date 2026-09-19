import { cn } from '@/lib/cn';

interface PageIndicatorProps {
  count: number;
  index: number;
}

// 정의서 001_1~3 ②: 현재 페이지 26×10 gray900, 나머지 10×10 gray400.
export function PageIndicator({ count, index }: PageIndicatorProps) {
  return (
    <div aria-hidden className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-2.5 rounded-full transition-all duration-300',
            i === index ? 'w-[26px] bg-brand-gray900' : 'w-2.5 bg-brand-gray400',
          )}
        />
      ))}
    </div>
  );
}
