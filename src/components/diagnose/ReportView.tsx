'use client';
import { forwardRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import type { BodyTypeReport, PrimaryBodyType, StyleSection } from '@/types';

interface ReportViewProps {
  report: BodyTypeReport;
  onRetry: () => void;
}

const TYPE_IMAGE: Record<PrimaryBodyType, string> = {
  straight: '/magazine/personal-body-type/straight-cutout.png',
  wave: '/magazine/personal-body-type/wave-cutout.png',
  natural: '/magazine/personal-body-type/natural-cutout.png',
};

type Tab = 'body' | 'style';
type ResultCopy = ReturnType<typeof useT>['magazine']['diagnose']['result'];

export const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(function ReportView(
  { report, onRetry },
  ref,
) {
  const t = useT();
  const r = t.magazine.diagnose.result;
  const [tab, setTab] = useState<Tab>('body');
  const type = report.summary.primaryType;

  return (
    <div ref={ref} className="flex flex-col bg-brand-gray900">
      <Hero
        typeName={r.typeName[type]}
        typeSuffix={r.typeSuffix}
        subtitle={r.typeSubtitle[type]}
        image={TYPE_IMAGE[type]}
      />

      <div className="relative z-10 -mt-10 flex flex-col gap-8 rounded-t-[40px] bg-brand-gray50 px-4 pb-14 pt-4">
        <TabPills active={tab} onChange={setTab} bodyLabel={r.bodyTab} styleLabel={r.styleTab} />

        {tab === 'body' ? (
          <BodyTab report={report} r={r} />
        ) : (
          <StyleTab report={report} r={r} type={type} />
        )}

        <RetryButton label={r.tryAgain} onClick={onRetry} />
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
    <div className="relative h-[372px] w-full overflow-hidden">
      {/* Cutout portrait sized against Figma: source is 401×1382 (very tall).
          Rendered at h-[720px] the natural width is ~209px, so the person
          appears at a moderate scale (not filling the whole right side).
          Top offset -[130px] shifts the head out of frame; combined with
          h-[322px] the crop lands at roughly neck stub → mid-thigh, matching
          the reference. The box stops 8px shy of the hero bottom to keep
          clearance for the white card's rounded-corner overlap. */}
      <div className="pointer-events-none absolute right-0 top-0 h-[372px] w-[260px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="absolute -top-[72px] right-0 h-[700px] w-auto max-w-none"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[168px] bg-gradient-to-b from-brand-gray900 via-brand-gray900/80 to-transparent" />
      <div className="relative z-10 flex flex-col gap-2 px-4 pt-[138px]">
        <h1 className="text-2xl font-semibold leading-normal text-brand-gray50">
          {typeName} {typeSuffix}
        </h1>
        <p className="whitespace-pre-line text-base leading-normal text-brand-gray500">
          {subtitle}
        </p>
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
      className={`flex flex-1 items-center justify-center rounded-full px-4 py-2.5 text-lg leading-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200 ${
        active
          ? 'bg-brand-pink50 font-semibold text-brand-gray900'
          : 'font-normal text-brand-gray500'
      }`}
    >
      {label}
    </button>
  );
}

function BodyTab({ report, r }: { report: BodyTypeReport; r: ResultCopy }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold leading-normal text-brand-gray900">
          {r.keyTraitsTitle}
        </h2>
        <ul className="flex flex-col gap-1">
          {report.summary.keyTraits.map((trait, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-base leading-normal text-brand-gray900"
            >
              <span aria-hidden className="shrink-0 leading-normal">
                🧍🏻‍♀️
              </span>
              <span>{trait}</span>
            </li>
          ))}
        </ul>
        <HashtagRow items={report.summary.keywords} />
      </section>

      <Section title={r.frameTitle}>
        <Paragraph
          parts={[report.frame.boneVisibility, report.frame.shoulders, report.frame.collarbones]}
        />
      </Section>
      <Section title={r.textureTitle}>
        <Paragraph parts={[report.frame.skinTexture, report.frame.muscleTone]} />
      </Section>
      <Section title={r.lineTitle}>
        <Paragraph parts={[report.frame.waistPosition, report.frame.hipPosition]} />
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
      <Section title={r.centerTitle}>
        <Paragraph parts={[report.frame.centerOfGravity]} />
      </Section>
    </div>
  );
}

function StyleTab({
  report,
  r,
  type,
}: {
  report: BodyTypeReport;
  r: ResultCopy;
  type: PrimaryBodyType;
}) {
  return (
    <div className="flex flex-col gap-8">
      <StyleSummaryBlock
        headline={r.styleSummary.headline[type]}
        points={r.styleSummary.points[type]}
        hashtags={r.styleSummary.hashtags[type]}
      />

      <CategoryStrip title={r.styleGuideTitle}>
        <StyleCard label={r.styleGuideTops} section={report.styleGuide.tops} r={r} />
        <StyleCard label={r.styleGuideBottoms} section={report.styleGuide.bottoms} r={r} />
        <StyleCard label={r.styleGuideDresses} section={report.styleGuide.dresses} r={r} />
        <StyleCard label={r.styleGuideOuterwear} section={report.styleGuide.outerwear} r={r} />
      </CategoryStrip>

      <CategoryStrip title={r.styleCategoryTitle}>
        <StyleCard
          label={r.materialsTitle}
          section={{
            recommended: report.materials.recommended,
            avoid: report.materials.avoid,
            reason: report.materials.reason,
          }}
          r={r}
        />
        <StyleCard
          label={r.fitCriteriaTitle}
          section={{
            recommended: report.fitCriteria.good,
            avoid: report.fitCriteria.bad,
            reason: report.fitCriteria.reason,
          }}
          r={r}
        />
      </CategoryStrip>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold leading-normal text-brand-gray900">
          {r.detailsTitle}
        </h2>
        <DetailsGrid
          items={[
            { label: r.detailsNeckline, value: report.details.neckline },
            { label: r.detailsSleeves, value: report.details.sleeves },
            { label: r.detailsWaistDetail, value: report.details.waistDetail },
            { label: r.detailsLength, value: report.details.length },
          ]}
        />
      </section>
    </div>
  );
}

function StyleSummaryBlock({
  headline,
  points,
  hashtags,
}: {
  headline: string;
  points: readonly string[];
  hashtags: readonly string[];
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold leading-normal text-brand-gray900">
        &ldquo;{headline}&rdquo;
      </h2>
      <ul className="flex flex-col gap-1">
        {points.map((p, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-base leading-normal text-brand-gray900"
          >
            <span aria-hidden className="shrink-0 leading-normal">
              👚
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <HashtagRow items={hashtags} />
    </section>
  );
}

function CategoryStrip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold leading-normal text-brand-gray900">{title}</h2>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {children}
      </div>
    </section>
  );
}

function StyleCard({ label, section, r }: { label: string; section: StyleSection; r: ResultCopy }) {
  return (
    <div className="flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl bg-brand-gray100 p-5">
      <p className="text-lg font-semibold leading-normal text-brand-gray900">{label}</p>
      <StyleBlock emoji="💚" label={r.recommendedLabel} items={section.recommended} />
      <div className="h-px bg-brand-gray200" />
      <StyleBlock emoji="💔" label={r.avoidLabel} items={section.avoid} />
      {section.reason && (
        <div className="flex gap-1.5 text-xs leading-normal text-brand-gray600">
          <span aria-hidden className="shrink-0">
            →
          </span>
          <span>{section.reason}</span>
        </div>
      )}
    </div>
  );
}

function StyleBlock({
  emoji,
  label,
  items,
}: {
  emoji: string;
  label: string;
  items: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold leading-normal text-brand-gray900">
        <span aria-hidden>{emoji}</span>
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full bg-brand-gray50 px-2.5 py-1 text-xs leading-normal text-brand-gray800"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailsGrid({ items }: { items: readonly { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-1 rounded-2xl bg-brand-gray100 p-4">
          <span className="text-xs font-medium leading-normal text-brand-gray600">
            {item.label}
          </span>
          <span className="text-sm leading-normal text-brand-gray900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function HashtagRow({ items }: { items: readonly string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full border border-brand-gray300 px-2.5 py-1.5 text-xs font-medium leading-normal text-brand-gray800"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold leading-normal text-brand-gray900">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Paragraph({ parts }: { parts: readonly string[] }) {
  const text = parts.filter((p) => p && p.trim().length > 0).join(' ');
  return <p className="text-base leading-normal text-brand-gray800">{text}</p>;
}

function RetryButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="flex justify-center pt-2">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 rounded-full border border-brand-gray400 bg-brand-gray50 px-7 py-4 text-base font-medium leading-normal text-brand-gray900 hover:bg-brand-gray100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        <RefreshIcon />
        {label}
      </button>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-4"
    >
      <path d="M14 8a6 6 0 0 1-10.24 4.24" />
      <path d="M2 8a6 6 0 0 1 10.24-4.24" />
      <path d="M11 5H14V2" />
      <path d="M5 11H2V14" />
    </svg>
  );
}
