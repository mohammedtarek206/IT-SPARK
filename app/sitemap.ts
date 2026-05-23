import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { SITE_URL } from '@/lib/seo/config';
import { backfillMissingSlugs, getCoursePath } from '@/lib/seo/courseServer';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1, lastModified: new Date() },
    { url: `${baseUrl}/courses`, changeFrequency: 'daily', priority: 0.95, lastModified: new Date() },
    { url: `${baseUrl}/training-courses`, changeFrequency: 'daily', priority: 0.9, lastModified: new Date() },
    { url: `${baseUrl}/jobs`, changeFrequency: 'weekly', priority: 0.85, lastModified: new Date() },
    { url: `${baseUrl}/apply`, changeFrequency: 'monthly', priority: 0.75, lastModified: new Date() },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.8, lastModified: new Date() },
    { url: `${baseUrl}/pricing`, changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${baseUrl}/partners`, changeFrequency: 'monthly', priority: 0.65, lastModified: new Date() },
    { url: `${baseUrl}/projects`, changeFrequency: 'weekly', priority: 0.7, lastModified: new Date() },
    { url: `${baseUrl}/team`, changeFrequency: 'monthly', priority: 0.65, lastModified: new Date() },
    { url: `${baseUrl}/media`, changeFrequency: 'weekly', priority: 0.6, lastModified: new Date() },
  ];

  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    if (process.env.MONGODB_URI) {
      await backfillMissingSlugs();
      await connectDB();
      const courses = await Course.find({ isActive: true, status: 'published' })
        .select('slug title _id updatedAt')
        .lean();

      courseRoutes = courses.map((course) => ({
        url: `${baseUrl}${getCoursePath(course)}`,
        lastModified: course.updatedAt || new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error('Sitemap: course fetch error', error);
  }

  return [...staticRoutes, ...courseRoutes];
}
