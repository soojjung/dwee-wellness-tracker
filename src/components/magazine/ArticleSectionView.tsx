'use client';
import Image from 'next/image';
import type { ArticleSection, ArticleExample } from '@/data/magazine/articles';

interface ArticleSectionViewProps {
  section: ArticleSection;
}

export function ArticleSectionView({ section }: ArticleSectionViewProps) {
  switch (section.kind) {
    case 'paragraph':
      return (
        <p className="px-4 text-base leading-relaxed text-brand-gray800">{section.text}</p>
      );

    case 'heading':
      return (
        <h2 className="px-4 text-xl font-semibold leading-normal text-brand-gray900">
          {section.text}
        </h2>
      );

    case 'list':
      return (
        <ul className="flex flex-col gap-1.5 px-4 pl-8 text-base leading-relaxed text-brand-gray800">
          {section.items.map((item, i) => (
            <li key={i} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      );

    case 'examples':
      return <ExamplesRow items={section.items} />;
  }
}

function ExamplesRow({ items }: { items: readonly ArticleExample[] }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="flex gap-2 px-4 pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {items.map((ex) => (
          <figure
            key={ex.name}
            className="relative aspect-square w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl bg-brand-gray200"
          >
            <Image
              src={ex.image}
              alt={ex.imageAlt}
              fill
              sizes="260px"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-black/60" />
            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
              <span className="text-base font-medium text-brand-gray50">{ex.name}</span>
              <p className="text-sm leading-snug text-brand-gray300">{ex.reasoning}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
