'use client';
import { useEffect, useRef } from 'react';

interface StatusTooltipProps {
  title: string;
  criteria: string;
  onDismiss: () => void;
}

export function StatusTooltip({ title, criteria, onDismiss }: StatusTooltipProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      onDismiss();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onDismiss]);

  return (
    <div
      ref={ref}
      role="tooltip"
      // 몸통을 ? 버튼(16px, 앵커 오른쪽 끝)보다 16px 더 오른쪽으로 내밀어, 꼬리가
      // rounded-2xl(16px) 모서리 구간을 피하면서도 버튼 중심(오른쪽에서 24px) 아래에 오게 한다.
      // 꼬리가 모서리 라운딩 위에 걸치면 깎인 만큼 몸통과 떨어져 보인다.
      className="absolute -right-4 top-[calc(100%+12px)] z-20 w-[240px] rounded-2xl bg-brand-gray900 p-4 text-left shadow-[0_4px_16px_0_rgba(0,0,0,0.16)]"
    >
      <span
        aria-hidden
        className="absolute -top-1.5 right-[18px] size-3 rotate-45 rounded-[2px] bg-brand-gray900"
      />
      <p className="text-sm font-medium leading-normal text-brand-white">{title}</p>
      <p className="mt-1 text-xs leading-normal text-brand-gray500">{criteria}</p>
    </div>
  );
}
