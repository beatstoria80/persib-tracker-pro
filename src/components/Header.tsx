'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Zap, Sun, RefreshCw } from 'lucide-react';

export function Header() {
  const { mode, toggleMode, isGroqSyncing, triggerGroqDataSync } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-200 border-b ${
        isPro
          ? 'bg-[#0E1118]/90 border-slate-800/80 text-white backdrop-blur-md'
          : 'bg-white/90 border-slate-200/80 text-slate-950 backdrop-blur-md'
      }`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="px-5 h-16 flex items-center justify-between">
        {/* Left: Sleek Badge Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center p-1 font-black tracking-wider text-xs shadow-sm transition-transform active:scale-95 ${
                isPro
                  ? 'bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-500/30 text-white shadow-blue-900/30'
                  : 'bg-white border border-slate-200 text-blue-700 shadow-sm'
              }`}
            >
              <img
                src="https://img.a.transfermarkt.technology/wappen/head/14105.png"
                alt="Persib 1933"
                className="w-8 h-8 object-contain drop-shadow-sm select-none"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          <div>
            <h1 className="font-black text-sm tracking-tight uppercase leading-none">
              PERSIB <span className={isPro ? 'text-cyan-400' : 'text-blue-700'}>TRACKER</span>
            </h1>
          </div>
        </div>

        {/* Right: Modern Pill Actions */}
        <div className="flex items-center gap-2">
          {/* Real-time Groq Backend Sync Action */}
          <button
            onClick={() => triggerGroqDataSync()}
            disabled={isGroqSyncing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95 ${
              isPro
                ? 'bg-slate-900 border border-slate-700/80 text-cyan-300 hover:bg-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="Sinkronkan data real-time dengan Groq LPU"
          >
            <RefreshCw className={`w-3 h-3 ${isGroqSyncing ? 'animate-spin text-blue-500' : 'text-emerald-500'}`} />
            <span className="font-mono text-[10px] font-extrabold">
              {isGroqSyncing ? 'Syncing...' : 'Groq'}
            </span>
          </button>

          {/* Theme State Switcher */}
          <button
            onClick={toggleMode}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
              isPro
                ? 'bg-slate-900 border border-slate-700/80 text-amber-300 hover:bg-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
            }`}
            title="Ganti Mode Tampilan (Light / Dark Pro)"
          >
            {isPro ? (
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
