'use client';
import { useRef, useState, type ComponentType } from 'react';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { BOTTOM_CTA_CLASS } from '@/components/ui/Button';
import { FitStage } from '@/components/ui/FitStage';
import { PageIndicator } from './PageIndicator';
import { RecordSlideArt } from './RecordSlideArt';
import { DiarySlideArt } from './DiarySlideArt';
import { CareSlideArt } from './CareSlideArt';

type SlideKey = 'record' | 'diary' | 'care';

// 시안(390×844)에서 일러스트가 차지하는 영역: 제목 아래(y=206)부터 하단 버튼 위(y=768)까지.
// 슬라이드 그림은 이 좌표계 그대로 배치한다.
const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 562;

// Figma 821:5119 · 832:5209 · 832:5184 (001_1~3).
const SLIDES: ReadonlyArray<{ key: SlideKey; Art: ComponentType }> = [
  { key: 'record', Art: RecordSlideArt },
  { key: 'diary', Art: DiarySlideArt },
  { key: 'care', Art: CareSlideArt },
];

interface OnboardingSlidesProps {
  /** 마지막 장의 "다음" 또는 "건너뛰기". */
  onFinish: () => void;
}

export function OnboardingSlides({ onFinish }: OnboardingSlidesProps) {
  const t = useT();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // 스와이프는 브라우저의 scroll-snap 에 맡기고, 여기서는 위치만 읽어 인디케이터를 맞춘다.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    setIndex(Math.round(scroller.scrollLeft / scroller.clientWidth));
  };

  const handleNext = () => {
    const scroller = scrollerRef.current;
    if (index >= SLIDES.length - 1 || !scroller) {
      onFinish();
      return;
    }
    scroller.scrollTo({ left: (index + 1) * scroller.clientWidth, behavior: 'smooth' });
  };

  return (
    <main className="relative mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-brand-gray50">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map(({ key, Art }) => (
          <section
            key={key}
            className="flex w-full shrink-0 snap-center snap-always flex-col pt-[calc(53px+env(safe-area-inset-top,0px))]"
          >
            <header className="flex flex-col gap-2 px-6 text-center">
              <p className="text-lg leading-[normal] text-brand-gray800">
                {t.onboarding.slides[key].eyebrow}
              </p>
              <h2 className="whitespace-pre-line text-xl font-semibold leading-normal text-brand-gray900">
                {t.onboarding.slides[key].title}
              </h2>
            </header>
            <div className="mt-4 flex min-h-0 flex-1 flex-col">
              <FitStage width={STAGE_WIDTH} height={STAGE_HEIGHT} decorative>
                <Art />
              </FitStage>
            </div>
          </section>
        ))}
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="absolute right-3 top-[calc(8px+env(safe-area-inset-top,0px))] rounded-sm px-3 py-2 text-sm leading-normal text-brand-gray600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200"
      >
        {t.onboarding.skip}
      </button>

      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 -top-[42px]">
          <PageIndicator count={SLIDES.length} index={index} />
        </div>
        <button
          type="button"
          onClick={handleNext}
          className={cn(BOTTOM_CTA_CLASS, 'bg-brand-gray900 text-brand-pink100')}
        >
          {t.onboarding.next}
        </button>
      </div>
    </main>
  );
}
