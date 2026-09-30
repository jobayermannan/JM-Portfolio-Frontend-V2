import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ArrowUpRight, Github, ExternalLink, Code2 } from 'lucide-react';

export interface ProjectItem {
  id: string;
  title: string;
  shortDescription?: string;
  detailedDescription?: string;
  description?: string;
  image?: string;
  link?: string;
  liveUrl?: string;
  githubLink?: string;
  technologies?: string[];
  category: string;
  windowUrl?: string;
  kind?: 'main' | 'data-ml';
  featured?: boolean;
  problem?: string;
  datasetSource?: string;
  techniques?: string[];
  workflow?: string;
  result?: string;
  limitations?: string;
  notebookUrl?: string;
  fieldVisibility?: Record<string, boolean>;
}

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  totalCards: number;
  stackIndex?: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, totalCards, stackIndex = index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  // Track progress of card as it reaches sticky top and gets covered by next cards
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start start', 'end start'],
  });

  // Smooth springs for scale and opacity
  const rawScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.65]);

  const scale = useSpring(rawScale, { stiffness: 300, damping: 30 });
  const opacity = useSpring(rawOpacity, { stiffness: 300, damping: 30 });

  // Subtle Parallax (about 20px) for inner media preview
  const innerParallax = useTransform(scrollYProgress, [0, 1], [-10, 15]);

  const isDataMl = project.kind === 'data-ml';
  const show = (field: string) => !isDataMl || project.fieldVisibility?.[field] !== false;
  const githubLink = show('githubLink') ? project.githubLink : '';
  const liveLink = show('liveUrl') ? project.liveUrl || project.link : '';
  const displayUrl = project.windowUrl || (isDataMl ? 'data-and-ml' : `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`);
  const description = project.detailedDescription || project.shortDescription || project.description || '';
  const tags = show('technologies') ? project.technologies || [] : [];
  const detailRows = isDataMl ? [
    ['Problem', project.problem, 'problem'], ['Dataset / source', project.datasetSource, 'datasetSource'],
    ['Techniques / models', project.techniques?.join(', '), 'techniques'], ['Workflow', project.workflow, 'workflow'],
    ['Result / findings', project.result, 'result'], ['Limitations', project.limitations, 'limitations'],
  ].filter(([, value, field]) => value && show(field || '')) : [];

  return (
    <div
      ref={cardRef}
      className="sticky top-24 sm:top-28 w-full mb-16 sm:mb-24 last:mb-32 transform-gpu"
      style={{
        zIndex: stackIndex + 10,
      }}
    >
      <motion.article
        style={{
          scale,
          opacity,
          transformOrigin: 'top center',
        }}
        className="w-full bg-[#141518]/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden transform-gpu will-change-transform group transition-colors duration-300 hover:border-white/20"
      >
        {/* macOS Title Bar Chrome */}
        <div className="w-full h-11 bg-gradient-to-b from-[#232428] to-[#18191c] px-4 sm:px-6 flex items-center justify-between border-b border-white/[0.08] select-none">
          {/* Traffic-light dots (Red, Yellow, Green with soft ambient glow) */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full traffic-red inline-block" />
            <span className="w-3 h-3 rounded-full traffic-yellow inline-block" />
            <span className="w-3 h-3 rounded-full traffic-green inline-block" />
          </div>

          {/* Minimal URL indicator */}
          <div className="text-[11px] font-mono text-[#8e8e93] px-3 py-0.5 rounded-full bg-black/40 border border-white/5 truncate max-w-[200px] sm:max-w-xs">
            {displayUrl}
          </div>

          <div className="w-16 flex items-center justify-end gap-2">
            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title} on GitHub`}
                className="text-[#8e8e93] hover:text-white transition-colors duration-200"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {liveLink && <a
              href={liveLink}
              target="_blank"
              rel="noreferrer"
              aria-label={`Open ${project.title} live demo`}
              className="text-[#8e8e93] hover:text-white transition-colors duration-200"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 md:p-12 flex flex-col gap-6 sm:gap-8">
          {/* Header Row: Title & Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-[#8e8e93] tracking-wide">
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-white/70">
                  {project.category}
                </span>
                {isDataMl && project.featured && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[var(--accent)]">Featured</span>}
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight mt-1">
                {project.title}
              </h2>
              <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed mt-1">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start shrink-0">
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 border border-white/10"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Code</span>
                </a>
              )}
              {isDataMl && show('notebookUrl') && project.notebookUrl && <a href={project.notebookUrl} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 border border-white/10">Notebook <ArrowUpRight className="w-3.5 h-3.5" /></a>}
              {liveLink && <a
                href={liveLink}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Live Demo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>}
            </div>
          </div>

          {detailRows.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-white/5 pt-5 text-sm">
            {detailRows.map(([label, value]) => <div key={label} className="min-w-0"><span className="text-xs font-mono uppercase tracking-widest text-[#8e8e93]">{label}</span><p className="text-[#c4c4c8] leading-relaxed mt-1 whitespace-pre-wrap break-words">{value}</p></div>)}
          </div>}

          {/* Inner Interactive Visual Container with Subtle Parallax */}
          <motion.div
            style={{ y: innerParallax }}
            className="w-full aspect-[16/9] max-h-[460px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-[#0d0e11] shadow-2xl transform-gpu will-change-transform relative flex items-center justify-center"
          >
            {project.image && show('image') && !imageError ? (
              <img
                src={project.image}
                alt={project.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-700"
              />
            ) : (
              /* Neutral Glass Placeholder when image is missing or failed */
              <div className="w-full h-full p-8 flex flex-col justify-between bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl relative overflow-hidden select-none">
                {/* Background geometric glass shapes */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 right-10 w-96 h-96 rounded-full bg-white/[0.015] blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-white/40" />
                    <span className="text-xs font-mono text-white/50">{project.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
                    {isDataMl ? 'Data & ML work' : 'Preview Interactive UI'}
                  </span>
                </div>

                <div className="my-auto flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.03)]">
                    <ExternalLink className="w-7 h-7 text-white/50" />
                  </div>
                  <h3 className="text-lg font-medium text-white/80">{project.title}</h3>
                  <p className="text-xs text-white/50 max-w-sm mt-1">
                    {project.shortDescription || 'Preview image not available.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-white/40 font-mono">
                  <span>{isDataMl ? 'DATA & ML PREVIEW' : 'PROJECT PREVIEW'}</span>
                  <span>{project.category}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Footer Tags */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5 text-xs">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-white/5 text-[#c4c4c8] text-xs font-normal border border-white/5 transition-colors duration-200 hover:border-[var(--accent)] hover:text-white"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-[#8e8e93] text-xs font-mono">
              0{index + 1} / 0{totalCards}
            </span>
          </div>
        </div>
      </motion.article>
    </div>
  );
};
