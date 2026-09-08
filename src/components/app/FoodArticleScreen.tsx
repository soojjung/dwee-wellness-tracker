'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useT } from '@/i18n/useT';
import { BackIcon } from '@/components/ui/icons';
import { foodArticle } from '@/content/foods/articles-ko';
import { splitBody } from '@/content/foods/splitBody';

interface FoodArticleScreenProps {
  /** `home.foods` 사전의 음식 id. 히어로 이미지 파일명도 같다. */
  id: string;
}

export function FoodArticleScreen({ id }: FoodArticleScreenProps) {
  const t = useT();
  const article = foodArticle(id);

  if (!article) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-brand-gray50 pb-16">
      <header className="flex items-center px-4 pt-3">
        <Link
          href="/"
          aria-label={t.home.foodArticle.backAriaLabel}
          className="grid size-10 place-items-center rounded-full bg-brand-gray300 text-brand-gray900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gray400"
        >
          <BackIcon className="size-10" />
        </Link>
      </header>

      {/* 히어로는 헤드라인까지 구워진 정사각 카드다 (Figma 358×358). 코너 배경이
          페이지와 같은 색이라 라운딩이 자연스럽게 이어진다. */}
      <div className="mt-4 px-4">
        <Image
          src={`/home/foods/articles/${id}.webp`}
          alt=""
          width={716}
          height={716}
          className="aspect-square w-full rounded-2xl object-cover"
          priority
        />
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
              {/* 번호는 화면에서 매긴다 — 시안 원문은 붙은 곳과 안 붙은 곳이 섞여 있었다. */}
              <h2 className="text-lg font-semibold leading-[1.4]">
                {i + 1}. {section.heading}
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

        <p className="text-xs leading-[1.6] text-brand-gray600">{t.home.foodArticle.disclaimer}</p>
      </article>
    </div>
  );
}
