import { getStyleGuideContent } from '@/data/bodyType/styleGuide';
import type { Locale, PrimaryBodyType, StyleGuideCategory, StyleGuideGroup } from '@/types';
import { HashtagRow } from './HashtagRow';
import type { ResultCopy } from './reportCopy';

interface StyleGuideTabProps {
  type: PrimaryBodyType;
  locale: Locale;
  r: ResultCopy;
}

/**
 * 결과 화면 "스타일 가이드" 탭. 유형별 고정 콘텐츠라 리포트를 받지 않는다 —
 * 사진마다 달라지는 건 체형 탭뿐이다. Figma 522-8571 / 522-9391 / 522-10258.
 */
export function StyleGuideTab({ type, locale, r }: StyleGuideTabProps) {
  const g = getStyleGuideContent(type, locale);
  return (
    <div className="flex flex-col gap-8">
      <StyleSummaryBlock
        headline={r.styleSummary.headline[type]}
        points={r.styleSummary.points[type]}
        hashtags={r.styleSummary.hashtags[type]}
      />

      <CategoryStrip title={r.styleGuideTitle}>
        <StyleCard label={r.styleGuideTops} category={g.tops} r={r} />
        <StyleCard label={r.styleGuideBottoms} category={g.bottoms} r={r} />
        <StyleCard label={r.styleGuideDresses} category={g.dresses} r={r} />
        <StyleCard label={r.styleGuideOuterwear} category={g.outerwear} r={r} />
      </CategoryStrip>

      <CategoryStrip title={r.styleCategoryTitle}>
        <StyleCard label={r.materialsTitle} category={g.materials} r={r} />
        <StyleCard label={r.fitTitle} category={g.fit} r={r} />
      </CategoryStrip>

      <CategoryStrip title={r.detailsTitle}>
        <StyleCard label={r.detailsNeckline} category={g.neckline} r={r} />
        <StyleCard label={r.detailsSleeves} category={g.sleeves} r={r} />
        <StyleCard label={r.detailsLength} category={g.length} r={r} />
        <StyleCard label={r.detailsPattern} category={g.pattern} r={r} />
        <StyleCard label={r.detailsDecoration} category={g.decoration} r={r} />
      </CategoryStrip>
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
    <section className="flex flex-col gap-2">
      <h2 className="text-xl font-semibold leading-normal text-brand-gray900">{title}</h2>
      {/* snap 은 padding 이 아니라 scroll-padding 을 기준선으로 삼는다. scroll-pl 이
          없으면 첫 카드가 왼쪽 끝에 붙어 섹션 제목과 여백이 어긋난다. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2">
        {children}
      </div>
    </section>
  );
}

function StyleCard({
  label,
  category,
  r,
}: {
  label: string;
  category: StyleGuideCategory;
  r: ResultCopy;
}) {
  return (
    <div className="flex w-[330px] shrink-0 snap-start flex-col gap-6 rounded-2xl bg-brand-gray200 px-5 pb-8 pt-5">
      <p className="text-xl font-semibold leading-normal text-brand-gray900">{label}</p>
      <StyleBlock emoji="💚" label={r.recommendedLabel} groups={category.good} />
      <div className="h-px bg-brand-gray300" />
      <StyleBlock emoji="💔" label={r.avoidLabel} groups={category.avoid} />
    </div>
  );
}

function StyleBlock({
  emoji,
  label,
  groups,
}: {
  emoji: string;
  label: string;
  groups: readonly StyleGuideGroup[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-1 text-lg font-semibold leading-normal text-brand-gray900">
        <span aria-hidden>{emoji}</span>
        {label}
      </p>
      {groups.map((group, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1">
            {group.items.map((item, j) => (
              <span
                key={j}
                className="inline-flex items-center rounded-full bg-brand-gray50 px-[11px] py-1.5 text-sm font-medium leading-normal text-brand-gray900"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="flex gap-1.5 text-sm leading-normal text-brand-gray800">
            <span aria-hidden className="shrink-0">
              →
            </span>
            <span>{group.reason}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
