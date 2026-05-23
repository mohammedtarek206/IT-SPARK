import { BRAND, SITE_URL, SOCIAL_LINKS, absoluteUrl, socialProfiles } from './config';
import { getCoursePath } from './slug';

export function organizationJsonLd() {
  const sameAs = socialProfiles();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND.name,
    alternateName: BRAND.alternateName,
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    image: absoluteUrl('/og-image.png'),
    slogan: BRAND.slogan,
    description: BRAND.taglineAr,
    email: BRAND.email,
    telephone: BRAND.phone,
    sameAs: sameAs.length ? sameAs : undefined,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BRAND.phone,
      contactType: 'customer service',
      email: BRAND.email,
      availableLanguage: ['Arabic', 'English'],
      areaServed: 'EG',
    },
  };
}

export function educationalOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}/#educational-organization`,
    name: BRAND.name,
    alternateName: BRAND.alternateName,
    url: SITE_URL,
    logo: absoluteUrl('/logo.png'),
    description: BRAND.taglineAr,
    slogan: BRAND.slogan,
    email: BRAND.email,
    telephone: BRAND.phone,
    sameAs: socialProfiles().length ? socialProfiles() : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'IT-SPARK Courses & Trainings',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Programming Courses' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'AI & Data Science' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Course', name: 'Cyber Security' } },
      ],
    },
  };
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#local-business`,
    name: BRAND.name,
    image: absoluteUrl('/logo.png'),
    url: SITE_URL,
    telephone: BRAND.phone,
    email: BRAND.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRAND.address.streetAddress,
      addressLocality: BRAND.address.addressLocality,
      addressRegion: BRAND.address.addressRegion,
      addressCountry: BRAND.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.1809,
      longitude: 31.1837,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '21:00',
    },
    sameAs: socialProfiles().length ? socialProfiles() : undefined,
  };
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: BRAND.name,
    alternateName: BRAND.alternateName,
    url: SITE_URL,
    description: BRAND.taglineAr,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/courses?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function courseJsonLd(course: {
  title: string;
  shortDescription?: string;
  description?: string;
  slug?: string | null;
  _id?: { toString(): string } | string;
  thumbnail?: string;
  price?: number;
  isFree?: boolean;
  category?: string;
  language?: string;
}) {
  const url = absoluteUrl(getCoursePath(course));
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription || course.description,
    url,
    provider: {
      '@type': 'Organization',
      name: BRAND.name,
      sameAs: SITE_URL,
    },
    image: course.thumbnail?.startsWith('http')
      ? course.thumbnail
      : course.thumbnail
        ? absoluteUrl(course.thumbnail)
        : absoluteUrl('/logo.png'),
    inLanguage: course.language || 'ar',
    courseMode: 'online',
    educationalLevel: course.category,
    offers: {
      '@type': 'Offer',
      price: course.isFree ? 0 : course.price ?? 0,
      priceCurrency: 'EGP',
      availability: 'https://schema.org/InStock',
      url,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export const globalSchemas = () => [
  organizationJsonLd(),
  educationalOrganizationJsonLd(),
  localBusinessJsonLd(),
  webSiteJsonLd(),
];
