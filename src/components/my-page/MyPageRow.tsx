import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface MyPageRowProps {
  label: string;
  /** Optional right-side content shown before the chevron (e.g. current value). */
  value?: ReactNode;
  /** Replaces the right-side chevron entirely (e.g. Toggle). */
  trailing?: ReactNode;
  /** Text color override (default: gray900). */
  labelClassName?: string;
  className?: string;
  /** Renders the row as a Link. */
  href?: string;
  /** Renders the row as a button. */
  onClick?: () => void;
}

const rowBase =
  'flex h-14 w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2';

/**
 * Single row inside a MyPageCard — label on the left, optional value + chevron
 * (or a `trailing` slot) on the right. Renders as a Link when `href` is given,
 * a button when `onClick` is given, or a plain div when `as="static"`.
 */
export function MyPageRow({
  label,
  value,
  trailing,
  labelClassName,
  className,
  href,
  onClick,
}: MyPageRowProps) {
  // Interactive rows show a chevron; rows whose right side is entirely a
  // custom `trailing` (e.g. a Toggle) skip it.
  const showChevron = !trailing;

  const content = (
    <>
      <span className={cn('text-base font-medium text-brand-gray900', labelClassName)}>
        {label}
      </span>
      <span className="flex items-center gap-2">
        {value ? <span className="text-sm text-brand-gray700">{value}</span> : null}
        {trailing}
        {showChevron ? <ChevronRightIcon /> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(rowBase, className)}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowBase, className)}>
        {content}
      </button>
    );
  }
  return <div className={cn(rowBase, className)}>{content}</div>;
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-brand-gray700"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
