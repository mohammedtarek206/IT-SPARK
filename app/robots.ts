import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/instructor/', '/dashboard/'],
        },
        sitemap: 'https://it-spark.com/sitemap.xml',
    };
}
