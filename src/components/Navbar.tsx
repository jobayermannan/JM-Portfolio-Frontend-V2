import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AccentSwitcher } from './AccentSwitcher';

interface NavbarProps {
  activeTab: 'work' | 'info';
  onTabChange: (tab: 'work' | 'info') => void;
  showNavAnimation?: boolean;
  profile?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  showNavAnimation = true,
  profile,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.header
      initial={showNavAnimation ? { y: -30, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="fixed top-0 inset-x-0 z-50 pointer-events-none px-4 sm:px-8 md:px-12 pt-5 sm:pt-7"
    >
      <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Name and Title (Text only, no logo, no icon, no avatar) */}
        <div className="pointer-events-auto flex flex-col select-none shrink-0">
          <a
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('work');
            }}
            className="group block focus:outline-none"
          >
            <h1 className="text-white text-[20px] sm:text-[24px] font-medium tracking-[-0.02em] leading-tight font-sans">
              {profile?.fullName || 'Portfolio'}
            </h1>
            <p className="text-[#8e8e93] text-[14px] sm:text-[16px] font-normal leading-tight font-sans tracking-[-0.01em]">
              {profile?.caption || ''}
            </p>
          </a>
        </div>

        {/* Center: Floating Glass Navbar Pill */}
        <div className="pointer-events-auto">
          <nav
            aria-label="Primary navigation"
            className="glass-nav relative flex items-center p-1 rounded-full text-sm font-medium select-none shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Work Tab */}
            <button
              type="button"
              onClick={() => profile?.navWorkHref && profile.navWorkHref !== '#work' ? window.location.assign(profile.navWorkHref) : onTabChange('work')}
              className={`relative px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 z-10 cursor-pointer ${
                activeTab === 'work' ? 'text-white' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {activeTab === 'work' && (
                <motion.div
                  layoutId="activePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-white/[0.14] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  {/* Illuminated notch at top edge */}
                  <span
                    className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 0 8px var(--accent-glow)',
                    }}
                  />
                </motion.div>
              )}
              <span className="relative z-10">{profile?.navWorkLabel ?? ''}</span>
            </button>

            {/* Info Tab */}
            <button
              type="button"
              onClick={() => profile?.navInfoHref && profile.navInfoHref !== '#about' ? window.location.assign(profile.navInfoHref) : onTabChange('info')}
              className={`relative px-4 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 z-10 cursor-pointer ${
                activeTab === 'info' ? 'text-white' : 'text-[#a1a1aa] hover:text-white'
              }`}
            >
              {activeTab === 'info' && (
                <motion.div
                  layoutId="activePill"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  className="absolute inset-0 rounded-full bg-white/[0.14] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                >
                  {/* Illuminated notch at top edge */}
                  <span
                    className="absolute -top-[2px] left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 0 8px var(--accent-glow)',
                    }}
                  />
                </motion.div>
              )}
              <span className="relative z-10">{profile?.navInfoLabel ?? ''}</span>
            </button>
          </nav>
        </div>

        {/* Right side in exact order: LinkedIn ↗, Resume ↗, Accent button, Avatar */}
        <div className="pointer-events-auto flex items-center gap-3 sm:gap-5 md:gap-6 select-none shrink-0">
          {profile?.social?.linkedin && <a
            href={profile.social.linkedin}
            target="_blank"
            rel="noreferrer"
            className="text-white hover:text-white/80 text-xs sm:text-sm font-medium hidden sm:inline-flex items-center gap-1 group transition-colors duration-200"
          >
            <span>{profile?.navLinkedinLabel ?? ''}</span>
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white/90">
              ↗
            </span>
          </a>}

          {profile?.social?.resume && <a
            href={profile.social.resume}
            target="_blank"
            rel="noreferrer"
            className="text-white hover:text-white/80 text-xs sm:text-sm font-medium hidden sm:inline-flex items-center gap-1 group transition-colors duration-200"
          >
            <span>{profile?.navResumeLabel ?? ''}</span>
            <span className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-white/90">
              ↗
            </span>
          </a>}

          {/* Accent Color Switcher Button */}
          <AccentSwitcher />

          {/* Avatar Circle */}
          <button
            type="button"
            onClick={() => onTabChange('info')}
            aria-label="View about information and profile"
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-[2px] transition-transform duration-300 ease-out hover:scale-108 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
          >
            {/* Rotating Conic-Gradient Ring */}
            <div className="absolute inset-0 rounded-full conic-ring opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Inner avatar circle */}
            <div className="relative w-full h-full rounded-full overflow-hidden border border-white/20 bg-[#161616] flex items-center justify-center shadow-inner">
              {!imgFailed ? (
                <img
                  src={profile?.avatar || '/projects/avater.jpg'}
                  alt={profile?.fullName || 'Profile'}
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[12px] sm:text-[14px] font-semibold text-white tracking-wider">
                  {profile?.firstName?.[0] || 'P'}{profile?.lastName?.[0] || ''}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
    </motion.header>
  );
};
