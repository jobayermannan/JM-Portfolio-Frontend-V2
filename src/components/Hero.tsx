import React from 'react';
import { motion } from 'motion/react';

interface HeroProps {
  onScrollDown: () => void;
  startIntroAnimation?: boolean;
  profileData?: {
    heroHeadline?: string;
    heroAccentWord?: string;
    heroSubtextWhite?: string;
    heroSubtextGray?: string;
  } | null;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollDown,
  startIntroAnimation = true,
  profileData,
  isLoading = false,
}) => {
  const headline = profileData?.heroHeadline ?? '';
  const accentWord = profileData?.heroAccentWord ?? '';
  const subtextWhite = profileData?.heroSubtextWhite ?? '';
  const subtextGray = profileData?.heroSubtextGray ?? '';

  const headlineWords = headline.split(' ');

  const cubicEase = [0.22, 1, 0.36, 1] as const;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        ease: cubicEase,
      },
    },
  };

  const subtextVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: cubicEase,
        delay: 0.45,
      },
    },
  };

  const arrowVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: cubicEase,
        delay: 0.7,
      },
    },
  };

  if (isLoading) {
    return (
      <section className="relative w-full min-h-[90vh] flex flex-col justify-between pt-36 sm:pt-44 md:pt-48 pb-12 px-6 sm:px-10 md:px-14">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6">
          <div className="h-16 sm:h-24 w-3/4 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/5 animate-pulse" />
          <div className="h-16 sm:h-24 w-1/2 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/5 animate-pulse" />
          <div className="self-end mt-12 w-64 h-12 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/5 animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[92vh] flex flex-col justify-between pt-36 sm:pt-44 md:pt-48 pb-12 px-6 sm:px-10 md:px-14 select-none">
      {/* Subtle radial ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/[0.035] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col">
        {/* Giant Headline */}
        <motion.h1
          variants={containerVariants}
          initial={startIntroAnimation ? 'hidden' : 'visible'}
          animate="visible"
          className="font-sans text-[44px] sm:text-[68px] md:text-[82px] lg:text-[94px] tracking-[-0.04em] leading-[1.02] sm:leading-[0.96] text-hero-gradient text-glow font-medium max-w-5xl"
        >
          <div className="flex flex-wrap items-baseline gap-x-[0.28em]">
            {headlineWords.map((word, i) => (
              <motion.span key={i} variants={wordVariants} className="inline-block">
                {word}
              </motion.span>
            ))}

            {/* The emphasized word in Instrument Serif Italic with silver-to-accent gradient */}
            <motion.span
              variants={wordVariants}
              className="inline-block font-serif italic text-accent-gradient text-[1.12em] font-normal tracking-[-0.02em] ml-1 drop-shadow-[0_0_25px_var(--accent-glow)]"
            >
              {accentWord}
            </motion.span>
          </div>
        </motion.h1>

        {/* Right-aligned Subtext */}
        <div className="w-full flex justify-end mt-12 sm:mt-16 md:mt-20">
          <motion.div
            variants={subtextVariants}
            initial={startIntroAnimation ? 'hidden' : 'visible'}
            animate="visible"
            className="text-left sm:text-right flex flex-col gap-1 max-w-lg"
          >
            <p className="text-white text-lg sm:text-[22px] md:text-[24px] font-medium tracking-tight leading-snug">
              {subtextWhite}
            </p>
            <p className="text-[#8e8e93] text-base sm:text-lg md:text-[19px] font-normal tracking-tight leading-snug">
              {subtextGray}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bottom Center: Thin Outline Down-Arrow that bobs gently */}
      <motion.div
        variants={arrowVariants}
        initial={startIntroAnimation ? 'hidden' : 'visible'}
        animate="visible"
        className="w-full flex justify-center items-center mt-12 pt-6"
      >
        <button
          type="button"
          onClick={onScrollDown}
          aria-label="Scroll down to projects"
          className="bob-arrow p-2 text-[#8e8e93] hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
        >
          <svg
            className="w-6 h-8 stroke-current"
            viewBox="0 0 24 36"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="4" x2="12" y2="30" />
            <polyline points="5 23 12 30 19 23" />
          </svg>
        </button>
      </motion.div>
    </section>
  );
};
