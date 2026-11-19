'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  Download,
  X,
  Share2,
  PlusSquare,
  CheckCircle2,
  Smartphone,
  Apple,
  Monitor,
  Sparkles,
} from 'lucide-react';

export function PwaInstallModal() {
  const { isPwaInstallModalOpen, setIsPwaInstallModalOpen, triggerPwaInstall, mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'desktop'>('android');

  if (!isPwaInstallModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-[100000] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={() => setIsPwaInstallModalOpen(false)}
    >
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 animate-in slide-in-from-bottom-4 sm:zoom-in-95 ${
          isPro
            ? 'bg-[#0E1424] border-slate-700/80 text-white shadow-blue-950/50'
            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isPro ? 'border-slate-800 bg-blue-950/40' : 'border-slate-100 bg-blue-50/60'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-700 flex items-center justify-center p-1.5 shadow-md ring-2 ring-blue-500/40 shrink-0">
              <img
                src="https://img.a.transfermarkt.technology/wappen/head/14105.png"
                alt="Persib Crest"
                className="w-8 h-8 object-contain drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 id="pwa-install-title" className="font-black text-sm sm:text-base tracking-tight">
                  Pasang Aplikasi di HP
                </h2>
                <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-mono font-bold uppercase bg-emerald-500 text-white shadow-xs">
                  PWA Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Buka instan dari layar utama tanpa membuka browser
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPwaInstallModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-200/20 active:scale-95 transition-all text-slate-400 hover:text-white"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Tap Direct Install Action (If Native Prompt Available) */}
        <div className="p-4 sm:p-5 border-b border-slate-800/40">
          <button
            type="button"
            onClick={async () => {
              await triggerPwaInstall();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Pasang Otomatis (1-Ketuk)</span>
            <Sparkles className="w-4 h-4 text-cyan-200 ml-1" />
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            Jika pop-up sistem tidak muncul otomatis, ikuti petunjuk manual di bawah:
          </p>
        </div>

        {/* OS Platform Switcher Tabs */}
        <div className="px-4 pt-3 flex items-center gap-1.5 border-b border-slate-800/40">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'android'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ios'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'desktop'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC / Laptop</span>
          </button>
        </div>

        {/* Tab Content: Android Instructions */}
        {activeTab === 'android' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold">Buka Google Chrome di HP Anda</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ketuk ikon <strong>Menu Titik Tiga (⋮)</strong> di pojok kanan atas layar Chrome.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1">
                  Pilih <span className="text-cyan-400 underline decoration-cyan-400 font-extrabold">&ldquo;Pasang Aplikasi&rdquo;</span> atau <span className="text-cyan-400 underline decoration-cyan-400 font-extrabold">&ldquo;Tambahkan ke Layar Utama&rdquo;</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Menu ini berada di daftar opsi menu Chrome.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-emerald-400">Ketuk &ldquo;Install / Pasang&rdquo;</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ikon PERSIB TRACKER otomatis muncul di beranda HP Anda layaknya aplikasi Play Store.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: iOS Instructions */}
        {activeTab === 'ios' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1.5">
                  Ketuk Tombol Bagikan <Share2 className="w-3.5 h-3.5 text-blue-400 inline" />
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Buka web ini di <strong>Safari</strong>, lalu ketuk tombol Share di bilah navigasi bawah.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1.5">
                  Pilih &ldquo;Tambah ke Layar Utama&rdquo; <PlusSquare className="w-3.5 h-3.5 text-blue-400 inline" />
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Gulir ke bawah pada menu opsi lalu ketuk <em>Add to Home Screen</em>.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-emerald-400">Ketuk &ldquo;Tambah&rdquo; di Kanan Atas</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aplikasi mandiri PERSIB TRACKER siap dibuka tanpa bilah navigasi browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Desktop Instructions */}
        {activeTab === 'desktop' && (
          <div className="p-4 sm:p-5 space-y-3">
            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold flex items-center gap-1.5">
                  Bilah Alamat Browser (Omnibox)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik ikon komputer kecil atau simbol panah unduh di sebelah kanan kolom URL browser Chrome / Edge.
                </p>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border flex items-start gap-3 ${
              isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-emerald-400">Klik &ldquo;Pasang / Install&rdquo;</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Aplikasi akan terbuka di jendela khusus tanpa gangguan tab browser.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className={`p-4 border-t flex items-center justify-between text-[11px] ${
          isPro ? 'border-slate-800/80 bg-slate-950/60 text-slate-400' : 'border-slate-100 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Penyimpanan ringan (&lt; 2 MB) • Bebas kuota unduh</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPwaInstallModalOpen(false)}
            className="px-3 py-1.5 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition-all text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
