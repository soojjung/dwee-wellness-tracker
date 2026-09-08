'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';
import { foodArticle } from '@/content/foods/articles-ko';
import { FOOD_BOWL_IMAGE, foodVisual } from '@/data/homeImagery';

interface FoodArticleScreenProps {
  /** `home.foods` 사전의 음식 id. */
  id: string;
  /** 히어로에 쓸 주기 사진. 음식 id 의 suffix 로 정한다. */
  phase: string | null;
}

export function FoodArticleScreen({ id, phase }: FoodArticleScreenProps) {
  const t = useT();
  const article = foodArticle(id);
  const hero = phase ? FOOD_BOWL_IMAGE[phase] : undefined;

  if (!article) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-brand-gray50 pb-16">
      <div className="flex items-center px-4 pt-3">
        <Link
          href="/"
          aria-label={t.home.foodArticle.backAriaLabel}
          className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <BackIcon className="size-10" />
        </Link>
      </div>

      {hero ? (
        <div className="mt-2 flex justify-center px-4">
          <Image src={hero} alt="" width={280} height={240} className="h-[200px] w-auto object-contain" />
        </div>
      ) : null}

      <article className="flex flex-col gap-8 px-5 pt-4 text-brand-gray900">
        <header className="flex flex-col gap-3">
          <span className="text-3xl leading-none" aria-hidden>
            {foodVisual(id).emoji}
          </span>
          <h1 className="text-2xl font-semibold leading-[1.35]">{article.title}</h1>
          <p className="text-[15px] leading-[1.7] text-brand-gray800">{article.intro}</p>
        </header>

        <div className="flex flex-col gap-6">
          {article.sections.map((section, i) => (
            <section key={section.heading} className="flex flex-col gap-2">
              {/* 번호는 여기서 매긴다 — 시안 원문은 붙은 곳과 안 붙은 곳이 섞여 있었다. */}
              <h2 className="text-lg font-semibold leading-[1.4]">
                <span className="text-brand-pink300">{i + 1}. </span>
                {section.heading}
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-[1.7] text-brand-gray800">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <section className="flex flex-col gap-4 rounded-2xl bg-brand-pink50 px-5 py-6">
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-full bg-brand-gray900 px-3 py-1 text-xs font-semibold text-brand-white">
              {t.home.foodArticle.tipChip}
            </span>
            <h2 className="mt-2 text-lg font-semibold leading-[1.4]">{article.tipTitle}</h2>
          </div>
          <ul className="flex flex-col gap-4">
            {article.tips.map((tip) => (
              <li key={tip.title} className="flex flex-col gap-1 rounded-2xl bg-brand-white px-4 py-4">
                <p className="text-base font-semibold leading-[1.4]">
                  <span aria-hidden>{tip.emoji} </span>
                  {tip.title}
                </p>
                <p className="text-[14px] leading-[1.7] text-brand-gray800">{tip.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-[15px] leading-[1.7] text-brand-gray800">{article.closing}</p>

        <p className="text-xs leading-[1.6] text-brand-gray600">
          {t.home.foodArticle.disclaimer}
        </p>
      </article>
    </div>
  );
}
