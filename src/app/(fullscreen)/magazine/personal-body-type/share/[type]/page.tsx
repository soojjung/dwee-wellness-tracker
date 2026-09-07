import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShareLandingRedirect } from '@/components/diagnose/ShareLandingRedirect';
import type { PrimaryBodyType } from '@/types';

const TYPES = ['straight', 'wave', 'natural'] as const satisfies readonly PrimaryBodyType[];

// OG 카드 이미지가 한국어로 구워져 있어(Figma `Og 태그/문구_테스트 공유시`) 메타 문구도
// 한국어로 맞춘다. 루트 layout 의 앱 공용 OG 는 en 이지만, 여기서는 이미지와 어긋나는
// 쪽이 더 이상하다.
const OG_COPY: Record<PrimaryBodyType, { name: string; subtitle: string }> = {
  straight: { name: '스트레이트', subtitle: '탄탄하고 입체적인 실루엣의 균형 잡힌 체형' },
  wave: { name: '웨이브', subtitle: '곡선미가 돋보이는 부드럽고 섬세한 체형' },
  natural: { name: '내추럴', subtitle: '어깨와 골격이 비교적 뚜렷한 균형감 있는 체형' },
};

const SHARE_DESCRIPTION = '내 체형 분석해봤는데, 너도 해봐 👀 내 체형 1분만에 알아보기!';

function isBodyType(value: string): value is PrimaryBodyType {
  return (TYPES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return TYPES.map((type) => ({ type }));
}

interface SharePageProps {
  params: Promise<{ type: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isBodyType(type)) return {};

  const copy = OG_COPY[type];
  const title = `${copy.name} 체형`;
  const image = `/magazine/personal-body-type/og-${type}.png`;

  return {
    title,
    description: copy.subtitle,
    openGraph: {
      title,
      description: SHARE_DESCRIPTION,
      siteName: 'dwee',
      locale: 'ko_KR',
      type: 'article',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: SHARE_DESCRIPTION,
      images: [image],
    },
  };
}

export default async function BodyTypeSharePage({ params }: SharePageProps) {
  const { type } = await params;
  if (!isBodyType(type)) notFound();
  return <ShareLandingRedirect />;
}
