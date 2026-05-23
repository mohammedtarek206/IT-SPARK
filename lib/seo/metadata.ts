import type { Metadata } from 'next';
import {
  SITE_URL,
  BRAND,
  DEFAULT_KEYWORDS,
  OG_IMAGE,
  LOGO_PATH,
  absoluteUrl,
} from './config';

type PageMetaInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
};

export function createPageMetadata(input: PageMetaInput): Metadata {
  const path = input.path ?? '/';
  const canonical = absoluteUrl(path);
  const ogImage = input.ogImage || OG_IMAGE;
  const keywords = input.keywords ?? DEFAULT_KEYWORDS;
  const fullTitle = input.title.includes('IT-SPARK') ? input.title : `${input.title} | IT-SPARK`;

  return {
    title: fullTitle,
    description: input.description,
    keywords,
    authors: [{ name: BRAND.name, url: SITE_URL }],
    creator: BRAND.name,
    publisher: BRAND.name,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonical,
      siteName: BRAND.name,
      locale: 'ar_EG',
      alternateLocale: ['en_US'],
      type: input.type ?? 'website',
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage),
          width: 1200,
          height: 630,
          alt: `${BRAND.name} — ${BRAND.slogan}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: input.description,
      images: [ogImage.startsWith('http') ? ogImage : absoluteUrl(ogImage)],
      site: '@itspark',
      creator: '@itspark',
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    category: 'education',
    applicationName: BRAND.name,
    icons: {
      icon: LOGO_PATH,
      apple: LOGO_PATH,
    },
  };
}

export const rootMetadata: Metadata = {
  ...createPageMetadata({
    title: 'IT-SPARK | Learn Programming, AI, Cyber Security & Tech Courses',
    description:
      'IT-SPARK منصة تعليمية احترافية لتعلم البرمجة، الذكاء الاصطناعي، تحليل البيانات، الأمن السيبراني، الشبكات، التصميم، والتسويق الرقمي.',
    path: '/',
    keywords: DEFAULT_KEYWORDS,
  }),
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      'oRVk0XvDsJ1NeD_GU6zfg4O5q-YyQ9px4P5mwujrPzE',
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  other: {
    'ai-content-declaration': 'human-authored',
    'geo.region': 'EG-AST',
    'geo.placename': 'Assiut',
  },
};
