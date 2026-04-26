import DashboardMobileHeader from '@/components/student/DashboardMobileHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Student Dashboard | IT-SPARK',
    description: 'Track your learning progress, courses, and certificates.',
};

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Note: Middleware already protects /dashboard, so we assume the user is authenticated and is a student.
    return (
        <DashboardMobileHeader>
            {children}
        </DashboardMobileHeader>
    );
}
