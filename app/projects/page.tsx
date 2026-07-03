'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiImage, FiCalendar, FiCode, FiArrowRight, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useLanguage } from '@/lib/LanguageContext';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';

  useEffect(() => {
    fetch('/api/admin/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-dark via-dark-light to-dark text-white">
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-[0.2em] mb-6">
            Exhibition Ground
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight uppercase">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Projects</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
            {isRtl 
              ? 'شاهد الإبداع الحقيقي لطلابنا. من تطبيقات الذكاء الاصطناعي إلى مواقع الويب المتكاملة.'
              : 'Witness the extraordinary talent of our students. From AI models to full-scale applications, explore the best of IT-SPARK.'}
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="group flex flex-col h-full bg-surface border border-white/5 hover:border-primary/30 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Project Image */}
              <div className="relative aspect-video overflow-hidden bg-black">
                <img
                  src={project.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000'}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-all duration-300 shadow-lg">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/80 drop-shadow-md">Creator</p>
                    <p className="text-sm font-bold text-white drop-shadow-md">{project.studentName}</p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-8 flex flex-col flex-1 gap-4" dir={isRtl ? 'rtl' : 'ltr'}>
                <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors line-clamp-1">{project.title}</h3>
                
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3 mt-2 text-xs font-bold text-gray-500">
                  <div className="flex items-center gap-2">
                    <FiCode className="text-primary" size={14} />
                    <span className="truncate" title={project.technologies?.join(', ') || 'Next.js, Tailwind'}>
                      {project.technologies?.length ? project.technologies.join(', ') : 'Next.js, React'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-accent" size={14} />
                    <span>
                      {project.executionDate ? new Date(project.executionDate).toLocaleDateString() : (project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '2025')}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-white/5">
                  <button 
                    onClick={() => setSelectedProject(project)}
                    className="w-full py-3 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all group-hover:shadow-[0_0_20px_rgba(0,106,90,0.3)]"
                  >
                    {isRtl ? 'تفاصيل المشروع' : 'View Details'} <FiArrowRight className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && projects.length === 0 && (
          <div className="text-center py-32 glass rounded-3xl border border-white/5 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiImage className="text-4xl text-gray-600" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-widest text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-500">Curating the next generation of talent...</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              <div className="relative aspect-[21/9] w-full bg-black">
                <img 
                  src={selectedProject.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000'}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-4">{selectedProject.title}</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Creator</p>
                    <p className="font-bold text-white flex items-center gap-2"><FiUser className="text-primary"/> {selectedProject.studentName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Date</p>
                    <p className="font-bold text-white flex items-center gap-2"><FiCalendar className="text-accent"/> {selectedProject.executionDate ? new Date(selectedProject.executionDate).toLocaleDateString() : (selectedProject.createdAt ? new Date(selectedProject.createdAt).toLocaleDateString() : 'N/A')}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Technologies</p>
                    <p className="font-bold text-white flex items-center gap-2"><FiCode className="text-cyber"/> {selectedProject.technologies?.length ? selectedProject.technologies.join(' • ') : 'Web Technologies'}</p>
                  </div>
                </div>

                {selectedProject.demoUrl && (
                  <div className="pt-4">
                    <a 
                      href={selectedProject.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                      {isRtl ? 'عرض المشروع المباشر' : 'View Live Demo'} <FiArrowRight className={isRtl ? 'rotate-180' : ''} />
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
