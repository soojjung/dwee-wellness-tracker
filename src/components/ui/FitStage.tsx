'use client';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FitStageProps {
  /** 시안 좌표계의 크기. 자식은 이 크기의 상자 안에 absolute 로 배치한다. */
  width: number;
  height: number;
  /** 큰 화면에서 시안보다 과하게 커지지 않도록 하는 상한. */
  maxScale?: number;
  /** 남는 세로 공간을 어디에 둘지. */
  align?: 'top' | 'center';
  /** 그림뿐이라 스크린리더에서 통째로 숨길 때. */
  decorative?: boolean;
  children: ReactNode;
}

/**
 * 시안 좌표 그대로 배치한 그림을 주어진 영역에 맞춰 통째로 확대·축소한다.
 * 부모가 flex column 이어야 남는 높이를 차지한다.
 */
export function FitStage({
  width,
  height,
  maxScale = 1.2,
  align = 'top',
  decorative = false,
  children,
}: FitStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => {
      const box = frame.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      setScale(Math.min(box.width / width, box.height / height, maxScale));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width, height, maxScale]);

  const centered = align === 'center';
  return (
    <div
      ref={frameRef}
      aria-hidden={decorative || undefined}
      className="relative min-h-0 flex-1 overflow-hidden"
    >
      <div
        className={cn('absolute left-1/2', centered ? 'top-1/2 origin-center' : 'top-0 origin-top')}
        style={{
          width,
          height,
          transform: `translate(-50%, ${centered ? '-50%' : '0'}) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
