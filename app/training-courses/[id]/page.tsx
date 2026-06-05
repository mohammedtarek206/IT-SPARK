import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Training from '@/models/Training';
import Link from 'next/link';
import CourseCardMedia from '@/components/CourseCardMedia';
import { FiClock, FiMapPin, FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

export default async function TrainingDetailsPage({ params }: { params: { id: string } }) {
    try {
        await connectDB();
        const { id } = params;

        // Fetch offline training course
        const training = await Training.findById(id).lean();

        if (!training || !training.isActive) {
            notFound();
        }

        const isFree = training.isFree;
        const currentPrice = training.price || 0;

        return (
            <div className="min-h-screen bg-background pb-20">
                {/* Hero Section */}
                <div className="bg-slate-900 text-white pt-32 pb-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none" />
                    <div className="container mx-auto px-4 relative z-10 max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-[10px] font-black tracking-widest uppercase bg-primary/20 text-primary px-3 py-1 rounded-full mb-6 inline-block">
                                {training.type === 'Offline' ? 'حضوري / Offline' : 'أونلاين / Online'}
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                                {training.title}
                            </h1>
                            <p className="text-lg text-slate-300 font-medium mb-8 max-w-xl leading-relaxed">
                                {training.shortDescription}
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm font-bold text-slate-400">
                                {training.hours > 0 && (
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-primary text-xl" />
                                        <span>{training.hours} ساعة</span>
                                    </div>
                                )}
                                {training.days > 0 && (
                                    <div className="flex items-center gap-2">
                                        <FiCalendar className="text-primary text-xl" />
                                        <span>{training.days} أيام</span>
                                    </div>
                                )}
                                {training.location && (
                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="text-primary text-xl" />
                                        <span>{training.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 bg-slate-800 aspect-video relative">
                            <CourseCardMedia
                                thumbnail={training.thumbnail}
                                videoUrl={training.previewVideoUrl}
                                title={training.title}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-6 pb-4 border-b border-border">
                                وصف التدريب
                            </h2>
                            <p className="text-foreground/70 font-medium text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                                {training.description}
                            </p>
                        </div>
                        
                        {/* Features */}
                        <div className="bg-surface border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-6 pb-4 border-b border-border">
                                مميزات التدريب
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheckCircle className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/70 font-medium text-sm leading-relaxed">شهادة معتمدة بنهاية التدريب</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheckCircle className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/70 font-medium text-sm leading-relaxed">تطبيق عملي ومشاريع حقيقية</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheckCircle className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/70 font-medium text-sm leading-relaxed">إشراف وتوجيه من خبراء المجال</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FiCheckCircle className="text-primary text-sm" />
                                    </div>
                                    <p className="text-foreground/70 font-medium text-sm leading-relaxed">فرص حقيقية للتأهيل لسوق العمل</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Registration */}
                    <div className="space-y-6">
                        <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl sticky top-28">
                            <div className="text-center mb-8 border-b border-border pb-8">
                                <span className="block text-[10px] font-black uppercase text-foreground/40 mb-2">تكلفة الاستثمار</span>
                                <span className="text-4xl font-black text-foreground">
                                    {isFree ? 'مجاني' : `${currentPrice} EGP`}
                                </span>
                            </div>
                            
                            <ul className="space-y-4 mb-8">
                                <li className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-foreground/60">المجال</span>
                                    <span className="text-foreground">{training.category || 'عام'}</span>
                                </li>
                                <li className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-foreground/60">عدد الساعات</span>
                                    <span className="text-foreground">{training.hours} ساعة</span>
                                </li>
                                <li className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-foreground/60">الأيام</span>
                                    <span className="text-foreground">{training.days} أيام</span>
                                </li>

                            </ul>

                            <Link 
                                href={`/training-courses?apply=${id}`}
                                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
                            >
                                سجل الآن / Apply Now
                            </Link>
                            <p className="text-[10px] font-bold text-center text-foreground/40 mt-4 leading-tight">
                                سيتم توجيهك لنموذج التسجيل، لا تحتاج إلى إنشاء حساب.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (err) {
        console.error("Failed to fetch training data:", err);
        notFound();
    }
}
