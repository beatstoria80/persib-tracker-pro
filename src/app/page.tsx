'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { ShieldCheck, Sparkles, Radio } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, lastUpdateTimestamp } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-semibold ${
                isPro
                  ? 'bg-blue-950/70 border border-cyan-500/30 text-cyan-300'
                  : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Real-Time Sync Terakhir: {lastUpdateTimestamp}</span>
            </span>

            <span
              className={`hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                isPro
                  ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isPro
                ? 'State B Aktif (Neon Blue & Glowing Gold • Matchday View)'
                : 'State A Aktif (Ultra-Minimalist Day-to-Day • Focus on Clean Data)'}
            </span>
          </div>

          <div className="text-slate-400 text-[11px] font-medium flex items-center gap-2">
            <span>Powered by Verified PT LIB & AFC Data Feeds</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>

        <div className="transition-all duration-300">
          {activeHub === 'match-center' && <MatchCenter />}
          {activeHub === 'roster' && <RosterDeepDive />}
          {activeHub === 'transparency' && <CorporateTransparency />}
        </div>
      </main>

      <footer
        className={`mt-16 border-t py-8 text-xs transition-colors duration-300 ${
          isPro
            ? 'bg-[#04080F] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-black flex items-center justify-center text-xs">
              P
            </div>
            <div>
              <span className="font-bold text-slate-200">Persib Tracker Intelligence Engine</span>
              <p className="text-[11px] text-slate-400">
                Official Club Intelligence • PT Persib Bandung Bermartabat (PBB)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Anti-Rumor / Data Terverifikasi
            </span>
            <span>•</span>
            <span>PWA Offline-Ready</span>
            <span>•</span>
            <span>Framer Motion Adaptive Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
