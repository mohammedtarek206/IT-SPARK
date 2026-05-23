import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';
import { BRAND, SOCIAL_LINKS } from '@/lib/seo/config';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <Image
                  src="/logo.png"
                  alt="IT-SPARK Logo — IT Spark Academy Egypt"
                  fill
                  className="object-contain"
                  sizes="64px"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground leading-tight" dir="ltr">
                  IT-SPARK
                </span>
                <span className="text-[10px] text-accent font-extrabold tracking-wider mt-1" dir="ltr">
                  THERE IS MUCH MORE TO LEARN
                </span>
              </div>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed" dir="rtl">
              {BRAND.taglineAr}
            </p>
            <p className="text-foreground/50 text-xs mt-2" dir="ltr">
              IT Spark · IT Spark Academy · IT Spark Courses · IT Spark Egypt
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">IT-SPARK</h3>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home — IT Spark
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-primary transition-colors">
                  IT Spark Courses
                </Link>
              </li>
              <li>
                <Link href="/training-courses" className="hover:text-primary transition-colors">
                  Trainings & Workshops
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-primary transition-colors">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-primary transition-colors">
                  Apply
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About IT-SPARK
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-primary transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/media" className="hover:text-primary transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-primary transition-colors">
                  Team
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact IT-SPARK</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center">
                <FiMail className="mr-2 text-accent shrink-0" aria-hidden />
                <a href={`mailto:${BRAND.email}`} className="hover:text-accent">
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-center">
                <FiPhone className="mr-2 text-accent shrink-0" aria-hidden />
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="hover:text-accent">
                  01010710656
                </a>
              </li>
              <li className="flex items-start">
                <FiMapPin className="mr-2 mt-1 text-accent shrink-0" aria-hidden />
                <span dir="rtl">{BRAND.address.streetAddress}، {BRAND.address.addressLocality}</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              {SOCIAL_LINKS.facebook ? (
                <a
                  href={SOCIAL_LINKS.facebook}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label="IT-SPARK on Facebook"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <FiFacebook className="w-5 h-5" />
                </a>
              ) : null}
              {SOCIAL_LINKS.twitter ? (
                <a
                  href={SOCIAL_LINKS.twitter}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label="IT-SPARK on Twitter"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <FiTwitter className="w-5 h-5" />
                </a>
              ) : null}
              {SOCIAL_LINKS.linkedin ? (
                <a
                  href={SOCIAL_LINKS.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label="IT-SPARK on LinkedIn"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <FiLinkedin className="w-5 h-5" />
                </a>
              ) : null}
              {SOCIAL_LINKS.github ? (
                <a
                  href={SOCIAL_LINKS.github}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label="IT-SPARK on GitHub"
                  className="text-gray-400 hover:text-accent transition-colors"
                >
                  <FiGithub className="w-5 h-5" />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary/20 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 gap-4">
          <p>
            © {year} <span dir="ltr">IT-SPARK</span> (IT Spark Academy). All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/privacy" className="hover:text-accent transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-accent transition-colors">
              Terms
            </Link>
            <a href="/sitemap.xml" className="hover:text-accent transition-colors">
              Sitemap
            </a>
            <a href="/llms.txt" className="hover:text-accent transition-colors">
              llms.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
