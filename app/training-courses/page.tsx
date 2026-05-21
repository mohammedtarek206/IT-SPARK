'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiMapPin, FiX, FiCheckCircle, FiUser, FiPhone, FiMail, FiBookOpen, FiEdit3 } from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';

const COURSES = [
  { id: 1, title: 'IC3', category: 'Business', duration: '1 Month', type: 'Offline', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1536&h=1024&fit=crop' },
  { id: 2, title: 'ICDL', category: 'Business', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1536&h=1024&fit=crop' },
  { id: 3, title: 'MOS', category: 'Business', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1536&h=1024&fit=crop' },
  { id: 4, title: 'ICDL Teacher', category: 'Business', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1536&h=1024&fit=crop' },
  { id: 5, title: 'Advanced Excel', category: 'Business', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1536&h=1024&fit=crop' },
  { id: 6, title: 'AC5', category: 'Business', duration: '1 Month', type: 'Offline', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1536&h=1024&fit=crop' },
  { id: 7, title: 'Digital Marketing', category: 'Business', duration: '2 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=1536&h=1024&fit=crop' },
  { id: 8, title: 'HR', category: 'Business', duration: '2 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1536&h=1024&fit=crop' },
  { id: 9, title: 'English Beginner', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1536&h=1024&fit=crop' },
  { id: 10, title: 'English Intermediate', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1536&h=1024&fit=crop' },
  { id: 11, title: 'English Advanced', category: 'Languages', duration: '3 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1536&h=1024&fit=crop' },
  { id: 12, title: 'Mobile Maintenance', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=1536&h=1024&fit=crop' },
  { id: 13, title: 'Graphic Diploma', category: 'Graphic Design', duration: '4 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1536&h=1024&fit=crop' },
  { id: 14, title: 'Photoshop', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1561089489-013d3a1f11a8?q=80&w=1536&h=1024&fit=crop' },
  { id: 15, title: 'Illustrator', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?q=80&w=1536&h=1024&fit=crop' },
  { id: 16, title: 'InDesign', category: 'Graphic Design', duration: '1 Month', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1536&h=1024&fit=crop' },
  { id: 17, title: 'Python Programming', category: 'Programming', duration: '2 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1536&h=1024&fit=crop' },
  { id: 18, title: 'Kids Courses', category: 'Kids', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=1536&h=1024&fit=crop' },
  { id: 19, title: 'Data Analysis', category: 'Programming', duration: '3 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1536&h=1024&fit=crop' },
  { id: 20, title: 'TOT', category: 'Business', duration: '1.5 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=1536&h=1024&fit=crop' },
  { id: 21, title: 'ODOO', category: 'Business', duration: '2 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1536&h=1024&fit=crop' },
  { id: 22, title: 'React Frontend', category: 'Programming', duration: '3 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1536&h=1024&fit=crop' },
  { id: 23, title: 'Angular Frontend', category: 'Programming', duration: '3 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=1536&h=1024&fit=crop' },
  { id: 24, title: 'Mobile App Development', category: 'Programming', duration: '4 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1536&h=1024&fit=crop' },
  { id: 25, title: 'Full Stack .NET', category: 'Programming', duration: '6 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1618477388954-7852f32655c7?q=80&w=1536&h=1024&fit=crop' },
  { id: 26, title: 'Microsoft Machine Learning', category: 'AI', duration: '4 Months', type: 'Online', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1536&h=1024&fit=crop' },
  { id: 27, title: 'Artificial Intelligence', category: 'AI', duration: '5 Months', type: 'Online / Offline', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1536&h=1024&fit=crop' },
  { id: 28, title: 'Cyber Security', category: 'Networks', duration: '4 Months', type: 'Offline / Online', image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1536&h=1024&fit=crop' },
  { id: 29, title: 'CCNA', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1536&h=1024&fit=crop' },
  { id: 30, title: 'MCSA', category: 'Networks', duration: '2 Months', type: 'Offline', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1536&h=1024&fit=crop' },
];

const CATEGORIES = ['All', 'Programming', 'Graphic Design', 'Languages', 'Networks', 'AI', 'Business', 'Kids'];

export default function TrainingCoursesPage() {
  const { lang, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    university: '',
    academic_year: '',
    governorate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredCourses = useMemo(() => {
    return COURSES.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/training-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          course_name: selectedCourse.title,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setSelectedCourse(null);
          setFormData({
            full_name: '', phone: '', email: '', university: '', academic_year: '', governorate: '', notes: ''
          });
        }, 3000);
      } else {
        alert(lang === 'ar' ? 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.' : 'Error submitting registration, please try again.');
      }
    } catch (error) {
      console.error(error);
      alert(lang === 'ar' ? 'حدث خطأ في الاتصال.' : 'Network error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-6"
          >
            {lang === 'ar' ? 'التدريبات' : 'Training'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
          >
            {lang === 'ar' ? 'اكتشف مجموعة واسعة من الكورسات التدريبية المصممة لتطوير مهاراتك وبناء مستقبلك المهني.' : 'Discover a wide range of training courses designed to develop your skills and build your career.'}
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-10 max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative flex items-center bg-background/80 backdrop-blur-xl border border-border rounded-full p-2 shadow-xl">
              <FiSearch className="w-6 h-6 text-foreground/50 ml-4 mr-2" />
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن كورس...' : 'Search for a course...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-foreground font-semibold px-2 py-3 placeholder:text-foreground/40"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border ${
                activeCategory === category 
                  ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(0,163,255,0.4)]' 
                  : 'bg-background text-foreground/70 border-border hover:border-primary/50 hover:text-primary'
              }`}
            >
              {lang === 'ar' && category === 'All' ? 'الكل' : category}
            </button>
          ))}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredCourses.map((course) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={course.id}
                className="group relative glass rounded-3xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 flex flex-col h-full bg-background/40"
              >
                {/* Course Image */}
                <div className="relative h-48 w-full overflow-hidden bg-foreground/5">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-md rounded-full text-xs font-bold text-foreground border border-white/10 shadow-lg">
                    {course.category}
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <h3 className="text-xl font-black text-foreground mb-3 leading-tight line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="space-y-2 mt-auto mb-6">
                    <div className="flex items-center text-sm font-medium text-foreground/60">
                      <FiClock className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-primary" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm font-medium text-foreground/60">
                      <FiMapPin className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0 text-accent" />
                      {course.type}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(0,163,255,0.4)] transition-all duration-300 transform group-hover:-translate-y-1"
                  >
                    {lang === 'ar' ? 'سجل الآن' : 'Register Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 mx-auto bg-foreground/5 rounded-full flex items-center justify-center mb-4">
                <FiSearch className="w-10 h-10 text-foreground/30" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {lang === 'ar' ? 'لا توجد كورسات تطابق بحثك' : 'No courses match your search'}
              </h3>
              <p className="text-foreground/50">
                {lang === 'ar' ? 'جرب البحث بكلمات مختلفة أو تصفح الأقسام' : 'Try searching with different keywords or browse categories'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setSelectedCourse(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-4"
            >
              <div className="bg-surface/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden max-h-[90vh] flex flex-col relative" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                  <div>
                    <h3 className="text-2xl font-black text-white">{lang === 'ar' ? 'تسجيل في كورس' : 'Course Registration'}</h3>
                    <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                      <span className="w-2 h-2 rounded-full bg-primary mr-2 rtl:mr-0 rtl:ml-2 animate-pulse"></span>
                      <p className="text-xs font-bold text-primary tracking-wider">{selectedCourse.title}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => !isSubmitting && setSelectedCourse(null)}
                    disabled={isSubmitting}
                    className="w-10 h-10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all disabled:opacity-50 flex items-center justify-center backdrop-blur-md border border-white/5"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                  {submitSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                        <FiCheckCircle className="w-12 h-12" />
                      </div>
                      <h4 className="text-3xl font-black text-white mb-3">
                        {lang === 'ar' ? 'تم التسجيل بنجاح!' : 'Registered Successfully!'}
                      </h4>
                      <p className="text-gray-400 font-medium text-lg">
                        {lang === 'ar' ? 'سنتواصل معك في أقرب وقت لتأكيد حجزك.' : 'We will contact you shortly to confirm your booking.'}
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'الاسم بالكامل' : 'Full Name'} <span className="text-primary">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                            <FiUser className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            name="full_name"
                            required
                            value={formData.full_name}
                            onChange={handleInputChange}
                            placeholder={lang === 'ar' ? 'أدخل اسمك رباعي' : 'Enter your full name'}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className="text-primary">*</span></label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                              <FiPhone className="w-5 h-5" />
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              required
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="01xxxxxxxxx"
                              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold dir-ltr"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-gray-600 font-normal">({lang === 'ar' ? 'اختياري' : 'Optional'})</span></label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                              <FiMail className="w-5 h-5" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="example@mail.com"
                              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold dir-ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* University */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'الكلية / المعهد' : 'University / Institute'} <span className="text-primary">*</span></label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                              <FiBookOpen className="w-5 h-5" />
                            </div>
                            <input
                              type="text"
                              name="university"
                              required
                              value={formData.university}
                              onChange={handleInputChange}
                              placeholder={lang === 'ar' ? 'أدخل اسم الكلية' : 'Enter university name'}
                              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold"
                            />
                          </div>
                        </div>

                        {/* Academic Year */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'السنة الدراسية' : 'Academic Year'} <span className="text-primary">*</span></label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                              <FiCalendar className="w-5 h-5" />
                            </div>
                            <input
                              type="text"
                              name="academic_year"
                              required
                              value={formData.academic_year}
                              onChange={handleInputChange}
                              placeholder={lang === 'ar' ? 'الفرقة الثالثة' : 'e.g. 3rd Year'}
                              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Governorate */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'المحافظة' : 'Governorate'} <span className="text-primary">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                            <FiMapPin className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            name="governorate"
                            required
                            value={formData.governorate}
                            onChange={handleInputChange}
                            placeholder={lang === 'ar' ? 'القاهرة' : 'Cairo'}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{lang === 'ar' ? 'ملاحظات' : 'Notes'} <span className="text-gray-600 font-normal">({lang === 'ar' ? 'اختياري' : 'Optional'})</span></label>
                        <div className="relative group">
                          <div className="absolute top-4 right-0 rtl:right-auto rtl:left-0 flex items-start px-4 pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                            <FiEdit3 className="w-5 h-5" />
                          </div>
                          <textarea
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder={lang === 'ar' ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pr-4 pl-12 rtl:pl-4 rtl:pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/5 transition-all text-sm font-bold resize-none"
                          ></textarea>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="pt-6 mt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(0,163,255,0.4)] transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          {isSubmitting ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            lang === 'ar' ? 'تأكيد الحجز' : 'Confirm Registration'
                          )}
                        </button>
                      </div>

                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
