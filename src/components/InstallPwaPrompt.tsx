'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export function InstallPwaPrompt() {
  const { mode, isStandalone, triggerPwaInstall } = useClubTracker();
  const isPro = mode === 'pro';

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  // REFACTOR: Jangan tampilkan jika pengguna sudah membuka di mode aplikasi mandiri (PWA standalone) atau jika di-dismiss
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <div className="px-4 sm:px-5 pt-1.5 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
      <div
        className={`relative overflow-hidden p-3.5 sm:p-4 rounded-3xl border shadow-xl flex items-center justify-between gap-3.5 transition-all ${
          isPro
            ? 'bg-gradient-to-r from-blue-950 via-[#101726] to-[#0A0E17] border-blue-500/40 shadow-blue-900/30 text-white'
            : 'bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border-blue-300 shadow-blue-500/15 text-slate-900'
        }`}
      >
        {/* Subtle Background Glow */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Left Side: Persib App Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-1.5 shrink-0 shadow-lg ring-2 ring-cyan-400/50">
              <img
                src="https://img.a.transfermarkt.technology/wappen/head/14105.png"
                alt="Persib Crest"
                className="w-8 h-8 object-contain drop-shadow"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0E1424]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm tracking-tight">
                Pasang Aplikasi di HP
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-500 text-white shadow-xs">
                Resmi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>Akses 1-ketuk langsung dari layar utama HP</span>
            </p>
          </div>
        </div>

        {/* Right Side: Install CTA Button & Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerPwaInstall}
            className="px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span>Install</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 hidden sm:inline" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/20 transition-all"
            title="Tutup banner pemasangan"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
