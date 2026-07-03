'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiEye, FiAward, FiUsers, FiStar, FiGlobe, FiPhone } from 'react-icons/fi';
import { FiFacebook, FiYoutube, FiInstagram } from 'react-icons/fi';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-dark pt-32 pb-20 overflow-hidden">

            {/* Hero Section */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto mb-20 relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

                <div className="max-w-4xl text-center mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[1.1] mb-6">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">IT-SPARK</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium leading-relaxed" dir="rtl">
                        شركة تدريب تأسست عام 2017، تقدم التدريب في المجالات التكنولوجية واللغات للكبار والأطفال. نهدف إلى سد الفجوة بين التعليم النظري ومتطلبات سوق العمل من خلال برامج تدريبية عملية ومبتكرة.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 pt-16 border-t border-white/5">
                    {[
                        { label: 'سنة التأسيس', value: '2017' },
                        { label: 'طالب وطالبة', value: '+10,000' },
                        { label: 'مجال تدريبي', value: '+25' },
                        { label: 'نسبة النجاح', value: '98%' },
                    ].map((stat, i) => (
                        <div key={i} className="text-center bg-white/5 border border-white/5 p-6 rounded-3xl">
                            <p className="text-3xl md:text-4xl font-black text-white">{stat.value}</p>
                            <p className="text-sm font-bold text-primary uppercase tracking-widest mt-2" dir="rtl">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-8 mb-32">
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="glass p-8 md:p-12 rounded-[3rem] border border-white/5 group hover:border-primary/30 transition-all flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                            <FiEye className="text-4xl text-primary" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4" dir="rtl">رؤيتنا (Vision)</h2>
                        <p className="text-gray-400 font-medium leading-relaxed text-lg" dir="rtl">
                            أن تصبح IT-SPARK أكاديمية عالمية تقدم خدمات التدريب وتكنولوجيا المعلومات في العديد من المواقع المختلفة حول العالم.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="glass p-8 md:p-12 rounded-[3rem] border border-white/5 group hover:border-accent/30 transition-all flex flex-col items-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                            <FiTarget className="text-4xl text-accent" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4" dir="rtl">رسالتنا (Mission)</h2>
                        <p className="text-gray-400 font-medium leading-relaxed text-lg" dir="rtl">
                            إرضاء العملاء من خلال فريق عمل يمتلك الخبرة والقدرة والحماس باستخدام أحدث التقنيات لضمان أعلى مستويات الجودة والاحترافية.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Accreditations & Achievements */}
            <section className="bg-black/30 py-20 border-y border-white/5 mb-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Accreditations & Achievements</h2>
                        <p className="text-gray-400 font-medium text-lg" dir="rtl">الاعتمادات والإنجازات التي نفتخر بها</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'اعتماد محلي ودولي', desc: 'برامجنا التدريبية معتمدة من كبرى المؤسسات التكنولوجية والتعليمية.', icon: FiAward },
                            { title: 'شراكات استراتيجية', desc: 'نعمل مع رواد الصناعة لتوفير أفضل مناهج التعليم التطبيقي.', icon: FiGlobe },
                            { title: 'جوائز التميز', desc: 'حصلنا على العديد من الجوائز كأفضل مركز تدريب تكنولوجي.', icon: FiStar },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                                    <item.icon className="text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3" dir="rtl">{item.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed" dir="rtl">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Media & Contact */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto mb-32">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">تواصل معنا</h2>
                    <p className="text-gray-400 font-medium text-lg" dir="rtl">نحن هنا لمساعدتك — تواصل معنا على أي منصة</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Facebook */}
                    <motion.a
                        href="https://www.facebook.com/itsparkk"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03 }}
                        className="glass p-8 rounded-3xl border border-white/5 hover:border-[#1877F2]/30 transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center mb-4 group-hover:bg-[#1877F2]/20 transition-colors">
                            <FiFacebook className="text-3xl text-[#1877F2]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Facebook</h3>
                        <p className="text-sm text-gray-400 font-medium">@itsparkk</p>
                    </motion.a>

                    {/* YouTube */}
                    <motion.a
                        href="http://www.youtube.com/@itspark2129"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03 }}
                        className="glass p-8 rounded-3xl border border-white/5 hover:border-[#FF0000]/30 transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#FF0000]/10 flex items-center justify-center mb-4 group-hover:bg-[#FF0000]/20 transition-colors">
                            <FiYoutube className="text-3xl text-[#FF0000]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">YouTube</h3>
                        <p className="text-sm text-gray-400 font-medium">@itspark2129</p>
                    </motion.a>

                    {/* Instagram */}
                    <motion.a
                        href="https://www.instagram.com/itspark.training"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.03 }}
                        className="glass p-8 rounded-3xl border border-white/5 hover:border-[#E4405F]/30 transition-all flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#E4405F]/10 flex items-center justify-center mb-4 group-hover:bg-[#E4405F]/20 transition-colors">
                            <FiInstagram className="text-3xl text-[#E4405F]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Instagram</h3>
                        <p className="text-sm text-gray-400 font-medium">@itspark.training</p>
                    </motion.a>

                    {/* Vodafone Cash */}
                    <motion.div
                        whileHover={{ scale: 1.03 }}
                        className="glass p-8 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all flex flex-col items-center text-center group cursor-default"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                            <FiPhone className="text-3xl text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Vodafone Cash</h3>
                        <p className="text-base font-black text-red-400 tracking-widest" dir="ltr">01010710656</p>
                        <p className="text-xs text-gray-500 font-medium mt-1" dir="rtl">للدفع والاستفسار</p>
                    </motion.div>
                </div>
            </section>

            {/* Vocational Training */}
            <section className="bg-black/30 py-20 border-y border-white/5 mb-32">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Vocational Training</h2>
                        <p className="text-primary font-bold text-lg" dir="rtl">التدريبات الحرفية والمهنية</p>
                        <p className="text-gray-400 mt-4 max-w-2xl mx-auto" dir="rtl">
                            نقدم مجموعة متميزة من التدريبات الحرفية التي تؤهلك لسوق العمل بشكل عملي ومباشر على أيدي خبراء متخصصين.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                        {[
                            'الكهرباء',
                            'السباكة',
                            'النجارة',
                            'صيانة الأجهزة',
                            'صيانة الموبايل',
                            'التبريد والتكييف',
                            'اللحام',
                            'الخياطة',
                            'الحرف اليدوية'
                        ].map((craft, i) => (
                            <div key={i} className="glass p-6 rounded-2xl border border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all cursor-default">
                                <h3 className="text-lg font-black text-white" dir="rtl">{craft}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="px-4 md:px-8 max-w-7xl mx-auto mb-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">Success Stories</h2>
                    <p className="text-gray-400 font-medium text-lg" dir="rtl">قصص نجاح طلابنا</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        { name: 'أحمد محمود', role: 'Full Stack Developer', story: 'بفضل تدريب IT-SPARK، تمكنت من بناء خبرة عملية قوية مكنتني من الحصول على وظيفة في شركة تقنية عالمية بعد التخرج مباشرة.' },
                        { name: 'سارة خالد', role: 'UI/UX Designer', story: 'الكورسات هنا لا تعتمد على النظريات فقط، بل على التطبيق العملي المستمر مما أهلني لبناء بورتفوليو قوي وبدء عملي الحر.' }
                    ].map((story, i) => (
                        <div key={i} className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-8 rounded-[2rem] relative">
                            <FiStar className="absolute top-8 right-8 text-accent opacity-20 text-6xl" />
                            <p className="text-gray-300 leading-relaxed mb-6 relative z-10 text-lg italic" dir="rtl">"{story.story}"</p>
                            <div className="flex items-center gap-4 relative z-10" dir="rtl">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                    {story.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{story.name}</h4>
                                    <p className="text-primary text-sm">{story.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}
