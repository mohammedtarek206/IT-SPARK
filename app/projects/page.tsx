'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiImage } from 'react-icons/fi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          className="text-center mb-24"
        >
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Exhibition Ground</span>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic">
            STUDENT <span className="text-primary">GALLERY</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Witness the extraordinary talent of our students. From AI models to full-scale applications, explore the best of <span className="text-white">IT-SPARK</span>.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/50 flex flex-col h-full shadow-2xl">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-dark transition-all duration-300">
                      <FiUser />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Created By</p>
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{project.studentName}</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-4 flex-1">
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && projects.length === 0 && (
          <div className="text-center py-20">
            <FiImage className="mx-auto text-4xl text-gray-700 mb-4" />
            <h3 className="text-white font-bold opacity-50 uppercase tracking-widest italic">Curating the next generation of talent...</h3>
          </div>
        )}
      </div>
    </div>
  );
}
