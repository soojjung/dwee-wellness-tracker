import type { ReactNode } from 'react';
import { CustomizeDraftGuard } from '@/components/home-customize/CustomizeDraftGuard';

export default function CustomizeLayout({ children }: { children: ReactNode }) {
  return <CustomizeDraftGuard>{children}</CustomizeDraftGuard>;
}
