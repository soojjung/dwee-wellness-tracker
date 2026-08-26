'use client';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { PRIVACY_KO, type PrivacyBlock } from '@/content/legal/privacy-ko';

export function PrivacyScreen() {
  const t = useT();
  return (
    <div className="flex min-h-dvh flex-col bg-brand-gray50">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 bg-brand-gray50 px-4">
          <Link
            href="/settings"
            aria-label={t.myPage.account.closeAriaLabel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-gray200 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray900 focus-visible:ring-offset-2"
          >
            <BackIcon />
          </Link>
          <h1 className="text-lg font-semibold leading-6 text-brand-gray900">
            {t.myPage.support.privacy}
          </h1>
        </header>
        <main className="px-5 pb-10 pt-2">
          <article className="text-brand-gray900">
            <h2 className="text-base font-semibold leading-6">{PRIVACY_KO.title}</h2>
            <p className="mt-1 text-xs leading-5 text-brand-gray600">
              {PRIVACY_KO.effectiveDate}
            </p>
            <p className="mt-4 text-[13px] leading-[1.7] text-brand-gray700">
              {PRIVACY_KO.intro}
            </p>

            {PRIVACY_KO.sections.map((section) => (
              <section key={section.heading} className="mt-6">
                <h3 className="mb-2 text-sm font-semibold leading-5 text-brand-gray900">
                  {section.heading}
                </h3>
                <div className="space-y-3">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <section className="mt-6 space-y-3">
              {PRIVACY_KO.changeLog.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>

            <section className="mt-8 border-t border-brand-gray200 pt-6">
              <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
                {PRIVACY_KO.appendix}
              </p>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}

function Block({ block }: { block: PrivacyBlock }) {
  if (block.kind === 'text') {
    return (
      <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
        {block.text}
      </p>
    );
  }
  if (block.kind === 'subhead') {
    return (
      <h4 className="pt-1 text-[13px] font-semibold leading-5 text-brand-gray900">
        {block.text}
      </h4>
    );
  }
  if (block.kind === 'bullets') {
    return (
      <ul className="list-disc space-y-1 pl-5 text-[13px] leading-[1.7] text-brand-gray700 marker:text-brand-gray500">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  // kv
  return (
    <dl className="rounded-lg border border-brand-gray200 bg-brand-white/60 p-3 text-[13px] leading-[1.6]">
      {block.rows.map((row, i) => (
        <div
          key={i}
          className="flex gap-2 py-0.5 first:pt-0 last:pb-0"
        >
          <dt className="w-28 shrink-0 text-brand-gray600">{row.label}</dt>
          <dd className="flex-1 text-brand-gray900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}
