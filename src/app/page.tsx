'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { ShieldCheck, Smartphone, Cpu } from 'lucide-react';

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

        {/* Streamlined Live Intelligence Status Bar */}
        <div className="px-5 pt-2 pb-0.5 space-y-1.5">
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-[10px] ${
              isPro
                ? 'bg-[#121620]/90 border-slate-800 text-slate-300'
                : 'bg-white border-slate-200/90 text-slate-700 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate font-semibold text-[9.5px]">
                {lastVerifiedDate}
              </span>
            </div>
            <span
              className={`shrink-0 font-mono font-black px-2 py-0.5 rounded-md text-[8.5px] ${
                isPro ? 'bg-blue-950 text-cyan-300 border border-blue-800/60' : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              {lastSyncedAt}
            </span>
          </div>

          {/* Real-Time Live Intelligence Bulletin */}
          {groqBulletin && (
            <div
              className={`px-3 py-1.5 rounded-xl border text-[10.5px] flex items-center gap-2 ${
                isPro
                  ? 'bg-blue-950/20 border-blue-900/40 text-slate-300'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <p className="leading-tight font-medium truncate">
                <strong className="text-blue-600 dark:text-cyan-400 font-extrabold mr-1">Live:</strong>
                {groqBulletin}
              </p>
            </div>
          )}
        </div>

        {/* Scrollable Main Mobile Hub Content with Generous Whitespace */}
        <main className="flex-1 px-5 py-3 pb-36">
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
