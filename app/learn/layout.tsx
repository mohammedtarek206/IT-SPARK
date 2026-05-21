import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata: Metadata = {
    title: 'IT-SPARK | Course Player',
    description: 'Watch your course lectures on IT-SPARK',
};

// This layout deliberately removes the Navbar and Footer
// so the learn page can be a full-screen immersive experience like Udemy
export default function LearnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    {/* No Navbar, no Footer, no pt-20 — full screen app */}
                    <div className="min-h-screen bg-background">
                        {children}
                    </div>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
