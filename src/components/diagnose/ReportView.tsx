'use client';
import { forwardRef } from 'react';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import type { BodyTypeReport, PrimaryBodyType, StyleSection } from '@/types';

interface ReportViewProps {
  report: BodyTypeReport;
}

const TYPE_IMAGE: Record<PrimaryBodyType, string> = {
  straight: '/magazine/personal-body-type/straight.png',
  wave: '/magazine/personal-body-type/wave.png',
  natural: '/magazine/personal-body-type/natural.png',
};

export const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(function ReportView(
  { report },
  ref,
) {
  const t = useT();
  const r = t.magazine.diagnose.result;

  return (
    <div ref={ref} className="flex flex-col gap-5 rounded-3xl bg-brand-white p-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-brand-gray900">{r.title}</h1>
      </header>

      <PrimaryTypeBlock
        primaryType={report.summary.primaryType}
        typeLabel={r.typeName[report.summary.primaryType]}
        title={r.primaryTitle}
        confidenceLabel={r.confidenceLabel}
        confidenceText={confidenceText(t, report.summary.confidence)}
      />

      <Section title={r.keyTraitsTitle}>
        <ul className="flex flex-col gap-1.5 pl-4 text-sm text-brand-gray800">
          {report.summary.keyTraits.map((trait, i) => (
            <li key={i} className="list-disc marker:text-brand-pink200">{trait}</li>
          ))}
        </ul>
      </Section>

      <Section title={r.keywordsTitle}>
        <div className="flex flex-wrap gap-1.5">
          {report.summary.keywords.map((kw, i) => (
            <span key={i} className="rounded-full bg-brand-pink50 px-2.5 py-1 text-xs font-medium text-brand-pink900">
              #{kw}
            </span>
          ))}
        </div>
      </Section>

      <Section title={r.frameTitle}>
        <Field label={r.frameShoulders} value={report.frame.shoulders} />
        <Field label={r.frameCollarbones} value={report.frame.collarbones} />
        <Field label={r.frameWaistPosition} value={report.frame.waistPosition} />
        <Field label={r.frameHipPosition} value={report.frame.hipPosition} />
        <Field label={r.frameBoneVisibility} value={report.frame.boneVisibility} />
        <Field label={r.frameSkinTexture} value={report.frame.skinTexture} />
        <Field label={r.frameMuscleTone} value={report.frame.muscleTone} />
        <Field label={r.frameCenterOfGravity} value={report.frame.centerOfGravity} />
      </Section>

      <Section title={r.proportionsTitle}>
        <Field label={r.proportionsUpperBody} value={report.proportions.upperBody} />
        <Field label={r.proportionsLowerBody} value={report.proportions.lowerBody} />
        <Field label={r.proportionsWaistLine} value={report.proportions.waistLine} />
        <Field label={r.proportionsHipLine} value={report.proportions.hipLine} />
        <Field label={r.proportionsOverall} value={report.proportions.overall} />
      </Section>

      <Section title={r.styleGuideTitle}>
        <StyleBlock label={r.styleGuideTops} section={report.styleGuide.tops} recommendedLabel={r.recommendedLabel} avoidLabel={r.avoidLabel} reasonLabel={r.reasonLabel} />
        <StyleBlock label={r.styleGuideBottoms} section={report.styleGuide.bottoms} recommendedLabel={r.recommendedLabel} avoidLabel={r.avoidLabel} reasonLabel={r.reasonLabel} />
        <StyleBlock label={r.styleGuideDresses} section={report.styleGuide.dresses} recommendedLabel={r.recommendedLabel} avoidLabel={r.avoidLabel} reasonLabel={r.reasonLabel} />
        <StyleBlock label={r.styleGuideOuterwear} section={report.styleGuide.outerwear} recommendedLabel={r.recommendedLabel} avoidLabel={r.avoidLabel} reasonLabel={r.reasonLabel} />
      </Section>

      <Section title={r.fitCriteriaTitle}>
        <Tag label={r.fitGoodLabel} items={report.fitCriteria.good} tone="good" />
        <Tag label={r.fitBadLabel} items={report.fitCriteria.bad} tone="bad" />
        <p className="text-xs leading-relaxed text-brand-gray600">{report.fitCriteria.reason}</p>
      </Section>

      <Section title={r.detailsTitle}>
        <Field label={r.detailsNeckline} value={report.details.neckline} />
        <Field label={r.detailsSleeves} value={report.details.sleeves} />
        <Field label={r.detailsWaistDetail} value={report.details.waistDetail} />
        <Field label={r.detailsLength} value={report.details.length} />
      </Section>

      <Section title={r.materialsTitle}>
        <Tag label={r.materialsRecommendedLabel} items={report.materials.recommended} tone="good" />
        <Tag label={r.materialsAvoidLabel} items={report.materials.avoid} tone="bad" />
        <p className="text-xs leading-relaxed text-brand-gray600">{report.materials.reason}</p>
      </Section>
    </div>
  );
});

function confidenceText(
  t: ReturnType<typeof useT>,
  c: BodyTypeReport['summary']['confidence'],
): string {
  const r = t.magazine.diagnose.result;
  if (c === 'high') return r.confidenceHigh;
  if (c === 'medium') return r.confidenceMedium;
  return r.confidenceLow;
}

function PrimaryTypeBlock({
  primaryType,
  typeLabel,
  title,
  confidenceLabel,
  confidenceText,
}: {
  primaryType: PrimaryBodyType;
  typeLabel: string;
  title: string;
  confidenceLabel: string;
  confidenceText: string;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-brand-pink50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-brand-gray900">{title}</h2>
        <span className="text-[10px] font-medium text-brand-gray600">{confidenceLabel}: {confidenceText}</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-48 w-36 overflow-hidden rounded-2xl bg-brand-white">
          <Image
            src={TYPE_IMAGE[primaryType]}
            alt={typeLabel}
            fill
            sizes="144px"
            className="object-contain p-2"
          />
        </div>
        <span className="text-2xl font-semibold text-brand-gray900">{typeLabel}</span>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-semibold text-brand-gray900">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-brand-gray600">{label}</span>
      <span className="text-sm leading-relaxed text-brand-gray800">{value}</span>
    </div>
  );
}

function StyleBlock({
  label,
  section,
  recommendedLabel,
  avoidLabel,
  reasonLabel,
}: {
  label: string;
  section: StyleSection;
  recommendedLabel: string;
  avoidLabel: string;
  reasonLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-brand-gray200 p-3">
      <p className="text-sm font-semibold text-brand-gray900">{label}</p>
      <Tag label={recommendedLabel} items={section.recommended} tone="good" />
      <Tag label={avoidLabel} items={section.avoid} tone="bad" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium uppercase tracking-wide text-brand-gray600">{reasonLabel}</span>
        <p className="text-xs leading-relaxed text-brand-gray800">{section.reason}</p>
      </div>
    </div>
  );
}

function Tag({
  label,
  items,
  tone,
}: {
  label: string;
  items: readonly string[];
  tone: 'good' | 'bad';
}) {
  const chipClass =
    tone === 'good'
      ? 'bg-brand-pink50 text-brand-pink900'
      : 'bg-brand-gray300 text-brand-gray800';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-brand-gray600">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className={`rounded-full px-2.5 py-1 text-xs font-medium ${chipClass}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
