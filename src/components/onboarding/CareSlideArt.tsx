'use client';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/cn';
import { FOOD_BOWL_IMAGE, activityVisual, foodVisual } from '@/data/homeImagery';

// Figma 832:5184 — 홈 화면의 황체기 콘텐츠(조언·키워드 카드·음식·활동)를 흩뿌린 콜라주.
// 문구는 전부 홈이 실제로 쓰는 황체기 사전 값이라 앱에서 보게 될 내용과 어긋나지 않는다.
const PHASE = 'luteal';

const ACTIVITY_CARDS = [
  {
    id: 'feelings-journal-l',
    card: 'bg-brand-gray300',
    badge: 'bg-brand-gray500',
    title: 'text-brand-gray900',
    body: 'text-brand-gray800',
  },
  {
    id: 'solo-walk-l',
    card: 'bg-brand-pink50',
    badge: 'bg-brand-pink100',
    title: 'text-brand-gray900',
    body: 'text-brand-gray800',
  },
  {
    id: 'breath-pause-l',
    card: 'bg-brand-gray900',
    badge: 'bg-brand-gray800',
    title: 'text-brand-gray50',
    body: 'text-brand-gray300',
  },
] as const;

// 그릇 사진 위 라벨의 중심 좌표 (무대 기준). 사진이 15° 기울어 있어 홈의 라벨 좌표를 못 쓴다.
const FOOD_LABELS = [
  { id: 'salmon-l', left: 214, top: 184 },
  { id: 'sweet-potato-l', left: 146, top: 224 },
  { id: 'banana-l', left: 331, top: 245 },
  { id: 'herbal-tea-l', left: 201, top: 256 },
  { id: 'avocado-l', left: 259, top: 277 },
] as const;

export function CareSlideArt() {
  const t = useT();
  const activities = t.home.activities[PHASE].items;
  const foods = t.home.foods[PHASE].items;
  const keyword = t.home.keywords[PHASE][0];
  const bowlImage = FOOD_BOWL_IMAGE[PHASE];

  return (
    <>
      <div className="absolute left-1/2 top-[356px] flex -translate-x-1/2 gap-[7px]">
        {ACTIVITY_CARDS.map((style) => {
          const item = activities.find((a) => a.id === style.id);
          if (!item) return null;
          return (
            <div
              key={style.id}
              className={cn(
                'flex w-[134px] shrink-0 flex-col items-start gap-[22px] rounded-[11px] p-[11px]',
                style.card,
              )}
            >
              <span
                className={cn(
                  'rounded-full px-[6px] py-[3px] text-[8.4px] font-medium leading-[normal] text-brand-gray50',
                  style.badge,
                )}
              >
                {item.durationMinutes}
                {t.home.durationSuffix}
              </span>
              <div className="flex flex-col gap-1">
                <p className={cn('text-[12.6px] font-semibold leading-normal', style.title)}>
                  {item.title} {activityVisual(item.id).emoji}
                </p>
                <p className={cn('text-[8.4px] leading-normal', style.body)}>{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute left-[38px] top-[76.6px] h-[124.6px] w-[252px] -rotate-[15deg] overflow-hidden rounded-[11px] bg-brand-gray400">
        <img src="/home/scratch-cover.png" alt="" className="h-full w-full object-cover" />
      </div>
      {keyword && (
        <div
          className="absolute left-[38px] top-[76.6px] flex h-[124.6px] w-[252px] -rotate-[15deg] flex-col items-center justify-center rounded-[11px] bg-brand-pink50 text-center text-brand-gray900"
          style={{
            maskImage: 'url(/onboarding/keyword-cloud.svg)',
            WebkitMaskImage: 'url(/onboarding/keyword-cloud.svg)',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: '42px 25.7px',
            WebkitMaskPosition: '42px 25.7px',
            maskSize: '200.4px 137.3px',
            WebkitMaskSize: '200.4px 137.3px',
          }}
        >
          {/* 카드는 기울어 있어도 글자는 시안처럼 수평으로 둔다. 구름은 카드 중심보다
              오른쪽에 있어서, 글자가 긴 언어(en)도 잘리지 않게 구름 가운데로 옮긴다. */}
          <div className="flex translate-x-[44px] translate-y-[14px] rotate-[15deg] flex-col gap-1">
            <p className="text-[11.2px] font-medium leading-normal">{keyword.subtitle}</p>
            <p className="text-[16.8px] font-semibold leading-normal">
              {keyword.main} {keyword.emoji}
            </p>
          </div>
        </div>
      )}

      <div className="absolute left-[69px] top-[17px] flex h-[98px] w-[251px] items-center justify-center">
        <div className="flex -rotate-[15deg] items-center gap-[10.5px] rounded-md bg-brand-gray200 px-[17px] py-[10px]">
          <p className="whitespace-nowrap text-[9.8px] font-semibold leading-[normal] text-brand-gray900">
            {t.home.phaseShortLabel[PHASE]}
          </p>
          <span className="h-3 w-px bg-brand-gray500" />
          <p className="w-[169px] text-[9.8px] leading-normal text-brand-gray800">
            {t.home.phaseAdvice[PHASE]}
          </p>
        </div>
      </div>

      {bowlImage && (
        <img
          src={bowlImage}
          alt=""
          draggable={false}
          className="absolute left-[139px] top-[172px] h-[162px] w-[190px] rotate-[15deg] select-none object-contain"
        />
      )}
      {FOOD_LABELS.map(({ id, left, top }) => {
        const item = foods.find((f) => f.id === id);
        if (!item) return null;
        return (
          <p
            key={id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rotate-[15deg] whitespace-nowrap rounded-full bg-brand-gray900 px-2 py-[5px] text-[7.68px] font-medium leading-[normal] text-brand-gray50"
            style={{ left, top }}
          >
            {item.name} {foodVisual(id).emoji}
          </p>
        );
      })}
    </>
  );
}
