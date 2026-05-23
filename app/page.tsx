import type { Metadata } from 'next';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import About from '@/components/About';
import Features from '@/components/Features';
import Reviews from '@/components/Reviews';
import Partners from '@/components/Partners';
import CTA from '@/components/CTA';
import FeaturedCourses from '@/components/FeaturedCourses';
import LatestVideos from '@/components/LatestVideos';
import { createPageMetadata } from '@/lib/seo/metadata';
import { HOME_METADATA } from '@/lib/seo/config';

export const metadata: Metadata = createPageMetadata({
  title: HOME_METADATA.title,
  description: HOME_METADATA.description,
  path: '/',
  keywords: [
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
  ],
});

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedCourses />
      <LatestVideos />
      <About />
      <Features />
      <Reviews />
      <Partners />
      <CTA />
    </>
  );
}
