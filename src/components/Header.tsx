'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Zap, Sun, RefreshCw, Download } from 'lucide-react';

export function Header() {
  const { mode, toggleMode, isGroqSyncing, triggerGroqDataSync, isStandalone, triggerPwaInstall } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 border-b ${
        isPro
          ? 'bg-[#0E1118]/95 border-slate-800/80 text-white backdrop-blur-md shadow-xs'
          : 'bg-white/95 border-slate-200/80 text-slate-950 backdrop-blur-md shadow-xs'
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

          {/* PERSIB (Font Besar) + TRACKER (Font Kecil di Bawah) */}
          <div className="flex flex-col justify-center">
            <h1 className="font-black text-base sm:text-lg tracking-tight uppercase leading-none text-slate-950 dark:text-white">
              PERSIB
            </h1>
            <span
              className={`font-black text-[9px] sm:text-[10px] tracking-widest uppercase leading-none mt-1 ${
                isPro ? 'text-cyan-400' : 'text-blue-700'
              }`}
            >
              TRACKER
            </span>
          </div>
        </div>

        {/* Right: Modern Pill Actions */}
        <div className="flex items-center gap-2">
          {/* REFACTOR: Tombol Pasang App di Header yang selalu dapat diakses oleh pengguna browser */}
          {!isStandalone && (
            <button
              onClick={triggerPwaInstall}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-[11px] transition-all shadow-sm active:scale-95 ${
                isPro
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 ring-1 ring-cyan-400/30'
                  : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/20'
              }`}
              title="Pasang aplikasi di layar utama HP"
              aria-label="Pasang Aplikasi di HP"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>Pasang App</span>
            </button>
          )}

          {/* Refresh Action: Hanya Icon UI Refresh (Teks Groq Dihilangkan) */}
          <button
            onClick={() => triggerGroqDataSync()}
            disabled={isGroqSyncing}
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-all active:scale-95 ${
              isPro
                ? 'bg-slate-900 border border-slate-700/80 text-cyan-300 hover:bg-slate-800'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
            title="Sinkronkan data real-time"
            aria-label="Refresh Data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform ${
                isGroqSyncing ? 'animate-spin text-blue-500' : 'text-emerald-500'
              }`}
            />
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
            aria-label="Toggle Theme"
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
