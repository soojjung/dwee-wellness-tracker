'use client';
import { useT } from '@/i18n/useT';
import type { BodyTypeAnalyzeError } from '@/types';
import { AlertCircleIcon } from '@/components/ui/icons';

export function ErrorView({ code, onRetry }: { code: BodyTypeAnalyzeError; onRetry: () => void }) {
  const t = useT();
  const e = t.magazine.diagnose.error;
  const messageMap: Record<BodyTypeAnalyzeError, string> = {
    unauthenticated: e.unauthenticated,
    rate_limit_exceeded: e.rateLimitExceeded,
    image_too_large: e.imageTooLarge,
    invalid_media_type: e.invalidMediaType,
    missing_image: e.missingImage,
    invalid_shot_type: e.unknown,
    invalid_locale: e.unknown,
    image_refused: e.imageRefused,
    no_body_detected: e.noBodyDetected,
    openai_failed: e.openaiFailed,
    openai_unreachable: e.openaiUnreachable,
    report_parse_failed: e.openaiFailed,
    // `aborted` should never reach this UI — startAnalysis skips ErrorView
    // when the request was cancelled by the caller. Kept for type
    // exhaustiveness and to fall back gracefully if the guard ever misses.
    aborted: e.unknown,
    unknown: e.unknown,
  };
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-5 px-4">
      <span className="grid size-[70px] place-items-center rounded-full bg-brand-gray300 text-brand-gray600">
        <AlertCircleIcon className="size-[42px]" />
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold leading-normal text-brand-gray900">{e.title}</h1>
        <p className="text-base leading-normal text-brand-gray800">{messageMap[code]}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center rounded-full bg-brand-pink50 px-7 py-4 text-base font-medium leading-normal text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {e.retry}
      </button>
    </div>
  );
}
