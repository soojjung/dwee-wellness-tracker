import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <section className={cn('mx-auto flex w-full max-w-md flex-col gap-3 px-4', className)}>
      {children}
    </section>
  );
}
