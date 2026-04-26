'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiLinkedin, FiTwitter, FiGithub, FiMail, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/team')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTeam(data);
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
          <span className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 block">Our Experts</span>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter uppercase italic">
            THE <span className="text-primary">TEAM</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Meet the innovators and educators driving the future of digital skills at <span className="text-white">IT-SPARK</span>.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="glass rounded-[2.5rem] p-8 border border-white/5 hover:border-primary/40 transition-all duration-500 flex flex-col items-center h-full">
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all duration-500 rotate-3 group-hover:rotate-0">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-dark shadow-xl">
                    <FiUser className="text-xl" />
                  </div>
                </div>

                <div className="text-center space-y-2 flex-1">
                  <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors">{member.name}</h3>
                  <p className="text-primary font-bold uppercase tracking-widest text-[10px]">{member.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 pt-2">{member.bio}</p>
                </div>

                <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-white/5 w-full">
                  {member.socials.linkedin && (
                    <a href={member.socials.linkedin} target="_blank" className="text-gray-500 hover:text-white transition-colors">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {member.socials.twitter && (
                    <a href={member.socials.twitter} target="_blank" className="text-gray-500 hover:text-white transition-colors">
                      <FiTwitter size={18} />
                    </a>
                  )}
                  {member.socials.github && (
                    <a href={member.socials.github} target="_blank" className="text-gray-500 hover:text-white transition-colors">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {member.socials.email && (
                    <a href={`mailto:${member.socials.email}`} className="text-gray-500 hover:text-white transition-colors">
                      <FiMail size={18} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && team.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-bold uppercase tracking-widest italic">Recruiting the best minds...</p>
          </div>
        )}
      </div>
    </div>
  );
}
