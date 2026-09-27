import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  BookOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import {
  getSkills,
  getEducation,
  getCourses,
  getBlogs,
  getProfile,
  sendMessage,
} from '../api/index.js';

interface BlogArticle {
  id: string;
  year: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
}

export const AboutSection: React.FC = () => {
  // State for fetched data
  const [profile, setProfile] = useState<any>(null);
  const [skillsData, setSkillsData] = useState<any>(null);
  const [education, setEducation] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active blog for detail modal
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);

  // Contact form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [profRes, skillsRes, eduRes, coursesRes, blogsRes] = await Promise.all([
          getProfile(),
          getSkills(),
          getEducation(),
          getCourses(),
          getBlogs(),
        ]);

        if (isMounted) {
          setProfile(profRes);
          setSkillsData(skillsRes);
          setEducation(eduRes);
          setCourses(coursesRes);
          setBlogs(blogsRes);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load portfolio content.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setSubmitError('Please complete all fields before sending.');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendMessage({
        name: formName.trim(),
        email: formEmail.trim(),
        message: formMessage.trim(),
      });
      setSubmitSuccess(true);
      setFormName('');
      setFormEmail('');
      setFormMessage('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group blogs by year
  const blogsByYear = blogs.reduce<Record<string, BlogArticle[]>>((acc, blog) => {
    if (!acc[blog.year]) {
      acc[blog.year] = [];
    }
    acc[blog.year].push(blog);
    return acc;
  }, {});
  const sortedYears = Object.keys(blogsByYear).sort((a, b) => Number(b) - Number(a));

  if (isLoading) {
    return (
      <section id="about" className="relative w-full pt-28 sm:pt-36 pb-24 px-6 sm:px-10 md:px-14">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-12">
          {/* Glass Skeleton Header */}
          <div className="flex flex-col gap-4 max-w-3xl">
            <div className="w-28 h-4 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/5 animate-pulse" />
            <div className="w-full h-16 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/5 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-6 aspect-[4/3] rounded-3xl bg-white/[0.04] border border-white/5 animate-pulse" />
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="w-3/4 h-8 rounded-xl bg-white/[0.05] border border-white/5 animate-pulse" />
              <div className="w-full h-24 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
              <div className="w-full h-24 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="about" className="relative w-full pt-28 pb-24 px-6 sm:px-10 md:px-14">
        <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-white/[0.04] border border-red-500/20 backdrop-blur-xl text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-white text-lg font-medium">Failed to load content</h3>
          <p className="text-white/60 text-sm mt-1 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const about = skillsData?.about || {};
  const skills = skillsData?.skills || [];
  const experiences = profile?.experience || [];
  const contact = profile?.contact || {};

  return (
    <section id="about" className="relative w-full pt-28 sm:pt-36 pb-24 px-6 sm:px-10 md:px-14">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-16 sm:gap-24">
        {/* Eyebrow & Headline Header (Matches Image 3) */}
        <div className="flex flex-col gap-6 max-w-5xl">
          {/* Eyebrow: glowing white dot + "ABOUT ME" */}
          <div className="flex items-center gap-3">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block transition-colors duration-300"
              style={{
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent-glow)',
              }}
            />
            <span className="text-[#8e8e93] text-[13px] font-medium tracking-[0.15em] uppercase font-sans">
              {about.eyebrow ?? ''}
            </span>
          </div>

          {/* Headline: "I'm passionate about creating beautiful products that empower people." */}
          <h2 className="text-[32px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-medium tracking-[-0.03em] leading-[1.08] text-white">
            <span className="flex flex-wrap items-baseline gap-x-[0.28em]">
              <span>{about.headlinePrefix ?? ''}</span>
              {/* Emphasized italic serif with silver-to-accent gradient */}
              <span className="inline-block font-serif italic text-accent-gradient text-accent-glow font-normal ml-1">
                {about.headlineAccent ?? ''}
              </span>
            </span>
          </h2>
        </div>

        {/* Two-Column Grid: Left Photo Card + Right Story Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Large photo in rounded frame with dark glass bezel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 rounded-3xl p-3 sm:p-4 bg-white/[0.04] border border-white/[0.12] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] group overflow-hidden"
          >
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#18191c] relative">
              <img
                src={profile?.avatar || '/projects/avater.jpg'}
                alt={profile?.fullName || 'Profile'}
                className="w-full h-full object-cover transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/90 font-mono">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{contact.address || ''}</span>
                </span>
                <span className="text-white/60">{profile?.caption || ''}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Story Text */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="lg:col-span-6 flex flex-col gap-6"
          >
            {/* White Story Lead Paragraph (~24px) */}
            <p className="text-white text-xl sm:text-[23px] font-normal leading-[1.38] tracking-tight">
              {about.storyLead ?? ''}
            </p>

            {/* Gray continuation text */}
            <div className="flex flex-col gap-4 text-base sm:text-[16px] text-[#a1a1aa] leading-relaxed">
              <p>{about.description1}</p>
              <p>{about.description2}</p>
            </div>

            {/* Contact quick link */}
            <div className="pt-2">
              <a
                href="#contact"
                className="text-white hover:text-white/80 text-sm font-medium inline-flex items-center gap-1.5 group transition-colors"
              >
                <span>{about.contactCtaLabel ?? ''}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Experience & Education Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 border-t border-white/[0.08]">
          {/* Experience Section */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
                Career History
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Experience
            </h3>

            <div className="flex flex-col gap-4">
              {!experiences.length && <p className="text-sm text-white/40">No experience listed yet.</p>}
              {experiences.map((exp: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col gap-2.5 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-white">{exp.company}</h4>
                    <span className="text-xs font-mono text-[#8e8e93] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {exp.period}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-[var(--accent)]">{exp.title}</span>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
              <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
                Academic Background
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Education
            </h3>

            <div className="flex flex-col gap-4">
              {!education.length && <p className="text-sm text-white/40">No education listed yet.</p>}
              {education.map((edu: any) => (
                <div
                  key={edu.id || edu.degree}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col gap-2.5 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-white">{edu.institution}</h4>
                    <span className="text-xs font-mono text-[#8e8e93] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                      {edu.year}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--accent)]">{edu.degree}</span>
                    {edu.status && (
                      <span className="text-[11px] font-mono text-white/50">· {edu.status}</span>
                    )}
                  </div>
                  {edu.description && (
                    <p className="text-sm text-[#a1a1aa] leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills & Capabilities with Progress Bars */}
        <div className="flex flex-col gap-8 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
              Technical Stack &amp; Mastery
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Skills Breakdown
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {!skills.length && <p className="text-sm text-white/40">No skills listed yet.</p>}
            {skills.map((skill: any) => (
              <div
                key={skill.name}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-all flex flex-col gap-3 backdrop-blur-md group"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white group-hover:text-[var(--accent)] transition-colors">
                    {skill.name}
                  </span>
                  <span className="font-mono text-xs text-[#8e8e93]">{skill.percentage}%</span>
                </div>

                {/* Progress bar with accent indicator */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor: 'var(--accent)',
                      boxShadow: '0 0 10px var(--accent-glow)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div className="flex flex-col gap-8 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
              Professional Training
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Courses &amp; Specializations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!courses.length && <p className="text-sm text-white/40">No courses listed yet.</p>}
            {courses.map((course: any) => (
              <div
                key={course.id}
                className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between gap-6 backdrop-blur-md relative overflow-hidden group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80">
                      {course.category}
                    </span>
                    {course.badge && (
                      <span className="text-xs font-mono text-[var(--accent)] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {course.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xl sm:text-2xl font-semibold text-white mt-1">
                    {course.title}
                  </h4>
                  <p className="text-xs font-mono text-[#8e8e93]">{course.instructor}</p>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed mt-1">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  {course.link && <a
                    href={course.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-[var(--accent)] transition-colors group/link"
                  >
                    <span>View Curriculum</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blog Section Grouped by Year */}
        <div className="flex flex-col gap-8 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col gap-1">
            <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
              Writing &amp; Metaphors
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Technical Articles &amp; Insights
            </h3>
          </div>

          <div className="flex flex-col gap-10">
            {!blogs.length && <p className="text-sm text-white/40">No articles published yet.</p>}
            {sortedYears.map((year) => (
              <div key={year} className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-medium text-[var(--accent)]">{year}</span>
                  <div className="h-px flex-1 bg-white/[0.08]" />
                </div>

                <div className="flex flex-col divide-y divide-white/[0.06]">
                  {blogsByYear[year].map((blog) => (
                    <div
                      key={blog.id}
                      className="py-5 first:pt-2 last:pb-2 flex flex-col md:flex-row md:items-baseline justify-between gap-4 group"
                    >
                      <div className="flex flex-col gap-1 max-w-2xl">
                        <div className="flex items-center gap-3 text-xs text-[#8e8e93] font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{blog.date}</span>
                        </div>
                        <h4 className="text-lg sm:text-xl font-medium text-white group-hover:text-[var(--accent)] transition-colors mt-0.5">
                          {blog.title}
                        </h4>
                        <p className="text-sm text-[#a1a1aa] line-clamp-2 mt-1">{blog.excerpt}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedBlog(blog)}
                        className="self-start md:self-center shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-all cursor-pointer group/btn"
                      >
                        <span>See more</span>
                        <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-[var(--accent)]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / Say Hello Section */}
        <div id="contact" className="flex flex-col gap-10 pt-8 border-t border-white/[0.08]">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="text-[#8e8e93] text-xs font-mono uppercase tracking-widest">
              Get in Touch
            </span>
            <h3 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              {contact.heading ?? ''}
            </h3>
            <p className="text-[#a1a1aa] text-base leading-relaxed">
              {contact.description ?? ''}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl flex flex-col gap-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-xs font-mono text-[#8e8e93] uppercase">Identity Card</span>
                <h4 className="text-xl font-medium text-white">{contact.name || profile?.fullName}</h4>
                <p className="text-xs text-[var(--accent)]">{profile?.caption || ''}</p>
              </div>

              <div className="flex flex-col gap-4 text-sm">
                {contact.email && <div className="flex items-center gap-3 text-white/80">
                  <Mail className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {contact.email}
                  </a>
                </div>}

                {contact.mobile && <div className="flex items-center gap-3 text-white/80">
                  <Phone className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <a href={`tel:${contact.mobile}`} className="hover:text-white transition-colors">
                    {contact.mobile}
                  </a>
                </div>}

                {contact.address && <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>{contact.address}</span>
                </div>}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#8e8e93]">
                <span>{contact.availability || ''}</span>
                <span>{contact.timezone || ''}</span>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
              <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                {submitSuccess && (
                  <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Thank you! Your message has been sent successfully.</span>
                  </div>
                )}

                {submitError && (
                  <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-medium text-white/70">
                      Your Name
                    </label>
                    <input
                      id="name"
                      maxLength={120}
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-white/70">
                      Email Address
                    </label>
                    <input
                      id="email"
                      maxLength={254}
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-medium text-white/70">
                    Message
                  </label>
                  <textarea
                    id="message"
                    maxLength={5000}
                    required
                    rows={4}
                    placeholder="Tell me about your project, idea, or role..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 self-start px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 text-xs font-medium transition-all duration-200 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    boxShadow: '0 0 20px var(--accent-glow)',
                  }}
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>{contact.formButtonLabel ?? ''}</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Article Detail Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlog(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-[#141518]/95 border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10 my-auto"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent)]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedBlog.date}</span>
                  <span>·</span>
                  <span>{selectedBlog.year}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-snug">
                  {selectedBlog.title}
                </h3>

                <div className="mt-2 text-base text-[#d1d1d6] leading-relaxed font-sans space-y-4">
                  {selectedBlog.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-[#8e8e93]">
                  Author: {profile?.fullName || ''}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBlog(null)}
                  className="px-5 py-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black text-xs font-medium transition-colors cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
