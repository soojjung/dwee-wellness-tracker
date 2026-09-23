'use client';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import type { BodyTypeReport, PrimaryBodyType } from '@/types';
import { HashtagRow } from './HashtagRow';
import { StyleGuideTab } from './StyleGuideTab';
import type { ResultCopy } from './reportCopy';

interface ReportViewProps {
  report: BodyTypeReport;
  /** 상단 고정바가 히어로를 벗어나 카드 위에 놓였는지 — 바 색을 바꾸는 데 쓴다. */
  onStuckChange?: (stuck: boolean) => void;
}

const TYPE_IMAGE: Record<PrimaryBodyType, string> = {
  straight: '/magazine/personal-body-type/straight-cutout.png',
  wave: '/magazine/personal-body-type/wave-cutout.png',
  natural: '/magazine/personal-body-type/natural-cutout.png',
};

type Tab = 'body' | 'style';

/** DiagnoseResultTopBar 의 높이(pt-3 + size-10 + 여백). 카드가 이 선을 넘으면 바 색이 바뀐다. */
const TOP_BAR_HEIGHT = 64;

export const ReportView = forwardRef<HTMLDivElement, ReportViewProps>(function ReportView(
  { report, onStuckChange },
  ref,
) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const r = t.magazine.diagnose.result;
  const [tab, setTab] = useState<Tab>('body');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const type = report.summary.primaryType;

  // 카드 최상단 1px 이 상단 고정바 아래로 들어가면 탭바가 고정된 상태다.
  // rootMargin 으로 뷰포트 상단을 바 높이만큼 깎아 기준선을 맞춘다.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setStuck(!entry.isIntersecting);
      },
      { rootMargin: `-${TOP_BAR_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onStuckChange?.(stuck);
  }, [stuck, onStuckChange]);

  return (
    <div ref={ref} className="flex flex-col bg-brand-gray900">
      <Hero
        typeName={r.typeName[type]}
        typeSuffix={r.typeSuffix}
        subtitle={r.typeSubtitle[type]}
        image={TYPE_IMAGE[type]}
      />

      <div className="relative z-10 -mt-10 flex flex-col gap-8 rounded-t-[40px] bg-brand-gray50 px-4 pb-[124px]">
        <div ref={sentinelRef} aria-hidden className="absolute inset-x-0 top-0 h-px" />

        {/* 탭은 본문과 함께 흘러간다. 상단에 고정하면 읽는 영역이 그만큼 줄어
            답답하다는 피드백이 있어 제자리에 둔다. */}
        <div className="pt-4">
          <TabPills active={tab} onChange={setTab} bodyLabel={r.bodyTab} styleLabel={r.styleTab} />
        </div>

        {tab === 'body' ? (
          <BodyTab report={report} r={r} />
        ) : (
          <StyleGuideTab type={type} locale={locale} r={r} />
        )}
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
          Clipped to a 260×372 box at the hero's right edge. Rendering the image
          at h-[700px] (natural width ~203px) with -top-[72px] crops it to roughly
          neck stub → mid-thigh, so the person reads at a moderate scale instead
          of filling the whole right side. */}
      <div className="pointer-events-none absolute right-0 top-0 h-[372px] w-[260px] overflow-hidden">
        <img
          src={image}
          alt=""
          className="absolute -top-[72px] right-0 h-[700px] w-auto max-w-none"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[calc(168px+env(safe-area-inset-top,0px))] bg-gradient-to-b from-brand-gray900 via-brand-gray900/80 to-transparent" />
      <div className="relative z-10 flex flex-col gap-2 px-4 pt-[calc(138px+env(safe-area-inset-top,0px))]">
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
