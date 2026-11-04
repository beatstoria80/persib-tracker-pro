'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { ShieldCheck, Zap, Sun, Sparkles } from 'lucide-react';

export function Header() {
  const { mode, toggleMode, setIsGroqAgentOpen } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 backdrop-blur-xl border-b ${
        isPro
          ? 'bg-[#060B13]/95 border-blue-900/50 text-slate-100 shadow-[0_2px_15px_rgba(0,102,255,0.12)]'
          : 'bg-white/95 border-slate-300 text-slate-950 shadow-sm'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-4 h-15 flex items-center justify-between">
        {/* Left: Branding & Verified Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black tracking-wider text-xs shadow-md transition-all ${
                isPro
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-900 text-amber-300 ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white ring-2 ring-blue-500/30'
              }`}
            >
              P1933
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight uppercase">
                Persib{' '}
                <span
                  className={
                    isPro
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300'
                      : 'text-blue-700'
                  }
                >
                  Tracker
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border ${
                  isPro
                    ? 'bg-blue-950/90 text-cyan-300 border-cyan-500/30'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                <ShieldCheck className="w-2.5 h-2.5 text-blue-600 dark:text-cyan-400" /> Resmi
              </span>
            </div>
            <p className={`text-[10px] font-medium leading-none ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
              Musim 2026/27 • Liga 1 & ACL Two
            </p>
          </div>
        </div>

        {/* Right: Groq AI & Mode Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsGroqAgentOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-all border shadow-xs active:scale-95 ${
              isPro
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 hover:bg-amber-400/20'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="Buka Maung AI • Groq LPU Sports Intelligence"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-pulse" />
            <span className="font-black text-[10px]">AI GROQ</span>
          </button>

          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-all border active:scale-95 ${
              isPro
                ? 'bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white border-2 border-blue-700 text-blue-900 shadow-sm hover:bg-blue-50'
            }`}
            title="Ganti Mode Tampilan (State A / State B)"
          >
            {isPro ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
                <span className="text-amber-300 font-black">PRO</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span className="text-blue-700 font-black">LIGHT</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
