'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';
import { Button } from '@/components/ui/Button';

export type AccountAlertVariant = 'success' | 'failure';

interface AccountAlertDialogProps {
  variant: AccountAlertVariant;
  onClose: () => void;
}

export function AccountAlertDialog({ variant, onClose }: AccountAlertDialogProps) {
  const t = useT();
  const a = t.settings.account;

  useBodyScrollLock();
  useEscToClose(onClose);

  const title = variant === 'success' ? a.deleteSuccessTitle : a.deleteFailureTitle;
  const body = variant === 'success' ? a.deleteSuccessBody : a.deleteFailureBody;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-alert-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 px-5 pb-8 sm:items-center sm:pb-0"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-brand-white p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="account-alert-title" className="text-base font-semibold text-brand-gray900">
          {title}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-gray800">{body}</p>
        <div className="mt-5">
          <Button variant="primary" size="md" fullWidth onClick={onClose}>
            {a.alertOk}
          </Button>
        </div>
      </div>
    </div>
  );
}
