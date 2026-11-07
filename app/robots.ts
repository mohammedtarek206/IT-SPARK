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
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/courses',
          '/courses/',
          '/training-courses',
          '/training-courses/',
          '/jobs',
          '/apply',
          '/about',
          '/contact',
          '/login',
          '/signup',
          '/forgot-password',
          '/checkout',
          '/cart',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/instructor/',
          '/dashboard/',
          '/learn/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/courses', '/training-courses', '/about', '/jobs', '/apply'],
        disallow: ['/admin/', '/api/', '/dashboard/', '/instructor/', '/learn/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
