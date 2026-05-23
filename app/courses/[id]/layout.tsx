import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import { findPublicCourse, getCoursePath } from '@/lib/seo/courseServer';
import { courseJsonLd, breadcrumbJsonLd } from '@/lib/seo/schema';
import StructuredData from '@/components/seo/StructuredData';
import { BRAND } from '@/lib/seo/config';

type Props = { params: { id: string }; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await findPublicCourse(params.id);
  if (!course) {
    return createPageMetadata({
      title: 'Course Not Found',
      description: `${BRAND.name} technology courses.`,
      path: `/courses/${params.id}`,
      noIndex: true,
    });
  }

  const path = getCoursePath(course);
  const title = `${course.title} — IT Spark Course`;
  const description =
    course.shortDescription ||
    `Learn ${course.title} with ${BRAND.name}. Professional tech education in Egypt.`;

  return createPageMetadata({
    title,
    description,
    path,
    keywords: [
      course.title,
      'IT Spark',
      'IT-SPARK',
      course.category || 'Programming',
      'كورسات برمجة',
    ],
    ogImage: course.thumbnail?.startsWith('http') ? course.thumbnail : undefined,
    type: 'article',
  });
}

export default async function CourseLayout({ params, children }: Props) {
  const course = await findPublicCourse(params.id);
  const schemas = course
    ? [
        courseJsonLd(course as Parameters<typeof courseJsonLd>[0]),
        breadcrumbJsonLd([
          { name: 'IT-SPARK', path: '/' },
          { name: 'Courses', path: '/courses' },
          { name: course.title, path: getCoursePath(course) },
        ]),
      ]
    : undefined;

  return (
    <>
      {schemas ? <StructuredData data={schemas} /> : null}
      {children}
    </>
  );
}
