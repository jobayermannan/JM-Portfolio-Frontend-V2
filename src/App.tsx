import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Loader } from './components/Loader';
import { GlassCursor } from './components/GlassCursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProjectCard, ProjectItem } from './components/ProjectCard';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { getProfile, getProjects, getDataMlProjects, getSectionSettings, subscribePortfolioChanges } from './api/index.js';
import { Layers } from 'lucide-react';
const Admin = React.lazy(() => import('./admin/Admin'));

export default function App() {
  const path = window.location.pathname;
  if (path === '/admin-login' || path === '/admin' || path.startsWith('/admin/')) {
    return <React.Suspense fallback={<div className="p-10" role="status">Loading admin…</div>}><Admin /></React.Suspense>;
  }
  return <Portfolio />;
}

function Portfolio() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'work' | 'info'>('work');
  const [heroIntroStarted, setHeroIntroStarted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loadError, setLoadError] = useState('');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [dataMlProjects, setDataMlProjects] = useState<ProjectItem[]>([]);
  const [sectionSettings, setSectionSettings] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribePortfolioChanges(() => {
      Promise.all([getSectionSettings(), getProjects(), getDataMlProjects()]).then(([settings, mainProjects, mlProjects]) => {
        if (active) {
          setSectionSettings(settings);
          setProjects(mainProjects);
          setDataMlProjects(mlProjects);
        }
      }).catch(() => {});
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!profile) return;
    document.title = [profile.fullName, profile.caption].filter(Boolean).join(' — ');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    const description = profile.description || profile.heroSubtextWhite || '';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  }, [profile]);

  // Initialize Lenis Smooth Scroll (lerp ~0.08 to 0.1)
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Initial data fetch & minimum 1.2s, max 6s loader guarantee
    let isCancelled = false;
    const startTime = Date.now();

    const loadInitialData = async () => {
      try {
        const [profData, projData, mlData, settings] = await Promise.all([getProfile(), getProjects(), getDataMlProjects(), getSectionSettings()]);
        if (!isCancelled) {
          setProfile(profData);
          setProjects(projData);
          setDataMlProjects(mlData);
          setSectionSettings(settings);
        }
      } catch (err) {
        if (!isCancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load portfolio.');
      } finally {
        if (!isCancelled) {
          const elapsed = Date.now() - startTime;
          const waitTime = Math.max(0, 1200 - elapsed);
          setTimeout(() => {
            if (!isCancelled) {
              setIsLoading(false);
              setTimeout(() => {
                if (!isCancelled) {
                  setHeroIntroStarted(true);
                }
              }, 200);
            }
          }, waitTime);
        }
      }
    };

    // Safety timeout at 6s
    const maxTimeout = setTimeout(() => {
      if (isLoading && !isCancelled) {
        setIsLoading(false);
        setHeroIntroStarted(true);
      }
    }, 6000);

    loadInitialData();

    return () => {
      isCancelled = true;
      clearTimeout(maxTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Scroll Spy: dynamically update active tab between Work and Info
  useEffect(() => {
    const handleScroll = () => {
      const aboutEl = document.getElementById('about');
      if (!aboutEl) return;
      const rect = aboutEl.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) {
        setActiveTab('info');
      } else {
        setActiveTab('work');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Click Handler with Lenis Smooth Scroll
  const handleTabChange = (tab: 'work' | 'info') => {
    setActiveTab(tab);
    if (!lenisRef.current) return;

    if (tab === 'work') {
      lenisRef.current.scrollTo(0, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      const aboutEl = document.getElementById('about');
      if (aboutEl) {
        lenisRef.current.scrollTo(aboutEl, {
          offset: -80,
          duration: 1.3,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    }
  };

  const handleScrollToProjects = () => {
    const projectsEl = document.getElementById('projects');
    if (projectsEl && lenisRef.current) {
      lenisRef.current.scrollTo(projectsEl, {
        offset: -80,
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };

  // Derive unique categories from projects array
  const rawCategories = Array.from(new Set(projects.map((p) => p.category).filter(Boolean)));
  const categories = ['All', ...rawCategories];

  const filteredProjects =
    selectedCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <div className="bg-[#101010] text-[#e3e2e6] min-h-screen relative selection:bg-white selection:text-[#101010] overflow-x-hidden font-sans">
      {/* Full-screen Loading Screen */}
      <Loader isLoading={isLoading} />

      {/* Smooth Glass Cursor with Spring Physics */}
      <GlassCursor />

      {/* Subtle Slow Ambient Drift Background */}
      <div className="ambient-noise pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_800px_at_50%_200px,rgba(255,255,255,0.02),transparent)]" />

      {/* Top Floating Glass Navbar */}
      {sectionSettings?.navbarSectionVisible !== false && <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showNavAnimation={!isLoading}
        profile={profile}
      />}

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {loadError && <div role="alert" className="mt-32 mx-6 p-6 rounded-2xl border border-red-400/30 text-red-200">
          <p>{loadError}</p><button className="mt-3 underline" onClick={() => window.location.reload()}>Retry loading portfolio</button>
        </div>}
        {/* HERO SECTION */}
        {sectionSettings?.heroSectionVisible !== false && <div id="work" className="w-full">
          <Hero
            onScrollDown={handleScrollToProjects}
            startIntroAnimation={heroIntroStarted}
            profileData={profile}
            isLoading={isLoading}
          />
        </div>}

        {/* WORK & STACKING PROJECT CARDS SECTION */}
        {(sectionSettings?.projectsSectionVisible !== false || sectionSettings?.dataMlSectionVisible !== false) && <section
          id="projects"
          className="relative w-full max-w-[1400px] px-6 sm:px-10 md:px-14 pt-6 pb-24"
        >
          {/* Glass Segmented Tab Control by Category */}
          {sectionSettings?.projectsSectionVisible !== false && <><div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                      : 'bg-white/[0.04] text-[#8e8e93] border border-white/5 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  style={{
                    borderColor: selectedCategory === cat ? 'var(--accent)' : undefined,
                    color: selectedCategory === cat ? 'white' : undefined,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-xs font-mono text-[#8e8e93] shrink-0">
              {filteredProjects.length}{' '}
              {filteredProjects.length === 1 ? 'Case Study' : 'Case Studies'}
            </span>
          </div>

          {/* Stacking Project Cards */}
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                totalCards={filteredProjects.length}
              />
            ))
          ) : (
            /* Neutral Glass Empty State */
            <div className="w-full py-20 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#8e8e93]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white">No projects found</h3>
              <p className="text-sm text-[#8e8e93] mt-1 max-w-xs">
                No case studies are currently categorized under &ldquo;{selectedCategory}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="mt-5 px-5 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition-colors cursor-pointer"
              >
                View all projects
              </button>
            </div>
          )}</>}
          {sectionSettings?.dataMlSectionVisible !== false && <div className={sectionSettings?.projectsSectionVisible !== false ? 'pt-8 border-t border-white/[0.08]' : ''}>
            <div className="flex flex-col gap-1 mb-10">
              <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">Data &amp; ML</span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{sectionSettings?.dataMlTitle || 'Data & ML'}</h2>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{sectionSettings?.dataMlSubtitle || 'Data analysis, machine learning experiments, and data-driven systems.'}</p>
            </div>
            {dataMlProjects.length ? dataMlProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} stackIndex={projects.length + index} totalCards={dataMlProjects.length} />) :
              <p className="text-sm text-white/40">Data &amp; ML projects will appear here when published.</p>}
          </div>}
        </section>}

        {/* INFO / ABOUT SECTION */}
        <div className="w-full">
          <AboutSection sectionSettings={sectionSettings} />
        </div>
      </main>

      {/* FOOTER */}
      {sectionSettings?.footerSectionVisible !== false && <Footer onNavClick={handleTabChange} profile={profile} showContact={sectionSettings?.contactSectionVisible !== false} />}
    </div>
  );
}
