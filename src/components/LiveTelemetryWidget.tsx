'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { MatchFixture } from '@/types/club';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw, Trophy, ShieldCheck } from 'lucide-react';

interface LiveTelemetryWidgetProps {
  currentFixture: MatchFixture | null;
}

// REFACTOR: Helper nama klub ringkas & proporsional untuk layar smartphone mobile 360px-430px
function formatMobileClubName(rawName: string): string {
  if (!rawName) return '';
  const upper = rawName.toUpperCase();
  if (upper.includes('PERSIB')) return 'PERSIB';
  if (upper.includes('SHAN UNITED')) return 'Shan United';
  if (upper.includes('BALI UNITED')) return 'Bali United';
  if (upper.includes('JOHOR') || upper.includes('JDT')) return 'JDT';
  if (upper.includes('CONG AN') || upper.includes('CAHN')) return 'CAHN';
  if (upper.includes('MELBOURNE')) return 'Melbourne V.';
  if (upper.includes('PORT FC')) return 'Port FC';
  if (upper.includes('LION CITY')) return 'Lion City';
  if (upper.includes('SVAY')) return 'Svay Rieng';
  if (upper.includes('JAVA')) return 'Java United';
  if (upper.includes('PERSIJA')) return 'Persija';
  if (upper.includes('BORNEO')) return 'Borneo FC';
  if (upper.includes('PERSEBAYA')) return 'Persebaya';
  return rawName.replace(/\s*\([A-Z]+\)\s*/g, '').trim();
}

