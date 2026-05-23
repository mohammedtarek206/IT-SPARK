import Link from 'next/link';
import { BRAND } from '@/lib/seo/config';

/** Crawlable internal links for brand & topical authority */
export default function InternalSeoNav() {
  const links = [
    { href: '/', label: 'IT-SPARK Home' },
    { href: '/courses', label: 'IT Spark Courses' },
    { href: '/training-courses', label: 'IT Spark Trainings' },
    { href: '/jobs', label: 'IT Spark Jobs' },
    { href: '/apply', label: 'Apply — IT-SPARK' },
    { href: '/about', label: 'About IT-SPARK' },
    { href: '/contact', label: 'Contact IT-SPARK' },
  ];

  return (
    <nav
      aria-label={`${BRAND.name} site navigation`}
      className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-4 focus:bg-background focus:border focus:border-primary rounded-lg"
    >
      <ul className="flex flex-wrap gap-3 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-primary hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
