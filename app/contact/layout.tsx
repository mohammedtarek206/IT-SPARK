import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Contact IT-SPARK',
  description: 'Contact IT Spark Academy — Assiut, Egypt. Courses, trainings & support.',
  path: '/contact',
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
