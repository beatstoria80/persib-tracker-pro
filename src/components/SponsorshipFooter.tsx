'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Globe, Mail, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export function SponsorshipFooter() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const sponsorLinks = [
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@ninoc.co',
      href: 'https://www.instagram.com/ninoc.co',
      accentColor: 'text-pink-500 dark:text-pink-400',
      bgColor: 'hover:bg-pink-500/10 dark:hover:bg-pink-500/15',
      icon: (
        <svg
          className="w-4 h-4 shrink-0 text-pink-500 dark:text-pink-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@ninoc.co',
      href: 'https://www.tiktok.com/@ninoc.co',
      accentColor: 'text-slate-900 dark:text-cyan-400',
      bgColor: 'hover:bg-cyan-500/10 dark:hover:bg-cyan-500/15',
      icon: (
        <svg
          className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-cyan-400"
          viewBox="0 0 24 24"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.88-4.47V8.9a8.28 8.28 0 0 0 4.89 1.57v-3.78z" />
        </svg>
      ),
    },
    {
      id: 'website',
      name: 'Website',
      handle: 'ninoc.store',
      href: 'https://ninoc.store',
      accentColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/15',
      icon: <Globe className="w-4 h-4 shrink-0 text-blue-600 dark:text-cyan-400" />,
    },
    {
      id: 'email',
      name: 'Email',
      handle: 'ninoc.enterprise@gmail.com',
      href: 'mailto:ninoc.enterprise@gmail.com',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
      icon: <Mail className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  return (
    <footer className="mt-10 pt-4 pb-2 text-center select-none">
      {/* =========================================================================
          SPONSORSHIP & OFFICIAL PARTNER CARD
          ========================================================================= */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 shadow-sm ${
          isPro
            ? 'bg-gradient-to-br from-[#121622] via-[#0E121A] to-[#0A0D14] border-slate-800 text-slate-200'
            : 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50 border-blue-200/80 text-slate-800'
        }`}
      >
        {/* Header Sponsor Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
              <span>OFFICIAL SPONSOR</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Aplikasi Didukung Oleh
            </span>
          </div>

          <span className="text-[10px] font-mono font-extrabold text-blue-600 dark:text-cyan-400">
            NINOC ENTERPRISE
          </span>
        </div>

        {/* Brand Headline */}
        <div className="text-left mb-3.5">
          <h4 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
            NINOC (ninoc.co)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
            Official Merchandise & Digital Creative Partner PERSIB TRACKER PRO
          </p>
        </div>

        {/* 2x2 Grid Interactive Links */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {sponsorLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2.5 rounded-2xl border transition-all active:scale-95 flex items-center justify-between gap-2 ${
                isPro
                  ? `bg-[#161B28]/80 border-slate-800 hover:border-slate-700 ${item.bgColor}`
                  : `bg-white border-slate-200 hover:border-blue-300 shadow-2xs ${item.bgColor}`
              }`}
              title={`Kunjungi ${item.name} (${item.handle})`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.icon}
                <div className="min-w-0">
                  <span className="block text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400 leading-none">
                    {item.name}
                  </span>
                  <span className="block text-[11px] font-black truncate leading-tight mt-0.5 text-slate-900 dark:text-slate-100">
                    {item.id === 'email' ? 'Hubungi Kami' : item.handle}
                  </span>
                </div>
              </div>

              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 opacity-60" />
            </a>
          ))}
        </div>

        {/* Email Direct Display */}
        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
          <Mail className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
          <span>Inquiries:</span>
          <a
            href="mailto:ninoc.enterprise@gmail.com"
            className="font-mono font-bold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            ninoc.enterprise@gmail.com
          </a>
        </div>
      </div>

      {/* =========================================================================
          PERSIB OFFICIAL DATA ACCREDITATION
          ========================================================================= */}
      <div className="mt-6 text-[10px] text-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>PERSIB TRACKER • PT Persib Bandung Bermartabat</span>
        </div>
        <p className="opacity-75">100% Data Resmi Musim 2026/2027</p>
      </div>
    </footer>
  );
}
