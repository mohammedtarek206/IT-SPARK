export default function CourseCardSkeleton() {
    return (
        <div className="flex flex-col bg-surface border border-border rounded-[2rem] overflow-hidden shadow-lg animate-pulse w-full h-[400px]">
            <div className="w-full h-[200px] bg-slate-800" />
            <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="h-6 w-3/4 bg-slate-800 rounded-lg" />
                <div className="h-4 w-full bg-slate-800 rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-800 rounded-lg" />
                <div className="mt-auto flex justify-between items-center">
                    <div className="h-6 w-16 bg-slate-800 rounded-lg" />
                    <div className="h-8 w-24 bg-slate-800 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
