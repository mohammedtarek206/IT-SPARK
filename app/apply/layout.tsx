import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Apply — IT-SPARK Certificate & Programs',
  description:
    'Apply to IT-SPARK programs and certificate tracks. IT Spark Academy — professional tech education in Egypt.',
  path: '/apply',
});

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
