'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useT } from '@/i18n/useT';
import type { ArticleSection } from '@/data/magazine/articles';

interface ArticleSectionViewProps {
  section: ArticleSection;
}

export function ArticleSectionView({ section }: ArticleSectionViewProps) {
  const t = useT();
  switch (section.kind) {
    case 'paragraph':
      return <p className="text-sm leading-relaxed text-brand-gray800">{section.text}</p>;

    case 'heading':
      return <h2 className="mt-2 text-lg font-semibold text-brand-gray900">{section.text}</h2>;

    case 'list':
      return (
        <ul className="flex flex-col gap-1.5 pl-4 text-sm leading-relaxed text-brand-gray800">
          {section.items.map((item, i) => (
            <li key={i} className="list-disc marker:text-brand-pink200">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'image':
      return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-pink50">
          <Image
            src={section.src}
            alt={section.alt}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-contain p-4"
          />
        </div>
      );

    case 'callout':
      return (
        <p className="rounded-2xl bg-brand-pink50 p-4 text-sm leading-relaxed text-brand-gray800">
          {section.text}
        </p>
      );

    case 'cta':
      return (
        <div className="mt-6 flex flex-col gap-3">
          {section.lead ? (
            <p className="text-center text-base font-semibold leading-relaxed text-brand-gray900">{section.lead}</p>
          ) : null}
          <Link
            href={section.href}
            className="block rounded-2xl bg-brand-pink200 px-4 py-3.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-pink800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink200 focus-visible:ring-offset-2"
          >
            {section.label}
          </Link>
        </div>
      );

    case 'examples':
      return (
        <div className="grid grid-cols-2 gap-3">
          {section.items.map((ex) => (
            <figure
              key={ex.sourceUrl}
              className="flex flex-col overflow-hidden rounded-2xl bg-brand-pink50"
            >
              <div className="relative aspect-[3/4] w-full bg-brand-gray200">
                <Image
                  src={ex.image}
                  alt={ex.imageAlt}
                  fill
                  sizes="(max-width: 480px) 50vw, 240px"
                  className="object-cover"
                />
              </div>
              <figcaption className="flex flex-col gap-1.5 p-3">
                <span className="text-sm font-semibold text-brand-gray900">{ex.name}</span>
                <p className="text-xs leading-relaxed text-brand-gray800">{ex.reasoning}</p>
                <a
                  href={ex.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-medium text-brand-pink800 hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  {t.magazine.exampleSource}
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
      );
  }
}
