import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/instructor/',
          '/dashboard/',
          '/learn/',
          '/checkout/',
          '/payment/',
          '/cart/',
          '/login',
          '/signup',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/courses', '/training-courses', '/about', '/jobs', '/apply'],
        disallow: ['/admin/', '/api/', '/dashboard/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
