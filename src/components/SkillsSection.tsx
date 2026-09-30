import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { categoriesFromAbout, skillsTitle, skillsSubtitle, ordered } from '../data/skills.js';

export function SkillsSection({ about }: { about: any }) {
  const reducedMotion = useReducedMotion();
  const categories = categoriesFromAbout(about).filter(category => category.visible !== false)
    .map(category => ({ ...category, skills: ordered(category.skills).filter(skill => skill.visible !== false) }))
    .filter(category => category.skills.length);
  // Regular rows, never masonry. Long collections get more width; the final
  // row shares remaining columns evenly, including after admin reordering.
  const spans = (columns: number, base: number) => {
    const widths = categories.map(category => category.skills.length > 9 ? base * 2 : base);
    let used = 0;
    let row: number[] = [];
    const complete = () => {
      let remainder = columns - used;
      for (let i = 0; remainder > 0 && row.length; i = (i + 1) % row.length, remainder--) widths[row[i]]++;
      row = []; used = 0;
    };
    widths.forEach((width, index) => {
      if (used + width > columns) complete();
      row.push(index); used += width;
      if (used === columns) complete();
    });
    if (row.length) complete();
    return widths;
  };
  const tablet = spans(2, 1);
  const desktop = spans(6, 2);
  return <section id="skills" aria-labelledby="skills-heading" className="flex flex-col gap-6 pt-8 border-t border-white/[0.08]">
    <div className="flex flex-col gap-2">
      <h3 id="skills-heading" className="text-2xl sm:text-3xl font-semibold text-accent-gradient tracking-tight">{about.skillsTitle ?? skillsTitle}</h3>
      <p className="text-sm text-[#a1a1aa] leading-relaxed max-w-2xl">{about.skillsSubtitle ?? skillsSubtitle}</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 items-stretch">
      {!categories.length && <p className="text-sm text-[#a1a1aa]">No skills published yet.</p>}
      {categories.map((category, index) => <motion.article key={'_id' in category ? String(category._id) : index}
        style={{ '--skill-tablet-span': tablet[index], '--skill-desktop-span': desktop[index] } as React.CSSProperties}
        initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.6, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
        className="min-w-0 md:col-span-[var(--skill-tablet-span)] xl:col-span-[var(--skill-desktop-span)] p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[var(--accent)] transition-colors backdrop-blur-md">
        <h4 className="text-base font-medium text-[var(--accent)]">{category.name}</h4>
        {category.description && <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed break-words">{category.description}</p>}
        <ul className="mt-4 flex flex-wrap gap-2">
          {category.skills.map((skill: any, skillIndex: number) => <li key={skill._id || skillIndex}
            className="max-w-full rounded-full border border-[var(--accent-glow)] bg-[var(--accent-soft)] px-3 py-1.5 text-xs leading-5 text-white/80 break-words transition-colors hover:bg-[var(--accent-soft)] hover:border-[var(--accent)] hover:text-white motion-reduce:transition-none">
            {skill.icon && <span aria-hidden="true" className="mr-1.5">{skill.icon}</span>}{skill.name}
          </li>)}
        </ul>
      </motion.article>)}
    </div>
  </section>;
}
