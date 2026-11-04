'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { GroqAgentModal } from '@/components/GroqAgentModal';
import { ShieldCheck, CheckCircle2, Smartphone, Cpu } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, lastVerifiedDate, isGroqAgentOpen, setIsGroqAgentOpen } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    // Outer Container: Clean framing without decorative clutter
    <div
      className={`min-h-screen w-full flex justify-center items-start transition-colors duration-200 ${
        isPro ? 'bg-[#03060c]' : 'bg-[#e2e8f0]'
      }`}
    >
      {/* Desktop Helper Notice (hidden on actual mobile phones) */}
      <div className="hidden xl:flex fixed left-10 top-12 flex-col gap-2 max-w-xs text-xs pointer-events-none">
        <div
          className={`p-4 rounded-2xl border ${
            isPro ? 'bg-[#08101e] border-blue-900/50 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile-First View</span>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80">
            Aplikasi ini terformat dalam rasio smartphone (430px) menyajikan 100% data faktual resmi Liga 1 & ACL Two tanpa elemen dekoratif fiktif.
          </p>
        </div>
      </div>

      {/* Mobile Device Container */}
      <div
        className={`w-full max-w-[430px] min-h-screen flex flex-col relative transition-colors duration-200 sm:my-3 sm:rounded-3xl sm:border ${
          isPro
            ? 'bg-[#060B13] text-slate-100 sm:border-blue-900/50'
            : 'bg-[#F8FAFC] text-slate-950 sm:border-slate-300'
        }`}
      >
        {/* Mobile Header */}
        <Header />

        {/* Top Status & Verification Pill (Clean, factual) */}
        <div className="px-3.5 pt-2.5 pb-1">
          <div
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-[10px] font-mono border ${
              isPro
                ? 'bg-blue-950/70 border-cyan-500/30 text-cyan-300'
                : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate">{lastVerifiedDate}</span>
            </div>
            <span
              className={`shrink-0 font-bold uppercase px-1.5 py-0.2 rounded ${
                isPro ? 'bg-blue-900 text-cyan-200' : 'bg-blue-100 text-blue-900'
              }`}
            >
              Verified
            </span>
          </div>
        </div>

        {/* Scrollable Main Mobile Hub Content */}
        <main className="flex-1 px-3.5 py-2.5 pb-24">
          <div>
            {activeHub === 'match-center' && <MatchCenter />}
            {activeHub === 'roster' && <RosterDeepDive />}
            {activeHub === 'transparency' && <CorporateTransparency />}
          </div>

          {/* Floating Maung AI Trigger Pill (Clean, without decorative spinning) */}
          <div className="fixed bottom-18 right-4 sm:right-auto sm:left-1/2 sm:translate-x-32 z-30">
            <button
              onClick={() => setIsGroqAgentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-700 text-white font-bold text-xs shadow-md hover:bg-blue-800 active:scale-95 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-300" />
              <span>Maung AI</span>
            </button>
          </div>

          {/* Compact Mobile Footer */}
          <footer
            className={`mt-8 pt-3 border-t text-[10px] text-center ${
              isPro ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 font-bold mb-0.5">
              <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
              <span>PERSIB TRACKER • PT Persib Bandung Bermartabat</span>
            </div>
            <p className="opacity-75">100% Data Resmi Terverifikasi Musim 2026/2027</p>
          </footer>
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <MobileBottomNav />

        {/* Groq AI Sports Intelligence Agent Modal */}
        <GroqAgentModal
          isOpen={isGroqAgentOpen}
          onClose={() => setIsGroqAgentOpen(false)}
        />
      </div>
    </div>
  );
}
