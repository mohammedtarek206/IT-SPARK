import React from 'react';

export default function CourseCardSkeleton() {
    return (
        <div className="bg-surface rounded-2xl overflow-hidden border border-white/5 animate-pulse flex flex-col h-full">
            <div className="w-full aspect-video bg-white/5"></div>
            <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="w-1/3 h-3 bg-white/5 rounded-full mb-1"></div>
                <div className="w-full h-5 bg-white/5 rounded-md"></div>
                <div className="w-2/3 h-5 bg-white/5 rounded-md mb-2"></div>
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/5"></div>
                        <div className="w-16 h-4 bg-white/5 rounded-md mt-1"></div>
                    </div>
                    <div className="w-12 h-5 bg-white/5 rounded-md"></div>
                </div>
            </div>
        </div>
    );
}
