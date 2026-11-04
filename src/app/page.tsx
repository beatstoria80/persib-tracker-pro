'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { ShieldCheck, CheckCircle2, Smartphone } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, lastVerifiedDate } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    // Outer Container: On desktop, provides ambient stadium backdrop; on mobile, takes 100% full screen
    <div
      className={`min-h-screen w-full flex justify-center items-start transition-colors duration-500 ${
        isPro ? 'bg-[#03060c]' : 'bg-[#e2e8f0]'
      }`}
    >
      {/* Desktop Helper Backdrop Note (hidden on mobile) */}
      <div className="hidden xl:flex fixed left-10 top-12 flex-col gap-2 max-w-xs text-xs pointer-events-none">
        <div
          className={`p-4 rounded-2xl border ${
            isPro ? 'bg-[#08101e]/80 border-blue-900/50 text-slate-300' : 'bg-white/90 border-slate-300 text-slate-800 shadow-md'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile-Only Layout Active</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Aplikasi ini dikunci secara ketat dalam layout smartphone (430px) untuk interaksi sentuh optimal dan standar aplikasi klub resmi.
          </p>
        </div>
      </div>

      {/* Mobile Device Container (Edge-to-edge on mobile, sleek phone frame on desktop) */}
      <div
        className={`w-full max-w-[430px] min-h-screen flex flex-col relative transition-all duration-300 sm:my-4 sm:rounded-[36px] sm:shadow-[0_20px_70px_rgba(0,0,0,0.35)] sm:border sm:overflow-hidden ${
          isPro
            ? 'bg-[#060B13] text-slate-100 sm:border-blue-900/50'
            : 'bg-[#F8FAFC] text-slate-950 sm:border-slate-300'
        }`}
      >
        {/* Mobile Header */}
        <Header />

        {/* Top Status & Verification Pill */}
        <div className="px-3.5 pt-3 pb-1">
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[10px] font-mono border ${
              isPro
                ? 'bg-blue-950/70 border-cyan-500/30 text-cyan-300'
                : 'bg-white border-slate-300 text-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{lastVerifiedDate}</span>
            </div>
            <span
              className={`shrink-0 font-bold uppercase px-1.5 py-0.2 rounded ${
                isPro ? 'bg-amber-400/20 text-amber-300' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {isPro ? 'PRO MODE' : 'LIGHT'}
            </span>
          </div>
        </div>

        {/* Scrollable Main Mobile Hub Content */}
        <main className="flex-1 px-3.5 py-3 pb-28">
          <div className="transition-all duration-300">
            {activeHub === 'match-center' && <MatchCenter />}
            {activeHub === 'roster' && <RosterDeepDive />}
            {activeHub === 'transparency' && <CorporateTransparency />}
          </div>

          {/* Compact Mobile Footer */}
          <footer
            className={`mt-10 pt-4 border-t text-[10px] text-center transition-colors ${
              isPro ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>PERSIB TRACKER • PT Persib Bandung Bermartabat</span>
            </div>
            <p className="opacity-75">100% Data Faktual & Terverifikasi Musim 2026/2027</p>
          </footer>
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
