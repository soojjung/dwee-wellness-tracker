import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-auth-button text-auth-buttonText',
  secondary: 'bg-neutral-900 text-white',
  ghost: 'bg-transparent text-neutral-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-full',
  md: 'h-11 px-6 text-sm rounded-full',
  lg: 'h-[55px] px-6 text-base rounded-[40px]',
};

interface SharedProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

function buttonClasses({ variant = 'primary', size = 'md', fullWidth, className }: SharedProps) {
  return cn(
    'inline-flex items-center justify-center gap-3 font-medium',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-button focus-visible:ring-offset-2',
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

export type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant, size, fullWidth, className, children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonClasses({ variant, size, fullWidth, className })}>
      {children}
    </button>
  );
}

export interface LinkButtonProps extends SharedProps {
  href: string;
  children?: ReactNode;
}

export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  href,
  children,
}: LinkButtonProps) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}
