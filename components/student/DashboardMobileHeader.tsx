'use client';

import React, { useState } from 'react';
import { FiMenu, FiBell } from 'react-icons/fi';
import StudentSidebar from './StudentSidebar';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardMobileHeader({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-surface border-b border-border flex items-center justify-between px-4 sticky top-0 z-[50] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-foreground/5 rounded-xl text-foreground/60 transition-colors"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-tighter">Arqam</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-foreground/5 rounded-xl text-foreground/40 transition-colors relative">
                        <FiBell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    </button>
                </div>
            </header>

            {/* Sidebar with state */}
            <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Content Area */}
            <main className="flex-1 lg:rtl:mr-72 lg:ltr:ml-72 min-h-screen pt-4 lg:pt-8 px-4 md:px-8 pb-12 transition-all">
                {children}
            </main>
        </div>
    );
}
