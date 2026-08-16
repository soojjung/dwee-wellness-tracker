import { cn } from '@/lib/cn';

type ToastVariant = 'default' | 'topConfirm';

interface ToastProps {
  message: string | null;
  /** `default` = bottom pill (form saves, hint messages).
   *  `topConfirm` = top rounded card + left check icon (015_8 logout done). */
  variant?: ToastVariant;
  className?: string;
}

export function Toast({ message, variant = 'default', className }: ToastProps) {
  if (!message) return null;

  if (variant === 'topConfirm') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'pointer-events-none fixed inset-x-0 top-4 z-50 mx-auto max-w-md px-4',
          className,
        )}
      >
        <div className="flex animate-slideDownFade items-center gap-3 rounded-2xl bg-brand-gray900/90 px-4 py-3 shadow-[0_4px_20px_0_rgba(0,0,0,0.15)] backdrop-blur">
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-white text-brand-gray900"
            aria-hidden
          >
            <CheckIcon />
          </span>
          <p className="text-sm font-medium leading-tight text-brand-white">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-24 mx-auto max-w-md px-5',
        className,
      )}
    >
      <p className="rounded-full bg-auth-button/90 px-4 py-2 text-center text-sm text-auth-buttonText">
        {message}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden
    >
      <path d="M2.5 6.2L5 8.7L9.5 3.5" />
    </svg>
  );
}
