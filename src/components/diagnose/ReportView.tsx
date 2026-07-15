'use client';
import { forwardRef, useState } from 'react';
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

type Tab = 'body' | 'style';

export const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(function ReportView(
  { report },
  ref,
) {
  const t = useT();
  const r = t.magazine.diagnose.result;
  const [tab, setTab] = useState<Tab>('body');
  const typeName = r.typeName[report.summary.primaryType];

  return (
    <div ref={ref} className="flex flex-col bg-brand-pink50">
      <Hero
        typeName={typeName}
        typeSuffix={r.typeSuffix}
        subtitle={report.summary.keyTraits[0] ?? ''}
        image={TYPE_IMAGE[report.summary.primaryType]}
      />

      <div className="-mt-6 flex flex-col gap-6 rounded-t-[40px] bg-brand-gray50 px-4 pb-14 pt-7">
        <TabPills active={tab} onChange={setTab} bodyLabel={r.bodyTab} styleLabel={r.styleTab} />

        {tab === 'body' ? <BodyTab report={report} r={r} /> : <StyleTab report={report} r={r} />}
      </div>
    </div>
  );
});

function Hero({
  typeName,
  typeSuffix,
  subtitle,
  image,
}: {
  typeName: string;
  typeSuffix: string;
  subtitle: string;
  image: string;
}) {
  return (
    <div className="relative">
      <div className="relative flex h-[322px] w-full items-start px-4 pb-6 pt-[105px]">
        {/* Image is contained to the visible pink area only — Hero is 322px
            and the white card overlaps 24px via `-mt-6`, so we cap the
            container at 298px so it never bleeds past the rounded card
            top. Inner img is over-scaled and shifted up so the face is out
            of frame and the torso dominates. */}
        <div className="pointer-events-none absolute right-0 top-0 h-[298px] w-[260px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute left-1/2 top-[-200px] h-[900px] w-auto max-w-none -translate-x-1/2"
          />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold leading-normal text-brand-gray900">
            {typeName} {typeSuffix}
          </h1>
          <p className="whitespace-pre-line text-base leading-normal text-brand-gray800">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function TabPills({
  active,
  onChange,
  bodyLabel,
  styleLabel,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  bodyLabel: string;
  styleLabel: string;
}) {
  return (
    <div className="flex items-center rounded-full border border-brand-gray200 p-[3px]">
      <TabButton active={active === 'body'} label={bodyLabel} onClick={() => onChange('body')} />
      <TabButton active={active === 'style'} label={styleLabel} onClick={() => onChange('style')} />
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-xl leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200 ${
        active
          ? 'bg-brand-gray300 font-semibold text-brand-gray900'
          : 'font-normal text-brand-gray500'
      }`}
    >
      {label}
    </button>
  );
}

type ResultCopy = ReturnType<typeof useT>['magazine']['diagnose']['result'];

function BodyTab({ report, r }: { report: BodyTypeReport; r: ResultCopy }) {
  return (
    <div className="flex flex-col gap-6">
      <Section title={r.keywordsTitle}>
        <div className="flex flex-wrap gap-2">
          {report.summary.keywords.map((kw, i) => (
            <span
              key={i}
              className="inline-flex items-center justify-center rounded-full border border-brand-gray300 px-2.5 py-1 text-base text-brand-gray800"
            >
              #{kw}
            </span>
          ))}
        </div>
      </Section>

      <Section title={r.keyTraitsTitle}>
        <ul className="flex flex-col gap-1 pl-6 text-base leading-normal text-brand-gray800">
          {report.summary.keyTraits.map((trait, i) => (
            <li key={i} className="list-disc">
              {trait}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={r.frameTitle}>
        <Paragraph
          parts={[
            report.frame.boneVisibility,
            report.frame.shoulders,
            report.frame.collarbones,
          ]}
        />
      </Section>

      <Section title={r.textureTitle}>
        <Paragraph parts={[report.frame.skinTexture, report.frame.muscleTone]} />
      </Section>

      <Section title={r.lineTitle}>
        <Paragraph parts={[report.frame.waistPosition, report.frame.hipPosition]} />
      </Section>

      <Section title={r.centerTitle}>
        <Paragraph parts={[report.frame.centerOfGravity]} />
      </Section>

      <Section title={r.proportionsTitle}>
        <Paragraph
          parts={[
            report.proportions.upperBody,
            report.proportions.lowerBody,
            report.proportions.overall,
          ]}
        />
      </Section>
    </div>
  );
}

function StyleTab({ report, r }: { report: BodyTypeReport; r: ResultCopy }) {
  return (
    <div className="flex flex-col gap-6">
      <Section title={r.styleGuideTitle}>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          <ClothingCard
            label={r.styleGuideTops}
            section={report.styleGuide.tops}
            recommendedLabel={r.recommendedLabel}
            avoidLabel={r.avoidLabel}
            reasonLabel={r.reasonLabel}
          />
          <ClothingCard
            label={r.styleGuideBottoms}
            section={report.styleGuide.bottoms}
            recommendedLabel={r.recommendedLabel}
            avoidLabel={r.avoidLabel}
            reasonLabel={r.reasonLabel}
          />
          <ClothingCard
            label={r.styleGuideDresses}
            section={report.styleGuide.dresses}
            recommendedLabel={r.recommendedLabel}
            avoidLabel={r.avoidLabel}
            reasonLabel={r.reasonLabel}
          />
          <ClothingCard
            label={r.styleGuideOuterwear}
            section={report.styleGuide.outerwear}
            recommendedLabel={r.recommendedLabel}
            avoidLabel={r.avoidLabel}
            reasonLabel={r.reasonLabel}
          />
        </div>
      </Section>

      <Section title={r.fitCriteriaTitle}>
        <FitList label={r.fitGoodLabel} items={report.fitCriteria.good} />
        <FitList label={r.fitBadLabel} items={report.fitCriteria.bad} />
        <p className="text-xs leading-normal text-brand-gray600">{report.fitCriteria.reason}</p>
      </Section>

      <Section title={r.detailsTitle}>
        <FieldGrid
          items={[
            { label: r.detailsNeckline, value: report.details.neckline },
            { label: r.detailsSleeves, value: report.details.sleeves },
            { label: r.detailsWaistDetail, value: report.details.waistDetail },
            { label: r.detailsLength, value: report.details.length },
          ]}
        />
      </Section>

      <Section title={r.materialsTitle}>
        <FitList label={r.materialsRecommendedLabel} items={report.materials.recommended} />
        <FitList label={r.materialsAvoidLabel} items={report.materials.avoid} />
        <p className="text-xs leading-normal text-brand-gray600">{report.materials.reason}</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold leading-normal text-brand-gray900">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

// Joins multiple observation phrases from the API into one flowing paragraph.
// The prompt instructs each frame/proportion field to be a short sentence,
// so a space join reads naturally in Korean and English.
function Paragraph({ parts }: { parts: readonly string[] }) {
  const text = parts.filter((p) => p && p.trim().length > 0).join(' ');
  return <p className="text-base leading-normal text-brand-gray800">{text}</p>;
}

// Two-column label/value grid — matches Figma's stacked labeled fields.
function FieldGrid({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <span className="text-xs leading-normal text-brand-gray600">{item.label}</span>
          <span className="text-base leading-normal text-brand-gray800">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function FitList({ label, items }: { label: string; items: readonly string[] }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs leading-normal text-brand-gray600">{label}</span>
      <p className="text-base leading-normal text-brand-gray800">{items.join(' · ')}</p>
    </div>
  );
}

function ClothingCard({
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
    <div className="flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl bg-brand-gray200 p-6">
      <p className="text-lg font-semibold leading-normal text-brand-gray900">{label}</p>
      <ClothingRow emoji="👍" label={recommendedLabel} items={section.recommended} />
      <ClothingRow emoji="👎" label={avoidLabel} items={section.avoid} />
      <ClothingRow emoji="💡" label={reasonLabel} single={section.reason} />
    </div>
  );
}

function ClothingRow({
  emoji,
  label,
  items,
  single,
}: {
  emoji: string;
  label: string;
  items?: readonly string[];
  single?: string;
}) {
  return (
    <div className="flex gap-1.5">
      <span className="text-base leading-normal">{emoji}</span>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold leading-normal text-brand-gray900">{label}</p>
        {single ? (
          <p className="text-sm leading-normal text-brand-gray800">{single}</p>
        ) : (
          <p className="text-sm leading-normal text-brand-gray800">{(items ?? []).join(' · ')}</p>
        )}
      </div>
    </div>
  );
}
