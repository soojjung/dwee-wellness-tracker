import { notFound } from 'next/navigation';
import { NoticeDetailScreen } from '@/components/my-page/NoticeDetailScreen';
import { NOTICE_SLUGS } from '@/content/notices';

export function generateStaticParams() {
  return NOTICE_SLUGS.map((slug) => ({ slug }));
}

interface NoticeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { slug } = await params;
  if (!NOTICE_SLUGS.includes(slug)) notFound();
  return <NoticeDetailScreen slug={slug} />;
}
