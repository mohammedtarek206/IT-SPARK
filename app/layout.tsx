import type { Metadata } from 'next';
import React from 'react';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/ToastContainer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'IT-SPARK | THERE IS MUCH MORE TO LEARN',
  description: 'IT-SPARK تقدم أفضل الكورسات والتدريبات الاحترافية في البرمجة، الذكاء الاصطناعي، الأمن السيبراني، تحليل البيانات، الشبكات، الجرافيك، وتطوير التطبيقات.',
  keywords: [
    'IT-SPARK',
    'IT SPARK Academy',
    'THERE IS MUCH MORE TO LEARN',
    'كورسات برمجة',
    'Cyber Security',
    'AI Courses',
    'React Courses',
    'دورات ذكاء اصطناعي',
    'تحليل البيانات',
    'Full Stack',
    'تعلم البرمجة',
    'كورسات تكنولوجيا'
  ],
  authors: [{ name: 'IT-SPARK' }],
  creator: 'IT-SPARK',
  publisher: 'IT-SPARK',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://it-spark.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'IT-SPARK | THERE IS MUCH MORE TO LEARN',
    description: 'Professional Technology Courses & Training Platform.',
    url: 'https://it-spark.com',
    siteName: 'IT-SPARK',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'IT-SPARK Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IT-SPARK | THERE IS MUCH MORE TO LEARN',
    description: 'Professional Technology Academy & Courses Platform.',
    images: ['/logo.png'],
  },
  robots: {
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
  verification: {
    google: 'oRVk0XvDsJ1NeD_GU6zfg4O5q-YyQ9px4P5mwujrPzE',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'IT-SPARK',
  slogan: 'THERE IS MUCH MORE TO LEARN',
  description: 'Professional Technology Learning Platform',
  url: 'https://it-spark.com',
  logo: 'https://it-spark.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '01010710656',
    contactType: 'customer service',
    email: 'itspark2018@gmail.com'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${inter.className} overflow-x-hidden`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="min-h-screen pt-16 lg:pt-20">
                {children}
              </main>
              <Footer />
              <ToastContainer />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
