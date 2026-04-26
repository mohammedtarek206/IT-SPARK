import type { Metadata } from 'next';
import React from 'react';
import { Inter, Cairo } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'IT-SPARK | Excellence in Tech Education',
  description: 'IT-SPARK - The leading platform for programming and technology education. We offer certified courses in AI, Cybersecurity, Data Analysis, and more.',
  keywords: [
    'IT-SPARK', 'Programming', 'Technology', 'Beni Suef', 'Data analysis', 'Power bi',
    'Math', 'Science', 'UC math', 'Coding for Kids', 'AI', 'Graphic Design', 'Video Production',
    'Excel', 'Information Security', 'Soft skills', 'Certified Center', 'Marketing', 'ICDL',
    'Web Design', 'Networking', 'Cyber security'
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
    title: 'IT-SPARK | Excellence in Tech Education',
    description: 'Empowering the next generation of tech leaders. Professional courses in programming and AI.',
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
    title: 'IT-SPARK | Excellence in Tech Education',
    description: 'Tech education for youth and professionals.',
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
    google: '5HfQh42j4ifu715DCxeTmkymwCOR-nUvRqFGKZ7BYoE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <Navbar />
              <main className="min-h-screen pt-20">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
