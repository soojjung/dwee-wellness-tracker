import type { TermsDocument } from '@/content/legal';

/** Body of the Terms of Service — shared by the in-app and public pages. */
export function TermsArticle({ doc }: { doc: TermsDocument }) {
  return (
    <>
      <h2 className="mb-6 text-base font-semibold leading-6">{doc.title}</h2>
      {doc.sections.map((section) => (
        <section key={section.heading} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold leading-5 text-brand-gray900">
            {section.heading}
          </h3>
          <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
            {section.body}
          </p>
        </section>
      ))}
      <section className="mt-8 border-t border-brand-gray200 pt-6">
        <h3 className="mb-2 text-sm font-semibold leading-5 text-brand-gray900">
          {doc.appendix.heading}
        </h3>
        <p className="whitespace-pre-line text-[13px] leading-[1.7] text-brand-gray700">
          {doc.appendix.body}
        </p>
      </section>
    </>
  );
}
