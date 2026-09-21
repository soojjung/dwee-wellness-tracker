'use client';
import { useT } from '@/i18n/useT';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useEscToClose } from '@/hooks/useEscToClose';

export function ConsentModal({ onCancel, onAgree }: { onCancel: () => void; onAgree: () => void }) {
  const t = useT();
  const c = t.magazine.diagnose.consent;
  useBodyScrollLock();
  useEscToClose(onCancel);
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnose-consent-title"
        className="flex w-full max-w-[333px] flex-col overflow-hidden rounded-2xl bg-brand-gray50"
      >
        <div className="flex flex-col gap-4 p-8">
          <h2
            id="diagnose-consent-title"
            className="text-xl font-semibold leading-normal text-brand-gray900"
          >
            {c.title}
          </h2>
          <div className="flex flex-col gap-2">
            <p className="text-base font-semibold leading-[normal] text-brand-gray900">
              {c.heading}
            </p>
            <ul className="flex flex-col gap-1 pl-5 text-sm leading-normal text-brand-gray700">
              <li className="list-disc">{c.item1}</li>
              <li className="list-disc">{c.item2}</li>
            </ul>
            <p className="text-xs leading-normal text-brand-gray600">{c.footnote}</p>
          </div>
        </div>
        <div className="flex w-full items-center">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-[50px] flex-1 items-center justify-center bg-brand-gray300 text-lg font-medium leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {c.cancel}
          </button>
          <button
            type="button"
            onClick={onAgree}
            className="flex h-[50px] w-[167px] items-center justify-center bg-brand-gray900 text-lg font-semibold leading-normal text-brand-gray50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
          >
            {c.agree}
          </button>
        </div>
      </div>
    </div>
  );
}
