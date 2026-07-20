import { PhotoEditDetailScreen } from '@/components/home-customize/PhotoEditDetailScreen';
import { PHOTO_SLOTS, type PhotoSlot } from '@/domain/home/decor';

export const dynamicParams = false;

interface PageParams {
  params: Promise<{ slot: string }>;
}

export function generateStaticParams() {
  return PHOTO_SLOTS.map((s) => ({ slot: String(s) }));
}
// PHOTO_SLOTS is 0..6 so all count ranges (1→[0], 2→[1,2], 4→[3..6]) are covered.

export default async function EditPhotoDetailPage({ params }: PageParams) {
  const { slot } = await params;
  const parsed = Number(slot) as PhotoSlot;
  return <PhotoEditDetailScreen initialSlot={parsed} />;
}
