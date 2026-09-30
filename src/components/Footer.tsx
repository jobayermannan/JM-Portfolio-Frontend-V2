import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FooterProps { onNavClick: (tab: 'work' | 'info') => void; profile?: any; showContact?: boolean }
export const Footer: React.FC<FooterProps> = ({ onNavClick, profile, showContact = true }) => {
  const social = profile?.social || {};
  const links = [['GitHub', social.github], ['LinkedIn', social.linkedin], ['Medium', social.medium], ['Facebook', social.facebook], ['Resume', social.resume], ['Email', social.email ? `mailto:${social.email}` : '']].filter(([, url]) => url);
  return <footer className="relative w-full border-t border-white/[0.08] bg-[#0c0c0e] py-16 px-6 sm:px-10 md:px-14">
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-5 flex flex-col gap-3"><h3 className="text-xl sm:text-2xl font-medium text-white tracking-[-0.02em]">{profile?.fullName || 'Portfolio'}</h3><p className="text-sm text-[#8e8e93] max-w-sm leading-relaxed">{profile?.footerDescription ?? profile?.description ?? ''}</p></div>
        <div className="md:col-span-3 flex flex-col gap-3"><span className="text-xs font-mono uppercase text-[#8e8e93] tracking-widest">{profile?.footerNavigationTitle ?? ''}</span><div className="flex flex-col gap-2 text-sm text-[#c4c4c8]">
          <button type="button" onClick={() => onNavClick('work')} className="text-left hover:text-[var(--accent)] w-fit">{profile?.footerWorkLabel ?? ''}</button>
          <button type="button" onClick={() => onNavClick('info')} className="text-left hover:text-[var(--accent)] w-fit">{profile?.footerInfoLabel ?? ''}</button>
          {showContact && <a href="#contact" className="hover:text-[var(--accent)]">{profile?.footerContactLabel ?? ''}</a>}
        </div></div>
        <div className="md:col-span-4 flex flex-col gap-3"><span className="text-xs font-mono uppercase text-[#8e8e93] tracking-widest">{profile?.footerSocialTitle ?? ''}</span><div className="grid grid-cols-2 gap-2.5 text-sm text-[#c4c4c8]">{links.map(([label, url]) => <a key={label} href={url} target={label === 'Email' ? undefined : '_blank'} rel="noreferrer" className="hover:text-white flex items-center gap-1">{label}<ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent)]" /></a>)}</div></div>
      </div>
      <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-4 text-xs text-[#8e8e93]"><span>{profile?.footerCopyright ?? `© ${new Date().getFullYear()} ${profile?.fullName || 'Portfolio'}. All rights reserved.`}</span><span className="font-serif italic text-sm text-[#a1a1aa]">{profile?.footerNote || ''}</span><a href="/admin" className="hover:text-white">Admin</a></div>
    </div>
  </footer>;
};
