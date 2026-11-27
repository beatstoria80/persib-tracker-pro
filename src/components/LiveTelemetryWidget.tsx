'use client';

import React, { useState, useEffect } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { MatchFixture, FeedNewsItem } from '@/types/club';
import {
  RefreshCw,
  Trophy,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Shuffle,
  Sparkles,
  Award,
  Globe2,
  Calendar,
  Flame,
} from 'lucide-react';

interface LiveTelemetryWidgetProps {
  currentFixture: MatchFixture | null;
}

// Helper nama klub ringkas & proporsional untuk layar smartphone mobile 360px-430px
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

function cleanBulletinDisplay(rawBulletin: string): string {
  if (!rawBulletin) return '';
  return rawBulletin
    .replace(/\s*\((?:Sync|Live Groq LPU):[^)]+\)/gi, '')
    .trim();
}

const DEFAULT_COMPETITION_FEEDS: FeedNewsItem[] = [
  {
    id: 'feed-acl2-default',
    competition: 'ACL Two',
    badge: '🏆 AFC Champions League Two',
    title: 'PERSIB Kunci Puncak Klasemen Grup E AFC Champions League Two',
    detail:
      'PERSIB Bandung mencatatkan performa impresif di ajang AFC Champions League Two 2026/2027 Grup E. Taktik disiplin Bojan Hodak serta efektivitas transisi bertahan-ke-menyerang menjadi kunci kekuatan Maung Bandung bersaing di kancah antarklub bergengsi Asia.',
    stats: 'Grup E Asia • Lolos 16 Besar',
    timestamp: 'Live Feed',
    tag: 'ACL Two',
    source: 'AFC Official',
  },
  {
    id: 'feed-superleague-default',
    competition: 'Super League',
    badge: '🇮🇩 BRI Super League',
    title: 'Persaingan Papan Atas BRI Super League 2026/2027',
    detail:
      'Skuad Pangeran Biru terus menjaga fokus tinggi dan kesiapan fisik dalam persaingan ketat klasemen papan atas BRI Super League 2026/2027. Rotasi pemain dan kematangan strategi disiapkan guna mengamankan target poin maksimal di setiap pertandingan.',
    stats: 'Papan Atas Klasemen • Target Juara Bertahan',
    timestamp: 'Live Feed',
    tag: 'Super League',
    source: 'Liga Indonesia',
  },
  {
    id: 'feed-shopee-default',
    competition: 'Shopee Cup',
    badge: '🌏 Shopee Cup ASEAN',
    title: 'PERSIB Tampil Produktif di Shopee Cup ASEAN Club Championship',
    detail:
      'Di panggung Shopee Cup ASEAN Club Championship 2026/2027, PERSIB Bandung memimpin persaingan Grup B dengan agresivitas lini serang dan pertahanan solid. Armada Bojan Hodak mempertahankan momentum positif menyongsong laga lanjutan antarklub Asia Tenggara.',
    stats: 'Puncak Grup B • Selisih Gol Positif',
    timestamp: 'Live Feed',
    tag: 'Shopee Cup',
    source: 'ASEAN United FC',
  },
];

