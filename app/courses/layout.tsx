import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { BRAND } from '@/lib/seo/config';

export const metadata: Metadata = createPageMetadata({
  title: 'IT Spark Courses — Programming, AI & Cyber Security',
  description: `Browse ${BRAND.name} courses: programming, AI, cyber security, networks, design & digital marketing. Learn with IT Spark Academy Egypt.`,
  path: '/courses',
  keywords: ['IT Spark Courses', 'كورسات برمجة', 'AI Courses', 'Cyber Security', 'React', 'Python'],
});

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
