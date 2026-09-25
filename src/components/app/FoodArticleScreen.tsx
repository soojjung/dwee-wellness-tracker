'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/store/settingsStore';
import { useHistoryBackClick } from '@/hooks/useHistoryBackClick';
import { BackIcon } from '@/components/ui/icons';
import { foodArticle } from '@/content/foods';
import { splitBody } from '@/content/foods/splitBody';

interface FoodArticleScreenProps {
  /** `home.foods` 사전의 음식 id. 히어로 이미지 파일명도 같다. */
  id: string;
}

export function FoodArticleScreen({ id }: FoodArticleScreenProps) {
  const t = useT();
  const locale = useSettingsStore((s) => s.settings.locale);
  const article = foodArticle(id, locale);
  // 홈에서 들어온 경우 보던 위치로 돌아간다 (홈 쪽은 useScrollRestore 가 받는다).
  const handleBackClick = useHistoryBackClick();

  if (!article) return null;

  return (
    // 스크롤은 본문 컨테이너에서만 일어나고, 뒤로가기 버튼은 그 위에 띄워 둔다.
    // 바 전체가 아니라 버튼만 고정이라 본문이 버튼 아래로 흘러 지나간다 (Figma).
    <div className="relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-brand-gray50">
      {/* 노치 뒤로 지나가는 글자는 흰 판으로 가리지 않고 반투명 블러로만 흐려서
          본문이 비쳐 보이게 한다 — 시계·배터리는 읽히되 스크롤이 이어지는 느낌 (Figma).
          안전영역이 없는 기기에서는 높이 0 이라 아무것도 그려지지 않는다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[env(safe-area-inset-top,0px)] bg-brand-gray50/60 backdrop-blur-[2px]"
      />
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <Link
          href="/"
          data-swipe-back
          onClick={handleBackClick}
          aria-label={t.home.foodArticle.backAriaLabel}
          // DiaryCustomizeScreen 의 반투명 버튼과 같은 값 — 본문이 비쳐 보이도록
          // Gray/400 50% + 2px backdrop blur.
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-brand-gray400/50 text-brand-gray900 backdrop-blur-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <BackIcon className="size-10" />
        </Link>
      </header>

      {/* 상단 여백 68px = 버튼 위 12 + 버튼 40 + 버튼 아래 16. 버튼이 떠 있어도
          첫 화면에서 히어로가 버튼에 가려지지 않게 예전 바 높이만큼 비워 둔다. */}
      <div className="h-full overflow-y-auto pb-16 pt-[calc(68px+env(safe-area-inset-top,0px))]">
        {/* 히어로는 정사각 사진 카드 (Figma 358×358). 헤드라인은 사진에 굽지 않고
            텍스트로 얹어 locale 을 따르게 한다 — 가독성을 위해 아래쪽만 살짝 어둡게. */}
        <div className="px-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
            <Image
              src={`/home/foods/articles/${id}.webp`}
              alt=""
              width={716}
              height={716}
              className="size-full object-cover"
              priority
            />
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-gray900/55 to-brand-gray900/0 px-6 pb-6 pt-14 text-[22px] font-semibold leading-[1.4] text-brand-white">
              {article.headline}
            </p>
          </div>
        </div>

        <article className="flex flex-col gap-8 px-4 pt-8 text-brand-gray900">
          <header className="flex flex-col gap-3">
            <h1 className="text-xl font-semibold leading-[1.4]">{article.title}</h1>
            <p className="text-[15px] leading-[1.7] text-brand-gray800">{article.intro}</p>
          </header>

          {article.sections.map((section, i) => {
            const { lead, bullets } = splitBody(section.body);
            return (
              <section key={section.heading} className="flex flex-col gap-3">
                {/* 번호는 화면에서 매긴다 — 시안 원문은 붙은 곳과 안 붙은 곳이 섞여 있었다.
                    번호를 따로 두어 두 줄로 넘어가도 둘째 줄이 번호 뒤에서 시작한다. */}
                <h2 className="flex gap-[0.3em] text-lg font-semibold leading-[1.4]">
                  <span className="shrink-0">{i + 1}.</span>
                  <span>{section.heading}</span>
                </h2>
                {lead ? (
                  <p className="text-[15px] leading-[1.7] text-brand-gray800">{lead}</p>
                ) : null}
                {bullets.length > 0 ? (
                  <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-brand-gray600">
                    {bullets.map((b) => (
                      <li key={b.label} className="text-[15px] leading-[1.7] text-brand-gray800">
                        <span className="font-medium text-brand-gray900">{b.label}: </span>
                        {b.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}

          <section className="flex flex-col gap-5 rounded-2xl bg-brand-gray200 px-5 py-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-pink50 px-2.5 py-1 text-xs font-semibold text-brand-pink300">
                {t.home.foodArticle.tipChip}
              </span>
              <h2 className="text-base font-semibold leading-[1.4]">{article.tipTitle}</h2>
            </div>
            <ul className="flex flex-col gap-4">
              {article.tips.map((tip) => (
                <li key={tip.title} className="flex flex-col gap-1">
                  <p className="text-[15px] font-semibold leading-[1.4]">
                    <span aria-hidden>{tip.emoji} </span>
                    {tip.title}
                  </p>
                  <p className="pl-6 text-[14px] leading-[1.7] text-brand-gray800">{tip.body}</p>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-4">
            {article.closing.map((paragraph) => (
              <p key={paragraph} className="text-[15px] leading-[1.7] text-brand-gray800">
                {paragraph}
              </p>
            ))}
          </div>

          <p className="text-xs leading-[1.6] text-brand-gray600">
            {t.home.foodArticle.disclaimer}
          </p>
        </article>
      </div>
    </div>
  );
}
