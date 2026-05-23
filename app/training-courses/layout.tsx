import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'IT Spark Trainings & Workshops',
  description:
    'IT-SPARK professional trainings and workshops in programming, AI, cyber security, graphic design and networks — Assiut, Egypt.',
  path: '/training-courses',
  keywords: ['IT Spark Academy', 'تدريبات برمجة', 'ورش عمل', 'IT-SPARK trainings'],
});

export default function TrainingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
