'use client';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyHintCardProps {
  title?: string;
  body: ReactNode;
  className?: string;
}

export function EmptyHintCard({ title, body, className }: EmptyHintCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1 rounded-2xl bg-brand-gray200 px-12 py-5 text-center',
        className,
      )}
    >
      {title ? (
        <p className="text-lg font-semibold text-brand-gray900">{title}</p>
      ) : null}
      <div className="text-sm leading-snug text-brand-gray800">{body}</div>
    </div>
  );
}