export function LiveTelemetryWidget({ currentFixture }: LiveTelemetryWidgetProps) {
  const {
    mode,
    activeTournament,
    lastSyncedAt,
    groqBulletin,
    triggerGroqDataSync,
    isGroqSyncing,
  } = useClubTracker();
  const isPro = mode === 'pro';

  const [isIntelExpanded, setIsIntelExpanded] = useState<boolean>(false);

  const tournLabel =
    activeTournament === 'liga1'
      ? 'Super League 2026/27'
      : activeTournament === 'acl2'
      ? 'ACL Two 2026/27'
      : 'Shopee Cup ASEAN';

  const isLive = currentFixture?.status === 'LIVE';
  const isFinished = currentFixture?.status === 'FINISHED';

  const homeName = currentFixture ? formatMobileClubName(currentFixture.homeTeam) : 'PERSIB';
  const awayName = currentFixture ? formatMobileClubName(currentFixture.awayTeam) : 'Lawan';

  return (
    <section
      aria-label="Pusat Telemetri & Intelijen Pertandingan"
      className="px-4 sm:px-5 pt-2 pb-1"
    >
      <div
        className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
          isPro
            ? 'bg-gradient-to-br from-[#121622] via-[#0E121A] to-[#0A0D14] border-slate-800 text-slate-200'
            : 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-blue-200/80 text-slate-800 shadow-sm'
        }`}
      >
        {/* =========================================================================
            BARIS 1: STATUS RADAR LAGA & SINKRONISASI REAL-TIME
            ========================================================================= */}
        <div className="p-3.5 sm:p-4 pb-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Indikator Turnamen & Status Laga Aktif */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLive ? 'animate-ping bg-red-500' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLive ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 truncate">
                {tournLabel}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  isLive
                    ? 'bg-red-600 text-white animate-pulse'
                    : isFinished
                    ? 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-600/15 text-blue-700 dark:text-cyan-300 border border-blue-500/30'
                }`}
              >
                {isLive ? 'LIVE' : isFinished ? 'FT (SELESAI)' : 'JADWAL'}
              </span>
            </div>

            {/* Jam Sinkronisasi Terverifikasi */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={triggerGroqDataSync}
                disabled={isGroqSyncing}
                title="Sinkronkan data live sekarang"
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold transition-all active:scale-95 ${
                  isPro
                    ? 'bg-blue-950/70 text-cyan-300 border border-blue-800/60 hover:bg-blue-900/60'
                    : 'bg-blue-100/70 text-blue-900 border border-blue-200 hover:bg-blue-200/60'
                }`}
              >
                <RefreshCw
                  className={`w-2.5 h-2.5 ${isGroqSyncing ? 'animate-spin text-cyan-400' : ''}`}
                />
                <span>{isGroqSyncing ? 'Syncing...' : lastSyncedAt}</span>
              </button>
            </div>
          </div>

          {/* Skor & Matchup Presisi (Teks Tidak Lagi Terpotong) */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-2xl border ${
              isPro
                ? 'bg-[#161B28]/80 border-slate-800/80'
                : 'bg-white/90 border-slate-200/90 shadow-2xs'
            }`}
          >
            {/* Tim Tuan Rumah */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {currentFixture?.homeLogo && (
                <img
                  src={currentFixture.homeLogo}
                  alt={homeName}
                  className="w-5 h-5 object-contain shrink-0 drop-shadow-xs"
                />
              )}
              <span className="font-extrabold text-xs truncate">{homeName}</span>
            </div>

            {/* Skor Tengah / Jam Laga */}
            <div className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-black text-xs text-center shrink-0 shadow-xs">
              {isFinished || isLive ? (
                <span>
                  {currentFixture?.homeScore ?? 0} : {currentFixture?.awayScore ?? 0}
                </span>
              ) : (
                <span className="text-[10px] tracking-tight">{currentFixture?.time || 'VS'}</span>
              )}
            </div>

            {/* Tim Tamu */}
            <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
              <span className="font-extrabold text-xs truncate">{awayName}</span>
              {currentFixture?.awayLogo && (
                <img
                  src={currentFixture.awayLogo}
                  alt={awayName}
                  className="w-5 h-5 object-contain shrink-0 drop-shadow-xs"
                />
              )}
            </div>
          </div>

          {/* Subtitle Lokasi & Putaran */}
          {currentFixture && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 px-0.5 truncate flex items-center justify-between">
              <span>{currentFixture.roundOrWeek}</span>
              <span className="opacity-75">{currentFixture.venue.replace('Stadion ', '')}</span>
            </p>
          )}
        </div>

        {/* =========================================================================
            BARIS 2: MODUL INTELIJEN AI GROQ (EXPANDABLE & BEBAS TRUNCATE)
            ========================================================================= */}
        {groqBulletin && (
          <div
            className={`border-t px-3.5 sm:px-4 py-2 transition-colors ${
              isPro
                ? 'bg-blue-950/30 border-slate-800/80'
                : 'bg-blue-50/50 border-blue-100'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wider shrink-0 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>LIVE INTEL</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-cyan-300">
                  Analisis Otonom AI
                </span>
              </div>

              {/* Tombol Buka/Tutup Teks Lengkap */}
              <button
                type="button"
                onClick={() => setIsIntelExpanded((prev) => !prev)}
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all active:scale-95 ${
                  isPro
                    ? 'text-cyan-400 hover:bg-slate-800/60'
                    : 'text-blue-700 hover:bg-blue-100/60'
                }`}
                aria-expanded={isIntelExpanded}
              >
                <span>{isIntelExpanded ? 'Ringkas' : 'Baca Penuh'}</span>
                {isIntelExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Isi Teks Intelijen: Expandable tanpa pemotongan kata acak */}
            <div className="mt-1.5">
              <p
                className={`text-[11px] leading-relaxed transition-all duration-300 ${
                  isIntelExpanded
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'line-clamp-2 text-slate-600 dark:text-slate-300'
                }`}
              >
                {groqBulletin}
              </p>

              {/* Tag Ringkasan Cepat saat Di-expand */}
              {isIntelExpanded && (
                <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>Shopee Cup: #1 (6 Pts, SG +8)</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>Super League: #6 (16 Pts)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
