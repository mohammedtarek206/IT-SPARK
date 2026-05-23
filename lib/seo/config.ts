/** Central SEO & brand configuration for IT-SPARK */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://it-spark.com';

export const BRAND = {
  name: 'IT-SPARK',
  alternateName: ['IT Spark', 'IT Spark Academy', 'IT Spark Egypt', 'IT Spark Courses'],
  slogan: 'THERE IS MUCH MORE TO LEARN',
  taglineEn: 'Professional Technology Learning Platform',
  taglineAr:
    'منصة تعليمية احترافية لتعلم البرمجة، الذكاء الاصطناعي، تحليل البيانات، الأمن السيبراني، الشبكات، التصميم، والتسويق الرقمي',
  email: 'itspark2018@gmail.com',
  phone: '+201010710656',
  address: {
    streetAddress:
      'شارع المكتبات أعلي صيدلية منال الريفي، أبراج الزراعيين - برج أ، الدور الثاني',
    addressLocality: 'أسيوط',
    addressRegion: 'أسيوط',
    addressCountry: 'EG',
  },
} as const;

export const DEFAULT_KEYWORDS = [
  'IT Spark',
  'IT-SPARK',
  'IT Spark Academy',
  'IT Spark Courses',
  'IT Spark Egypt',
  'كورسات برمجة',
  'AI Courses',
  'Cyber Security',
  'React',
  'Angular',
  'Python',
  'ICDL',
  'CCNA',
  'THERE IS MUCH MORE TO LEARN',
];

export const HOME_METADATA = {
  title: 'IT-SPARK | Learn Programming, AI, Cyber Security & Tech Courses',
  description: BRAND.taglineAr,
  h1: 'IT-SPARK | THERE IS MUCH MORE TO LEARN',
  h2: 'أفضل منصة لتعلم البرمجة والذكاء الاصطناعي والأمن السيبراني',
};

export const SOCIAL_LINKS = {
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
  twitter: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  github: process.env.NEXT_PUBLIC_GITHUB_URL || '',
};

export const OG_IMAGE = '/logo.png';
export const LOGO_PATH = '/logo.png';

export function absoluteUrl(path: string = ''): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function socialProfiles(): string[] {
  return Object.values(SOCIAL_LINKS).filter(Boolean);
}