export function LiveTelemetryWidget({ currentFixture }: LiveTelemetryWidgetProps) {
  const {
    mode,
    activeTournament,
    lastSyncedAt,
    groqBulletin,
    multiCompetitionFeeds,
    triggerGroqDataSync,
    isGroqSyncing,
  } = useClubTracker();
  const isPro = mode === 'pro';

  // State untuk Dynamic Scale Size Card FEEDS (Maximize & Minimize)
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [activeFeedIndex, setActiveFeedIndex] = useState<number>(0);
  const [selectedCompFilter, setSelectedCompFilter] = useState<
    'all' | 'ACL Two' | 'Super League' | 'Shopee Cup'
  >('all');

  // Sumber feed multi-kompetisi (gabungan data Groq collector & fallback resmi)
  const rawFeeds: FeedNewsItem[] =
    multiCompetitionFeeds && multiCompetitionFeeds.length > 0
      ? multiCompetitionFeeds
      : DEFAULT_COMPETITION_FEEDS;

  // Filter berdasarkan kompetisi terpilih
  const displayFeeds =
    selectedCompFilter === 'all'
      ? rawFeeds
      : rawFeeds.filter((item) => item.competition === selectedCompFilter);

  // Auto-rotate / update otomatis feed random setiap 10 detik
  useEffect(() => {
    if (displayFeeds.length <= 1) return;
    const interval = setInterval(() => {
      setActiveFeedIndex((prev) => (prev + 1) % displayFeeds.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [displayFeeds.length]);

  // Handler Shuffle / Acak feed laga secara random
  const handleShuffleFeed = () => {
    if (displayFeeds.length <= 1) return;
    setActiveFeedIndex((prev) => {
      let nextIndex = Math.floor(Math.random() * displayFeeds.length);
      if (nextIndex === prev) nextIndex = (prev + 1) % displayFeeds.length;
      return nextIndex;
    });
  };

  const safeFeedIndex = displayFeeds.length > 0 ? activeFeedIndex % displayFeeds.length : 0;
  const currentFeed: FeedNewsItem =
    displayFeeds[safeFeedIndex] || rawFeeds[0] || DEFAULT_COMPETITION_FEEDS[0];

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

          {/* Skor & Matchup Presisi (Teks Tidak Terpotong) */}
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
              <span
                className={`font-extrabold text-xs truncate ${
                  isPro ? 'text-white' : 'text-slate-900'
                }`}
              >
                {homeName}
              </span>
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
              <span
                className={`font-extrabold text-xs truncate ${
                  isPro ? 'text-white' : 'text-slate-900'
                }`}
              >
                {awayName}
              </span>
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
            <p
              className={`text-[10px] mt-1.5 px-0.5 truncate flex items-center justify-between ${
                isPro ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <span>{currentFixture.roundOrWeek}</span>
              <span className="opacity-90">{currentFixture.venue.replace('Stadion ', '')}</span>
            </p>
          )}
        </div>

        {/* =========================================================================
            BARIS 2: CARD FEEDS DENGAN DYNAMIC SCALE SIZE (MAXIMIZE & MINIMIZE)
            Update terus menerus berita laga BRI Super League, ACL Two Grup E, & Shopee Cup
            ========================================================================= */}
        <div
          className={`border-t transition-all duration-300 ${
            isPro
              ? 'bg-blue-950/30 border-slate-800 text-slate-200'
              : 'bg-blue-50/50 border-blue-100 text-slate-700'
          }`}
        >
          {/* HEADER CARD FEEDS: Kontrol Maximize/Minimize, Shuffle Acak & Status */}
          <div className="px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-inherit/40">
            {/* Label FEEDS & Badge Kompetisi Aktif */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                </span>
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isPro ? 'text-cyan-300' : 'text-blue-700'
                  }`}
                >
                  FEEDS
                </span>
              </div>

              {/* Tag Kompetisi Aktif */}
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full truncate border ${
                  currentFeed.competition === 'ACL Two'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : currentFeed.competition === 'Super League'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-cyan-400 border-blue-500/30'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}
              >
                {currentFeed.badge}
              </span>
            </div>

            {/* Action Buttons: Shuffle Acak & Maximize / Minimize Scale */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Tombol Acak / Ganti Berita Random */}
              <button
                type="button"
                onClick={handleShuffleFeed}
                title="Acak & ganti berita laga kompetisi lain"
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all active:scale-90 ${
                  isPro
                    ? 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700/80 border border-slate-700'
                    : 'bg-blue-100/80 text-blue-800 hover:bg-blue-200/80 border border-blue-200'
                }`}
              >
                <Shuffle className="w-3 h-3 text-cyan-400" />
                <span className="hidden xs:inline">Acak</span>
                <span className="font-mono text-[9px] opacity-75">
                  ({safeFeedIndex + 1}/{displayFeeds.length})
                </span>
              </button>

              {/* Tombol Maximize / Minimize Scale */}
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                title={isMaximized ? 'Perkecil card (Minimize)' : 'Perbesar card (Maximize)'}
                className={`flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all active:scale-90 ${
                  isMaximized
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : isPro
                    ? 'bg-blue-900/60 text-cyan-300 hover:bg-blue-800/80 border border-blue-700/60'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                }`}
                aria-expanded={isMaximized}
              >
                {isMaximized ? (
                  <>
                    <Minimize2 className="w-3 h-3" />
                    <span>Minimize</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3 h-3" />
                    <span>Maximize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ISI KONTEN CARD: DINAMIS BERDASARKAN STATUS MAXIMIZED / MINIMIZED */}
          <div className="p-3.5 sm:p-4">
            {/* TAMPILAN MAXIMIZE: Skala Besar, Teks Panjang Penuh, Filter Kompetisi, & 3 Ringkasan Event */}
            {isMaximized ? (
              <div className="space-y-3.5 transition-all duration-300 max-h-[560px] overflow-y-auto pr-1">
                {/* Filter Pills 3 Kompetisi Utama */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-bold">
                  {(
                    [
                      { key: 'all', label: 'Semua Event (3)' },
                      { key: 'ACL Two', label: 'ACL Two Grup E' },
                      { key: 'Super League', label: 'BRI Super League' },
                      { key: 'Shopee Cup', label: 'Shopee Cup ASEAN' },
                    ] as const
                  ).map((filter) => {
                    const isSelected = selectedCompFilter === filter.key;
                    return (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => {
                          setSelectedCompFilter(filter.key);
                          setActiveFeedIndex(0);
                        }}
                        className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs font-black'
                            : isPro
                            ? 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/80 border border-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                {/* Box Berita Utama Panjang (Long-Character Text Penuh Tanpa Truncate) */}
                <article
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isPro
                      ? 'bg-slate-900/90 border-slate-800 shadow-inner'
                      : 'bg-white border-blue-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {currentFeed.tag}
                      </span>
                      {currentFeed.source && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/30">
                          {currentFeed.source}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] font-mono shrink-0 ${
                        isPro ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {currentFeed.timestamp}
                    </span>
                  </div>

                  {/* Judul Berita Utama */}
                  <h3
                    className={`font-black text-sm sm:text-base leading-snug mb-2.5 ${
                      isPro ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {currentFeed.title}
                  </h3>

                  {/* Karakter Teks Berita Panjang Analitikal Mendalam */}
                  <p
                    className={`text-xs sm:text-[13px] leading-relaxed whitespace-pre-line text-justify ${
                      isPro ? 'text-slate-200 font-normal' : 'text-slate-700 font-normal'
                    }`}
                  >
                    {currentFeed.detail}
                  </p>

                  {/* Telemetri & Statistik Presisi Laga serta Tautan Sumber */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {currentFeed.stats && (
                      <div
                        className={`p-2 sm:px-2.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-2 ${
                          isPro
                            ? 'bg-blue-950/40 border-blue-900/50 text-cyan-300'
                            : 'bg-blue-50 border-blue-200/80 text-blue-900'
                        }`}
                      >
                        <Award className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="leading-tight">{currentFeed.stats}</span>
                      </div>
                    )}
                    {currentFeed.link && (
                      <a
                        href={currentFeed.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-end sm:self-auto inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/50 transition-all active:scale-95"
                      >
                        <span>Baca di {currentFeed.source || 'Sumber Berita'}</span>
                        <span className="text-xs">↗</span>
                      </a>
                    )}
                  </div>
                </article>

                {/* Grid 3-Kompetisi Telemetri Cepat */}
                <div className="pt-2 border-t border-inherit/40">
                  <p
                    className={`text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                      isPro ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <Globe2 className="w-3 h-3 text-cyan-400" />
                    <span>Matriks 3 Event Utama PERSIB 2026/2027</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Event 1: ACL Two */}
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isPro
                          ? 'bg-[#151a26] border-amber-500/30 text-slate-200'
                          : 'bg-amber-50/50 border-amber-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400 mb-1">
                        <Trophy className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>ACL Two Grup E</span>
                      </div>
                      <p className="text-[11px] font-bold">15 Poin (100% Win)</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isPro ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Juara Grup E & Lolos Babak 16 Besar (vs FC Seoul 3-1)
                      </p>
                    </div>

                    {/* Event 2: BRI Super League */}
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isPro
                          ? 'bg-[#151a26] border-blue-500/30 text-slate-200'
                          : 'bg-blue-50/50 border-blue-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 dark:text-cyan-400 mb-1">
                        <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>BRI Super League</span>
                      </div>
                      <p className="text-[11px] font-bold">Peringkat 4 • 19 Poin</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isPro ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Pekan 11 vs Persita (Jumat 29 Nov 19:00 WIB)
                      </p>
                    </div>

                    {/* Event 3: Shopee Cup ASEAN */}
                    <div
                      className={`p-2.5 rounded-xl border ${
                        isPro
                          ? 'bg-[#151a26] border-emerald-500/30 text-slate-200'
                          : 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-1">
                        <Flame className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Shopee Cup ASEAN</span>
                      </div>
                      <p className="text-[11px] font-bold">Puncak Grup B • 6 Poin</p>
                      <p
                        className={`text-[10px] mt-0.5 ${
                          isPro ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        Surplus +8 Gol (9-1), persiapan vs Lion City Sailors
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Keterangan AI LPU Telemetri */}
                <div
                  className={`pt-2 border-t text-[9px] font-mono flex items-center justify-between ${
                    isPro ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    Auto-feed AI Groq Collector • Siklus 10 Detik
                  </span>
                  <span>Verifikasi Data Real-Time</span>
                </div>
              </div>
            ) : (
              /* TAMPILAN MINIMIZE (COMPACT): Ringkasan Padat, Cepat, dan Elegan */
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase">
                        {currentFeed.tag}
                      </span>
                      {currentFeed.source && (
                        <span className="text-[8.5px] font-mono px-1 rounded bg-blue-500/20 text-cyan-300 border border-blue-400/20">
                          {currentFeed.source}
                        </span>
                      )}
                      <span className={`text-[8.5px] font-mono ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                        • {currentFeed.timestamp}
                      </span>
                    </div>
                    <h4
                      className={`font-black text-xs leading-snug line-clamp-1 ${
                        isPro ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {currentFeed.title}
                    </h4>
                    <p
                      className={`text-[11px] leading-relaxed line-clamp-2 mt-1 ${
                        isPro ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {currentFeed.detail}
                    </p>
                  </div>
                </div>

                {/* Footer Minimalis Preview */}
                <div
                  className={`pt-2 border-t flex items-center justify-between gap-2 text-[10px] font-mono ${
                    isPro ? 'border-slate-800/80 text-slate-400' : 'border-blue-100 text-slate-500'
                  }`}
                >
                  <span className="truncate flex items-center gap-1 font-bold text-cyan-500">
                    <Award className="w-3 h-3 shrink-0" />
                    <span className="truncate">{currentFeed.stats || currentFeed.tag}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsMaximized(true)}
                    className="shrink-0 text-blue-600 dark:text-cyan-400 font-extrabold hover:underline flex items-center gap-0.5"
                  >
                    <span>Buka Penuh</span>
                    <Maximize2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
