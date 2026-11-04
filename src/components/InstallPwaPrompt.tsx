'use client';

import React, { useState, useEffect } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Download, X, Share2, PlusSquare, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function InstallPwaPrompt() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Lazy state initializers to avoid cascading render lint errors in React 19
  const [isStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [isIos] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  useEffect(() => {
    // Listen for Android/Chrome beforeinstallprompt and appinstalled events
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    }
  };

  // If already standalone, dismissed, or already installed, don't show
  if (isStandalone || isDismissed || isInstalled) {
    return null;
  }

  // Only show if prompt is ready (Android/Chrome) or on iOS Safari
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <>
      {/* Non-intrusive Install Prompt Card */}
      <div className="px-4 sm:px-5 pt-1 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
        <div
          className={`p-3 rounded-2xl border shadow-lg flex items-center justify-between gap-3 ${
            isPro
              ? 'bg-gradient-to-r from-blue-950/80 via-[#121620] to-[#0E1118] border-blue-800/60 shadow-blue-900/20 text-white'
              : 'bg-gradient-to-r from-blue-50/90 via-white to-slate-50 border-blue-200 shadow-blue-500/10 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center p-1 shrink-0 shadow-md ring-2 ring-blue-500/40">
              <img
                src="https://img.a.transfermarkt.technology/wappen/head/14105.png"
                alt="Persib 1933"
                className="w-7 h-7 object-contain drop-shadow"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs tracking-tight">Pasang Aplikasi di HP</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold uppercase bg-emerald-500 text-white">
                  Gratis
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                Akses instan di layar utama tanpa browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all ${
                isPro
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  : 'bg-blue-700 hover:bg-blue-800 text-white shadow-blue-700/25'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Step-by-Step Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 ${
              isPro ? 'bg-[#0E1118] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-950'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center p-1 shadow-md">
                  <img
                    src="https://img.a.transfermarkt.technology/wappen/head/14105.png"
                    alt="Persib"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-black text-sm">Pasang di iPhone / iPad</h3>
                  <p className="text-[10px] text-slate-400">Petunjuk Safari Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Ketuk tombol Bagikan <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Terletak di bilah navigasi bagian bawah layar browser Safari Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Pilih &apos;Tambah ke Layar Utama&apos; <PlusSquare className="w-3.5 h-3.5 text-blue-500 inline" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Scroll ke bawah pada menu opsi lalu ketuk <strong>Tambah ke Layar Utama</strong> (Add to Home Screen).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Aplikasi PERSIB TRACKER akan langsung muncul di beranda HP Anda sebagai aplikasi mandiri!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
}
