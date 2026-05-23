'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiX,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiBookOpen,
  FiEdit3,
  FiCalendar,
  FiMapPin,
} from 'react-icons/fi';
import { useLanguage } from '@/lib/LanguageContext';
import TrainingCard, { type TrainingItem } from '@/components/TrainingCard';
import { showToast } from '@/lib/toast';

const DEFAULT_CATEGORIES = [
  'All',
  'Programming',
  'Graphic Design',
  'Languages',
  'Networks',
  'AI',
  'Business',
  'Kids',
  'General',
];

export default function TrainingCoursesPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  const [trainings, setTrainings] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedTraining, setSelectedTraining] = useState<TrainingItem | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    university: '',
    academic_year: '',
    governorate: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (activeCategory !== 'All') params.set('category', activeCategory);
      const res = await fetch(`/api/trainings?${params.toString()}`);
      if (res.ok) {
        setTrainings(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const t = setTimeout(fetchTrainings, searchQuery ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchTrainings, searchQuery]);

  const categories = useMemo(() => {
    const fromData = trainings.map((t) => t.category).filter(Boolean) as string[];
    return [...new Set([...DEFAULT_CATEGORIES, ...fromData])];
  }, [trainings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTraining) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/training-registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          training_id: selectedTraining._id,
          course_name: selectedTraining.title,
        }),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        showToast(
          isRtl ? 'تم إرسال طلب التقديم بنجاح' : 'Application submitted successfully',
          'success'
        );
        setTimeout(() => {
          setSubmitSuccess(false);
          setSelectedTraining(null);
          setFormData({
            full_name: '',
            phone: '',
            email: '',
            university: '',
            academic_year: '',
            governorate: '',
            notes: '',
          });
        }, 2500);
      } else {
        showToast(
          isRtl ? 'حدث خطأ أثناء الإرسال' : 'Error submitting application',
          'error'
        );
      }
    } catch {
      showToast(isRtl ? 'خطأ في الاتصال' : 'Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 lg:pt-20 pb-20">
      <section className="relative w-full py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-4"
          >
            {isRtl ? 'التدريبات والورش' : 'Trainings & Workshops'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-base md:text-lg text-foreground/60 max-w-2xl mx-auto font-medium px-2"
          >
            {isRtl
              ? 'سجّل في التدريبات الحضورية والأونلاين — بدون حساب'
              : 'Apply for offline and online trainings — no account required'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <FiSearch className="absolute start-4 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5 pointer-events-none" />
            <input
              type="search"
              placeholder={isRtl ? 'ابحث عن تدريب...' : 'Search trainings...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-12 pe-4 py-3.5 rounded-full bg-background/90 border border-border text-foreground font-semibold outline-none focus:border-primary/50 shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all touch-manipulation min-h-[40px] ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background text-foreground/70 border-border hover:border-primary/40'
              }`}
            >
              {isRtl && cat === 'All' ? 'الكل' : cat}
            </button>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-surface border border-border animate-pulse"
              />
            ))}
          </div>
        ) : trainings.length === 0 ? (
          <div className="py-20 text-center">
            <FiSearch className="w-12 h-12 mx-auto text-foreground/20 mb-4" />
            <p className="font-bold text-foreground/50">
              {isRtl ? 'لا توجد تدريبات حالياً' : 'No trainings available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {trainings.map((training) => (
              <TrainingCard
                key={training._id}
                training={training}
                onApply={setSelectedTraining}
              />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedTraining && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setSelectedTraining(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed inset-x-0 bottom-0 sm:inset-0 z-[160] flex sm:items-center sm:justify-center p-0 sm:p-4"
            >
              <div
                className="bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] flex flex-col overflow-hidden"
                dir={isRtl ? 'rtl' : 'ltr'}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-4 border-b border-border flex justify-between items-start gap-3 shrink-0">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-foreground">
                      {isRtl ? 'تقديم على التدريب' : 'Apply for Training'}
                    </h3>
                    <p className="text-sm font-bold text-primary mt-1 truncate">
                      {selectedTraining.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setSelectedTraining(null)}
                    className="p-2 rounded-xl border border-border text-foreground/50 hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                  >
                    <FiX size={22} />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto overscroll-contain flex-1">
                  {submitSuccess ? (
                    <div className="text-center py-10">
                      <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      <p className="text-xl font-black text-foreground">
                        {isRtl ? 'تم الإرسال!' : 'Submitted!'}
                      </p>
                      <p className="text-foreground/50 mt-2 text-sm">
                        {isRtl ? 'سنتواصل معك قريباً' : 'We will contact you soon'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FormField
                        label={isRtl ? 'الاسم بالكامل' : 'Full Name'}
                        required
                        icon={FiUser}
                      >
                        <input
                          name="full_name"
                          required
                          value={formData.full_name}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </FormField>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label={isRtl ? 'الهاتف' : 'Phone'}
                          required
                          icon={FiPhone}
                        >
                          <input
                            name="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input dir-ltr"
                          />
                        </FormField>
                        <FormField label={isRtl ? 'البريد' : 'Email'} icon={FiMail}>
                          <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input dir-ltr"
                          />
                        </FormField>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          label={isRtl ? 'الكلية' : 'University'}
                          required
                          icon={FiBookOpen}
                        >
                          <input
                            name="university"
                            required
                            value={formData.university}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </FormField>
                        <FormField
                          label={isRtl ? 'السنة الدراسية' : 'Academic Year'}
                          required
                          icon={FiCalendar}
                        >
                          <input
                            name="academic_year"
                            required
                            value={formData.academic_year}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </FormField>
                      </div>
                      <FormField
                        label={isRtl ? 'المحافظة' : 'Governorate'}
                        required
                        icon={FiMapPin}
                      >
                        <input
                          name="governorate"
                          required
                          value={formData.governorate}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </FormField>
                      <FormField label={isRtl ? 'ملاحظات' : 'Notes'} icon={FiEdit3}>
                        <textarea
                          name="notes"
                          rows={3}
                          value={formData.notes}
                          onChange={handleInputChange}
                          className="form-input resize-none"
                        />
                      </FormField>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-black rounded-xl min-h-[48px] touch-manipulation disabled:opacity-60"
                      >
                        {isSubmitting
                          ? isRtl
                            ? 'جاري الإرسال...'
                            : 'Sending...'
                          : isRtl
                            ? 'إرسال الطلب'
                            : 'Submit Application'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--foreground);
          font-weight: 600;
          font-size: 0.875rem;
          outline: none;
        }
        .form-input:focus {
          border-color: rgba(0, 106, 90, 0.5);
        }
      `}</style>
    </div>
  );
}

function FormField({
  label,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/50 px-1">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-foreground/30 pointer-events-none" />
        )}
        <div className={Icon ? 'ps-10' : ''}>{children}</div>
      </div>
    </div>
  );
}
