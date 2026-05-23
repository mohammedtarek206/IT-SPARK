import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'IT Spark Jobs & Careers',
  description:
    'Join IT-SPARK team. Explore jobs and career opportunities at IT Spark Academy — technology education in Egypt.',
  path: '/jobs',
  keywords: ['IT Spark jobs', 'وظائف IT Spark', 'IT-SPARK careers'],
});

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
