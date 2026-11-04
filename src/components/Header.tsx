'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { ShieldCheck, Zap, Sun, Sparkles } from 'lucide-react';

export function Header() {
  const { mode, toggleMode, setIsGroqAgentOpen } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isPro
          ? 'bg-[#060B13] border-blue-900/50 text-slate-100'
          : 'bg-white border-slate-300 text-slate-950'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-4 h-14 flex items-center justify-between">
        {/* Left: Branding & Verified Badge */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-black tracking-wider text-xs shadow-xs ${
                isPro
                  ? 'bg-blue-600 text-amber-300 ring-1 ring-cyan-400/50'
                  : 'bg-blue-700 text-white ring-1 ring-blue-500/30'
              }`}
            >
              P1933
            </div>
            {/* Clean solid status dot (No decorative ping/pulsing) */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-500 border border-white dark:border-slate-900" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight uppercase">
                Persib{' '}
                <span className={isPro ? 'text-cyan-400' : 'text-blue-700'}>
                  Tracker
                </span>
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border ${
                  isPro
                    ? 'bg-blue-950 text-cyan-300 border-cyan-500/30'
                    : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                <ShieldCheck className="w-2.5 h-2.5 text-blue-600 dark:text-cyan-400" /> Resmi
              </span>
            </div>
            <p className={`text-[10px] font-medium leading-none ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
              Data Faktual • PT LIB & AFC
            </p>
          </div>
        </div>

        {/* Right: Groq AI & Mode Switcher (Clean, no decorative bounce/pulse) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsGroqAgentOpen(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-colors border active:scale-95 ${
              isPro
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 hover:bg-amber-400/20'
                : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="Buka Maung AI • Groq Sports Intelligence"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-black text-[10px]">AI GROQ</span>
          </button>

          <button
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold tracking-wide transition-colors border active:scale-95 ${
              isPro
                ? 'bg-slate-900 border-slate-700 text-cyan-300 hover:bg-slate-800'
                : 'bg-white border-2 border-blue-700 text-blue-900 hover:bg-blue-50'
            }`}
            title="Ganti Mode Tampilan (State A / State B)"
          >
            {isPro ? (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
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
