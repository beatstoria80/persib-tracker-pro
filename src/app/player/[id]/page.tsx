'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { OFFICIAL_SQUAD_2026_2027, getPlayerAvatar } from '@/data/persib-data';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
} from 'lucide-react';

export default function PlayerVideoProfilePage() {
  const params = useParams();
  const router = useRouter();
  const routeId = (params?.id as string) || 'peralta-10';

  // // REFACTOR: Derive active player directly from routeId without setState-in-effect
  const activePlayer =
    OFFICIAL_SQUAD_2026_2027.find(
      (p) => p.id.toLowerCase() === routeId.toLowerCase() || p.id.includes(routeId)
    ) ||
    OFFICIAL_SQUAD_2026_2027.find((p) => p.id === 'peralta-10') ||
    OFFICIAL_SQUAD_2026_2027[0];

  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activePlayer.name} #${activePlayer.number} - PERSIB Bandung 2026/2027`,
          text: `Profil resmi ${activePlayer.name} (${activePlayer.position}) skuad PERSIB Bandung musim 2026/2027.`,
          url,
        });
      } catch {
        // Fallback to clipboard
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedToast('Link profil berhasil disalin!');
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  // REFACTOR: Authentic player video resolution (Thom Haye, Ragnar Oratmangoen, Sandy Walsh, Mariano Peralta, or default)
  const videoSource =
    activePlayer.videoUrl ||
    (activePlayer.id.includes('haye')
      ? '/haye.mp4'
      : activePlayer.id.includes('ragnar')
      ? '/Ragnar.mp4'
      : activePlayer.id.includes('walsh')
      ? '/Sandy_Walsh.mp4'
      : activePlayer.id.includes('peralta')
      ? '/peralta.mp4'
      : '/peralta.mp4');

  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex justify-center items-start overflow-hidden">
      {/* 430px Mobile-First App Canvas */}
      <div className="w-full max-w-[430px] h-screen max-h-screen relative flex flex-col justify-between overflow-hidden shadow-2xl bg-black">
        {/* Background Looping Stream */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          <video
            ref={videoRef}
            src={videoSource}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
          />
          {/* Top Cinematic Gradient Overlay */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
          {/* Bottom Cinematic Gradient Overlay for Content Legibility */}
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
        </div>

        {/* Floating Notification Toast */}
        {copiedToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xl border border-blue-400/40 backdrop-blur-md animate-fade-in">
            {copiedToast}
          </div>
        )}

        {/* // REFACTOR: Ultra-minimalist top navigation header (purged blue guide badge & player control toggles) */}
        <header className="relative z-20 px-4 pt-5 pb-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
            aria-label="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all active:scale-95"
            aria-label="Bagikan Profil"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </header>

        {/* Bottom Interactive Player Profile Sheet */}
        <div className="relative z-20 px-4 pb-6 pt-2 flex flex-col gap-3">
          {/* Main Player Identification Card */}
          <div className="p-4 rounded-3xl bg-slate-950/75 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-2xl text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                    #{activePlayer.number}
                  </span>
                  <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    {activePlayer.name}
                    {activePlayer.verifiedData && (
                      <ShieldCheck className="w-4 h-4 text-cyan-400 inline shrink-0" />
                    )}
                  </h1>
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {activePlayer.fullName} • <span className="font-bold text-blue-400">{activePlayer.position}</span> ({activePlayer.age} thn)
                </div>
                <div className="text-[11px] text-slate-400">
                  {activePlayer.nationality} • Nilai Pasar: <strong className="text-emerald-400 font-semibold">{activePlayer.marketValue}</strong>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600/80 text-white border border-blue-400/40">
                  {activePlayer.squadRole === 'starting' ? 'Starter Utama' : 'Pemain Cadangan'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  s.d. {activePlayer.contractUntil}
                </span>
              </div>
            </div>

            {/* Quick Performance Indicators Grid */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center font-mono">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Gol</span>
                <span className="text-base font-black text-cyan-400">{activePlayer.stats.goals}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Assist</span>
                <span className="text-base font-black text-blue-400">{activePlayer.stats.assists}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Main</span>
                <span className="text-base font-black text-white">{activePlayer.stats.appearances}</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[9px] text-slate-400 block font-sans uppercase">Rating</span>
                <span className="text-base font-black text-amber-400">{activePlayer.stats.rating}</span>
              </div>
            </div>

            {/* Tactical Brief */}
            <div className="text-[11px] text-slate-300 leading-relaxed bg-blue-950/30 p-2.5 rounded-xl border border-blue-500/20">
              <span className="text-blue-400 font-bold block text-[10px] uppercase font-mono mb-0.5">
                Peran Taktikal Bojan Hodak:
              </span>
              {activePlayer.fitness.notes || 'Pemain kunci dalam skema multi-kompetisi PERSIB Bandung 2026/2027.'}
            </div>
          </div>

          {/* Horizontal Roster Carousel Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Pilih Pemain Skuad Lainnya
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {OFFICIAL_SQUAD_2026_2027.length} Pemain
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {OFFICIAL_SQUAD_2026_2027.map((player) => {
                const isSelected = player.id === activePlayer.id;
                const avatar = getPlayerAvatar(player.name);
                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      router.replace(`/player/${player.id}`);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border transition-all shrink-0 active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600 border-cyan-400 text-white shadow-lg shadow-blue-600/40 ring-2 ring-cyan-400/50'
                        : 'bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/30 shrink-0">
                      <Image
                        src={avatar}
                        alt={player.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-[11px] font-black leading-none">
                        #{player.number} {player.name}
                      </div>
                      <div className="text-[9px] text-slate-300 mt-0.5 font-sans font-medium">
                        {player.position}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
