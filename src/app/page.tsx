'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, activeTournament, lastSyncedAt, syncFeedback } = useClubTracker();
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
        className={`w-full max-w-[430px] min-h-screen flex flex-col relative transition-colors duration-200 sm:my-3 sm:rounded-[40px] sm:border overflow-x-clip ${
          isPro
            ? 'bg-[#0E1118] text-white sm:border-slate-800 shadow-2xl'
            : 'bg-[#F8FAFC] text-slate-950 sm:border-slate-200 shadow-xl'
        }`}
      >
        {/* Sleek Mobile Header */}
        <Header />

        {/* Real-Time Live Sync Notification Toast */}
        {syncFeedback && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-emerald-400/40 transition-all animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 1-Tap PWA Install Card for Mobile Users */}
        <InstallPwaPrompt />

        {/* Unified Minimal Live Status Banner */}
        <div className="px-4 sm:px-5 pt-2.5 pb-1">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-2xl border text-xs gap-2 ${
              isPro
                ? 'bg-[#121620]/90 border-slate-800 text-slate-300 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="truncate text-[11px] font-bold">
                {activeTournament === 'liga1' ? (
                  <>
                    <span className="text-blue-600 dark:text-cyan-400 font-extrabold mr-1">Super League:</span>
                    <span>PERSIB 4 - 0 Isenmulang (FT) • Peringkat #5</span>
                  </>
                ) : activeTournament === 'acl2' ? (
                  <>
                    <span className="text-blue-600 dark:text-cyan-400 font-extrabold mr-1">ACL Two:</span>
                    <span className="hidden sm:inline">Melbourne Victory</span>
                    <span className="sm:hidden">Melb. Victory</span> 1 - 2 PERSIB (FT)
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-cyan-400 font-extrabold mr-1">Shopee Cup:</span>
                    <span>Port FC 1 - 3 PERSIB (FT)</span>
                  </>
                )}
              </p>
            </div>
            <span
              className={`shrink-0 font-mono font-extrabold px-2 py-0.5 rounded-lg text-[9px] ${
                isPro ? 'bg-blue-950 text-cyan-300 border border-blue-800/60' : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              {lastSyncedAt}
            </span>
          </div>
        </div>

        {/* Scrollable Main Mobile Hub Content with Generous Whitespace */}
        <main className="flex-1 px-4 sm:px-5 py-3 pb-44">
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
