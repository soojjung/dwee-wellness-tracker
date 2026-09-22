import type { PrivacyBlock, PrivacyDocument } from '@/content/legal';

/** Body of the Privacy Policy — shared by the in-app and public pages. */
export function PrivacyArticle({ doc }: { doc: PrivacyDocument }) {
  return (
    <>
      <h2 className="text-base font-semibold leading-6">{doc.title}</h2>
      <p className="mt-1 text-xs leading-5 text-brand-gray600">{doc.effectiveDate}</p>
      <p className="mt-4 text-[13px] leading-[1.7] text-brand-gray700">{doc.intro}</p>

      {doc.sections.map((section) => (
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
        {doc.changeLog.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </section>

      <section className="mt-8 border-t border-brand-gray200 pt-6">
        <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
          {doc.appendix}
        </p>
      </section>
    </>
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
      <h4 className="pt-1 text-[13px] font-semibold leading-5 text-brand-gray900">{block.text}</h4>
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
  return (
    <dl className="rounded-lg border border-brand-gray200 bg-brand-white/60 p-3 text-[13px] leading-[1.6]">
      {block.rows.map((row, i) => (
        <div key={i} className="flex gap-2 py-0.5 first:pt-0 last:pb-0">
          <dt className="w-28 shrink-0 text-brand-gray600">{row.label}</dt>
          <dd className="flex-1 text-brand-gray900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
