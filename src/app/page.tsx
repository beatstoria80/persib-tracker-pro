'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { ShieldCheck, CheckCircle2, Smartphone, Cpu } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, lastVerifiedDate, lastSyncedAt, groqBulletin } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    // Outer Container: Crisp framing with modern negative space
    <div
      className={`min-h-screen w-full flex justify-center items-start transition-colors duration-200 ${
        isPro ? 'bg-[#080B11]' : 'bg-[#EDF2F7]'
      }`}
    >
      {/* Desktop Helper Notice */}
      <div className="hidden xl:flex fixed left-10 top-12 flex-col gap-2 max-w-xs text-xs pointer-events-none">
        <div
          className={`p-4 rounded-3xl border ${
            isPro ? 'bg-[#121620] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile-First Layout</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Didesain presisi dalam rasio smartphone modern (430px) dengan visual style minimalis, kartu dual-tone, dan negative space lapang.
          </p>
        </div>
      </div>

      {/* Mobile Device Canvas */}
      <div
        className={`w-full max-w-[430px] min-h-screen flex flex-col relative transition-colors duration-200 sm:my-3 sm:rounded-[40px] sm:border overflow-hidden ${
          isPro
            ? 'bg-[#0E1118] text-white sm:border-slate-800 shadow-2xl'
            : 'bg-[#F8FAFC] text-slate-950 sm:border-slate-200 shadow-xl'
        }`}
      >
        {/* Sleek Mobile Header */}
        <Header />

        {/* Top Status & Live Groq Feeder Bulletin */}
        <div className="px-5 pt-3 pb-1 space-y-2">
          <div
            className={`flex items-center justify-between px-3.5 py-1.5 rounded-full text-[10px] font-mono border ${
              isPro
                ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{lastVerifiedDate}</span>
            </div>
            <span
              className={`shrink-0 font-bold uppercase px-2 py-0.5 rounded-full text-[9px] ${
                isPro ? 'bg-blue-900/80 text-cyan-300' : 'bg-blue-100 text-blue-900'
              }`}
            >
              {lastSyncedAt}
            </span>
          </div>

          {/* Real-Time Live Intelligence Bulletin */}
          {groqBulletin && (
            <div
              className={`px-3.5 py-2 rounded-2xl border text-[11px] flex items-start gap-2 ${
                isPro
                  ? 'bg-blue-950/30 border-blue-900/50 text-slate-300'
                  : 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-xs'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-snug font-medium line-clamp-2">
                <strong className="text-blue-600 dark:text-cyan-400 font-extrabold">Groq Feeder:</strong> {groqBulletin}
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Main Mobile Hub Content with Generous Whitespace */}
        <main className="flex-1 px-5 py-3 pb-32">
          <div>
            {activeHub === 'match-center' && <MatchCenter />}
            {activeHub === 'roster' && <RosterDeepDive />}
            {activeHub === 'transparency' && <CorporateTransparency />}
          </div>

          {/* Compact Minimal Footer */}
          <footer
            className={`mt-10 pt-4 border-t text-[10px] text-center ${
              isPro ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>PERSIB TRACKER • PT Persib Bandung Bermartabat</span>
            </div>
            <p className="opacity-75">100% Data Resmi Musim 2026/2027</p>
          </footer>
        </main>

        {/* Floating Pill Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
