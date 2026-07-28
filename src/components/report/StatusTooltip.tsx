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
      className="absolute right-0 top-[calc(100%+12px)] z-20 w-[240px] rounded-2xl bg-brand-gray900 p-4 text-left shadow-[0_4px_16px_0_rgba(0,0,0,0.16)]"
    >
      <span
        aria-hidden
        className="absolute -top-[7px] right-4 h-3 w-3 rotate-45 bg-brand-gray900"
      />
      <p className="text-sm font-medium leading-normal text-brand-white">{title}</p>
      <p className="mt-1 text-xs leading-normal text-brand-gray500">{criteria}</p>
    </div>
  );
}
