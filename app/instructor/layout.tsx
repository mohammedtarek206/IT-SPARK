'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import InstructorMobileHeader from '@/components/instructor/InstructorMobileHeader';

export default function InstructorDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!user || (user.role !== 'instructor' && user.role !== 'admin')) {
        router.push('/login');
        return null;
    }

    return (
        <InstructorMobileHeader>
            {children}
        </InstructorMobileHeader>
    );
}
