import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { trainingTitle, trainingSubtitle } from '../data/training.js';

export function ProfessionalDevelopment({ about, courses }: { about: any; courses: any[] }) {
  const reducedMotion = useReducedMotion();
  const items = courses.filter(item => item.visible !== false).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  return <section id="professional-development" aria-labelledby="development-heading" className="flex flex-col gap-6 pt-8 border-t border-white/[0.08]">
    <div className="flex flex-col gap-2">
      <h3 id="development-heading" className="text-2xl sm:text-3xl font-semibold text-accent-gradient tracking-tight">{about.coursesTitle ?? trainingTitle}</h3>
      <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-2xl">{about.coursesSubtitle ?? trainingSubtitle}</p>
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-stretch">
      {!items.length && <p className="text-sm text-[#a1a1aa]">No training listed yet.</p>}
      {items.map((item, index) => <motion.article key={item.id || item._id}
        initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="min-w-0 rounded-3xl p-6 bg-white/[0.03] border border-white/[0.08] hover:border-[var(--accent)] transition-colors backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#a1a1aa]">
          <span>{item.type === 'training' ? 'Training Program' : 'Course'}</span>
          {['completed', 'in-progress'].includes(item.status) && <span className="rounded-full border border-[var(--accent-glow)] bg-[var(--accent-soft)] px-2.5 py-1 text-white/80">{item.status === 'completed' ? 'Completed' : 'In Progress'}</span>}
        </div>
        <h4 className="mt-4 text-xl font-semibold text-white break-words">{item.title}</h4>
        <p className="mt-2 text-sm text-white/80">{item.provider}</p>
        {(item.duration || item.dateLabel) && <p className="mt-1 text-xs font-mono text-[#8e8e93]">{[item.duration, item.dateLabel].filter(Boolean).join(' · ')}</p>}
        {item.shortDescription && <p className="mt-4 text-sm text-[#a1a1aa] leading-relaxed break-words">{item.shortDescription}</p>}
        <ul aria-label={`${item.title} focus areas`} className="mt-4 flex flex-wrap gap-2">
          {(item.technologies || []).map((technology: string, i: number) => <li key={i} className="max-w-full rounded-full border border-[var(--accent-glow)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs leading-5 text-white/80 break-words">{technology}</li>)}
        </ul>
      </motion.article>)}
    </div>
  </section>;
}
