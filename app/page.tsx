import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import About from '@/components/About';
import Reviews from '@/components/Reviews';
import Partners from '@/components/Partners';
import CTA from '@/components/CTA';
import FeaturedCourses from '@/components/FeaturedCourses';
import LatestVideos from '@/components/LatestVideos';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FeaturedCourses />
      <LatestVideos />
      <About />
      <Reviews />
      <Partners />
      <CTA />
    </>
  );
}
