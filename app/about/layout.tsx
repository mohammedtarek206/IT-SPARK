import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { BRAND } from '@/lib/seo/config';

export const metadata: Metadata = createPageMetadata({
  title: 'About IT-SPARK Academy',
  description: `Learn about ${BRAND.name} — ${BRAND.taglineAr}`,
  path: '/about',
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
