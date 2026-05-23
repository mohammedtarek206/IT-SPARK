import type { MetadataRoute } from 'next';
import { BRAND, SITE_URL } from '@/lib/seo/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.slogan}`,
    short_name: BRAND.name,
    description: BRAND.taglineAr,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#6366f1',
    lang: 'ar',
    dir: 'rtl',
    scope: '/',
    id: SITE_URL,
    icons: [
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['education', 'productivity'],
  };
}
