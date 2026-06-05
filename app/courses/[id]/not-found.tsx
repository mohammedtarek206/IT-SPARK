import Link from 'next/link';
import { FiAlertCircle, FiArrowRight } from 'react-icons/fi';

export default function CourseNotFound() {
    return (
        <div className="min-h-[80vh] bg-background flex flex-col items-center justify-center p-4">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <FiAlertCircle className="text-5xl text-red-500" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4 tracking-tighter">
                Course Not Found
            </h1>
            <p className="text-foreground/60 text-center max-w-md mb-8 leading-relaxed font-medium">
                The course you are looking for does not exist, has been removed, or is temporarily unavailable.
            </p>
            <Link 
                href="/courses" 
                className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
                Browse All Courses <FiArrowRight />
            </Link>
        </div>
    );
}
