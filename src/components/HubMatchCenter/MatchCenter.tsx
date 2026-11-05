'use client';

import React, { useState, useEffect } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  MapPin,
  ChevronRight,
  Trophy,
  Calendar,
  BarChart2,
  Users,
  Play,
  Pause,
  Activity,
  Radio,
} from 'lucide-react';
import { MatchFixture, Player, LeagueStandingRow, GroupTeam } from '@/types/club';
import { getClubLogo, getPlayerAvatar } from '@/data/persib-data';
import { PlayerAvatar } from '@/components/PlayerAvatar';

// Helper component for Match Hero Card Official Emblem
function ClubBadge({
  name,
  logoUrl,
  isPersib,
  isPro,
}: {
  name: string;
  logoUrl?: string;
  isPersib?: boolean;
  isPro?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const src = logoUrl || getClubLogo(name);

  return (
    <div
      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider shadow-md transition-transform hover:scale-105 p-2 shrink-0 ${
        isPersib
          ? 'bg-gradient-to-b from-blue-700 to-blue-900 text-white ring-2 ring-blue-500/40 shadow-blue-700/30'
          : isPro
          ? 'bg-slate-800 text-cyan-300 border border-slate-700'
          : 'bg-white text-slate-800 border border-slate-200'
      }`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={name}
          className="w-10 h-10 object-contain drop-shadow select-none"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span>{name.substring(0, 3).toUpperCase()}</span>
      )}
    </div>
  );
}

// Helper thumbnail for tables, pills, and schedule lists
function ClubThumb({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);
  const src = logoUrl || getClubLogo(name);

  if (imgError || !src) {
    return (
      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
        {name.substring(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-5 h-5 object-contain inline-block shrink-0 select-none"
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

export function MatchCenter() {
  const {
    mode,
    activeTournament,
    setActiveTournament,
    fixtures,
    liga1Standings,
    aclStandings,
    shopeeCupStandings,
    players,
    setSelectedPlayer,
    tacticalPlaybook,
    activeTacticalStep,
    setActiveTacticalStep,
    isTacticsPlaying,
    setIsTacticsPlaying,
  } = useClubTracker();
  const isPro = mode === 'pro';

  // Sub-Page Navigation Tabs: Laga (featured), Jadwal (schedule), Klasemen (standings), Taktik (lineup)
  const [matchViewTab, setMatchViewTab] = useState<'featured' | 'schedule' | 'standings' | 'lineup'>('featured');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('acl2-26-md4-live');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [heroDetailTab, setHeroDetailTab] = useState<'events' | 'stats' | 'highlights'>('events');

  // Real-time seconds ticking (00:01 interval clock ticker for live simulation)
  const [liveSeconds, setLiveSeconds] = useState(42);
  const [liveMinute, setLiveMinute] = useState(88);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => {
        if (prev >= 59) {
          setLiveMinute((m) => (m >= 95 ? 88 : m + 1));
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play tactical transition loop
  useEffect(() => {
    if (!isTacticsPlaying) return;
    const interval = setInterval(() => {
      setActiveTacticalStep(activeTacticalStep >= 3 ? 1 : activeTacticalStep + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, [isTacticsPlaying, activeTacticalStep, setActiveTacticalStep]);

  const currentTacticalPhase =
    (tacticalPlaybook && tacticalPlaybook.find((s) => s.step === activeTacticalStep)) ||
    (tacticalPlaybook && tacticalPlaybook[0]) || {
      step: 1,
      label: 'Fase 1: Double Pivot Build-up (Haye & Klok Maestro)',
      description: 'Thom Haye turun menjemput bola di antara bek tengah Barba & Matricardi.',
      ballPos: { x: 34, y: 50 },
      playerPositions: [],
    };

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  const currentFixture: MatchFixture =
    tournamentFixtures.find((f: MatchFixture) => f.id === selectedFixtureId) || tournamentFixtures[0] || fixtures[0];

  const filteredSchedule = tournamentFixtures.filter((fix) => {
    if (scheduleFilter === 'upcoming') return fix.status === 'SCHEDULED' || fix.status === 'LIVE';
    if (scheduleFilter === 'finished') return fix.status === 'FINISHED';
    return true;
  });

  const startingXI: Player[] = players.filter((p: Player) => p.squadRole === 'starting');
  const substitutes: Player[] = players.filter((p: Player) => p.squadRole === 'substitute');

  return (
    <div className="space-y-4">
      {/* 1. Header Info & Competition Pill Switcher */}
      <div className="pt-0.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase">
              {activeTournament === 'shopee_cup'
                ? 'Shopee Cup'
                : activeTournament === 'acl2'
                ? 'ACL Two'
                : 'BRI Liga 1'}
            </h2>
            <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-cyan-300">
              2026/27
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {activeTournament === 'shopee_cup'
              ? 'Puncak Grup B'
              : activeTournament === 'acl2'
              ? 'Juara Grup E'
              : 'Peringkat #4'}
          </span>
        </div>

        {/* Competition Selector (Responsive 3-Column Grid - Zero Text Clipping) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTournament('liga1');
              setSelectedFixtureId('l1-p8');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black tracking-tight transition-all text-center ${
              activeTournament === 'liga1'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Liga 1
          </button>

          <button
            onClick={() => {
              setActiveTournament('acl2');
              setSelectedFixtureId('acl2-26-md4-live');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black tracking-tight transition-all text-center flex items-center justify-center gap-1 ${
              activeTournament === 'acl2'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-700 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ACL Two</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          </button>

          <button
            onClick={() => {
              setActiveTournament('shopee_cup');
              setSelectedFixtureId('shopee-26-md1-ft');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-black tracking-tight transition-all text-center flex items-center justify-center gap-1 ${
              activeTournament === 'shopee_cup'
                ? isPro
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Shopee Cup</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. Structured Sub-Page Navigation Tabs (4-Column Balanced Grid) */}
      <div
        className={`p-1 rounded-2xl border grid grid-cols-4 gap-1 text-xs font-bold ${
          isPro
            ? 'bg-[#121620] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600 shadow-xs'
        }`}
      >
        <button
          onClick={() => setMatchViewTab('featured')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all text-center flex items-center justify-center gap-1 ${
            matchViewTab === 'featured'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Laga</span>
        </button>

        <button
          onClick={() => setMatchViewTab('schedule')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all text-center flex items-center justify-center gap-1 ${
            matchViewTab === 'schedule'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal</span>
        </button>

        <button
          onClick={() => setMatchViewTab('standings')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all text-center flex items-center justify-center gap-1 ${
            matchViewTab === 'standings'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Klasemen</span>
        </button>

        <button
          onClick={() => setMatchViewTab('lineup')}
          className={`py-2 rounded-xl text-[11px] font-extrabold transition-all text-center flex items-center justify-center gap-1 ${
            matchViewTab === 'lineup'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Taktik</span>
        </button>
      </div>

      {/* 3. Sub-Page Tab 1: Featured Match Detail (Bi-Tone Hero Card) */}
      {matchViewTab === 'featured' && (
        <div className="space-y-4">
          {/* Multi-match selector pills if tournament has multiple matches */}
          {tournamentFixtures.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {tournamentFixtures.map((fix: MatchFixture) => (
                <button
                  key={fix.id}
                  onClick={() => setSelectedFixtureId(fix.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0 border flex items-center gap-1.5 ${
                    selectedFixtureId === fix.id
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-xs'
                      : isPro
                      ? 'bg-[#121620] border-slate-800 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <ClubThumb name={fix.homeTeam} logoUrl={fix.homeLogo} />
                  <span className="text-[9px] opacity-60">vs</span>
                  <ClubThumb name={fix.awayTeam} logoUrl={fix.awayLogo} />
                  <span>{fix.roundOrWeek.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          )}

          {/* Bi-Tone Match Hero Card */}
          <div
            className={`rounded-[32px] overflow-hidden border shadow-xl transition-all ${
              isPro
                ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Top Half: Teams & Circular VS Badge */}
            <div
              className={`p-6 pb-5 transition-colors ${
                isPro
                  ? 'bg-gradient-to-b from-[#181D2A] to-[#121620]'
                  : 'bg-gradient-to-b from-slate-50 to-white'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-5">
                <span className="text-slate-400 font-mono">{currentFixture.tournament}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-cyan-300 font-extrabold">
                  {currentFixture.roundOrWeek}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1 text-center min-w-0 px-1">
                  <ClubBadge
                    name={currentFixture.homeTeam}
                    logoUrl={currentFixture.homeLogo}
                    isPersib={currentFixture.homeTeam.includes('PERSIB')}
                    isPro={isPro}
                  />
                  <h4 className="font-black text-xs sm:text-sm mt-2.5 leading-snug break-words">
                    {currentFixture.homeTeam}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Tuan Rumah</span>
                </div>

                {/* Center: Circular VS Pill */}
                <div className="flex flex-col items-center px-2 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-md border ${
                      isPro
                        ? 'bg-[#0E1118] border-slate-700 text-cyan-300'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    VS
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase">
                    {currentFixture.status === 'FINISHED' ? 'Full Time' : currentFixture.time}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1 text-center min-w-0 px-1">
                  <ClubBadge
                    name={currentFixture.awayTeam}
                    logoUrl={currentFixture.awayLogo}
                    isPersib={currentFixture.awayTeam.includes('PERSIB')}
                    isPro={isPro}
                  />
                  <h4 className="font-black text-xs sm:text-sm mt-2.5 leading-snug break-words">
                    {currentFixture.awayTeam}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Tim Tamu</span>
                </div>
              </div>
            </div>

            {/* Bottom Half: Score / Time Display Dual-Tone Canvas */}
            <div
              className={`p-5 pt-4 border-t ${
                isPro
                  ? 'bg-[#0E1118] border-slate-800/80 text-white'
                  : 'bg-slate-50/80 border-slate-200 text-slate-950'
              }`}
            >
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {currentFixture.status === 'FINISHED' ? 'Skor Akhir' : 'Jadwal Kick-off'}
                  </span>
                  <div className="text-2xl font-black font-mono tracking-tight mt-0.5">
                    {currentFixture.status === 'FINISHED' ? (
                      <span className="text-blue-600 dark:text-cyan-400">
                        {currentFixture.homeScore} : {currentFixture.awayScore}
                      </span>
                    ) : (
                      <span>{currentFixture.time}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {currentFixture.status === 'FINISHED' ? 'Status Laga' : 'Tanggal Pertandingan'}
                  </span>
                  <div className="text-xs font-bold mt-1">
                    {currentFixture.status === 'FINISHED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                        FT (Selesai)
                      </span>
                    ) : (
                      <span className="font-mono text-slate-700 dark:text-slate-200">
                        {currentFixture.date}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Venue Row */}
              <div className="flex items-center gap-2 pt-3 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate">{currentFixture.venue}</span>
              </div>

              {/* Aggregate Score Pill if exists */}
              {currentFixture.aggregateScore && (
                <div
                  className={`mt-3 p-2.5 rounded-2xl text-[11px] font-bold text-center border ${
                    isPro
                      ? 'bg-blue-950/40 border-blue-900/50 text-cyan-300'
                      : 'bg-blue-50 border-blue-200 text-blue-950'
                  }`}
                >
                  🏆 {currentFixture.aggregateScore}
                </div>
              )}

              {/* Match Intelligence Navigation Switcher (Events vs Stats vs Highlights) */}
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center mb-3">
                  <button
                    onClick={() => setHeroDetailTab('events')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                      heroDetailTab === 'events'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>⚽ Gol & Kartu</span>
                  </button>
                  <button
                    onClick={() => setHeroDetailTab('stats')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                      heroDetailTab === 'stats'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📊 Statistik</span>
                  </button>
                  <button
                    onClick={() => setHeroDetailTab('highlights')}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1 ${
                      heroDetailTab === 'highlights'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>💡 Catatan</span>
                  </button>
                </div>

                {/* Tab 1: Detailed Match Events (Gol, Assist, Kartu Merah, Kartu Kuning) */}
                {heroDetailTab === 'events' && (
                  <div className="space-y-2">
                    {currentFixture.detailedEvents && currentFixture.detailedEvents.length > 0 ? (
                      currentFixture.detailedEvents.map((ev, idx) => {
                        const matchedPlayer = players.find(
                          (p) =>
                            ev.player.toLowerCase().includes(p.name.toLowerCase()) ||
                            p.name.toLowerCase().includes(ev.player.toLowerCase())
                        );

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (matchedPlayer) setSelectedPlayer(matchedPlayer);
                            }}
                            className={`p-2.5 rounded-2xl border flex items-start gap-2.5 transition-all ${
                              matchedPlayer ? 'cursor-pointer active:scale-[0.99]' : ''
                            } ${
                              ev.type === 'goal'
                                ? isPro
                                  ? 'bg-blue-950/40 border-blue-800/80 text-white hover:border-cyan-400/50'
                                  : 'bg-blue-50/80 border-blue-200 text-blue-950 hover:border-blue-400'
                                : ev.type === 'red_card'
                                ? isPro
                                  ? 'bg-red-950/30 border-red-800/60 text-red-200'
                                  : 'bg-red-50 border-red-200 text-red-950'
                                : ev.type === 'yellow_card'
                                ? isPro
                                  ? 'bg-amber-950/20 border-amber-800/50 text-amber-200'
                                  : 'bg-amber-50/70 border-amber-200 text-amber-950'
                                : isPro
                                ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            {/* Minute Badge */}
                            <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0 text-slate-800 dark:text-slate-200">
                              {ev.minute}
                            </span>

                            {/* Event Icon */}
                            <span className="text-base shrink-0 leading-none mt-0.5">
                              {ev.type === 'goal' && '⚽'}
                              {ev.type === 'yellow_card' && '🟨'}
                              {ev.type === 'red_card' && '🟥'}
                              {ev.type === 'sub' && '🔁'}
                            </span>

                            {/* Event Description & Player Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs leading-tight">
                                  {ev.player}
                                </span>
                                {ev.type === 'goal' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500 text-white font-bold uppercase">
                                    GOL
                                  </span>
                                )}
                                {ev.type === 'red_card' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-red-600 text-white font-bold uppercase">
                                    KARTU MERAH
                                  </span>
                                )}
                                {ev.type === 'yellow_card' && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold uppercase">
                                    KARTU KUNING
                                  </span>
                                )}
                              </div>

                              {ev.assistBy && (
                                <div className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-0.5 flex items-center gap-1">
                                  <span>👟 Assist:</span>
                                  <span className="underline decoration-blue-400/50">{ev.assistBy}</span>
                                </div>
                              )}

                              {ev.detail && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                                  {ev.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : currentFixture.events && currentFixture.events.length > 0 ? (
                      currentFixture.events.map((ev, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        >
                          <span className="font-mono font-black text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 shrink-0">
                            {ev.minute}
                          </span>
                          <span className="flex-1 leading-snug">{ev.text}</span>
                          {ev.type === 'goal' && <span className="text-base shrink-0">⚽</span>}
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Pertandingan belum dimulai. Timeline real-time akan aktif saat kick-off.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Detailed Match Statistics Box Score (Sofascore Dual-Bar Comparison) */}
                {heroDetailTab === 'stats' && (
                  <div className="space-y-3">
                    {currentFixture.statsSummary ? (
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        {/* Club Headers */}
                        <div className="flex items-center justify-between text-xs font-black pb-2 border-b border-slate-200 dark:border-slate-800">
                          <span className="text-blue-600 dark:text-cyan-400 truncate max-w-[45%]">
                            {currentFixture.homeTeam}
                          </span>
                          <span className="text-slate-400 text-[10px] font-mono">VS</span>
                          <span className="text-slate-800 dark:text-slate-200 truncate max-w-[45%] text-right">
                            {currentFixture.awayTeam}
                          </span>
                        </div>

                        {/* Stat Item Rows */}
                        {[
                          {
                            label: 'Penguasaan Bola',
                            home: `${currentFixture.statsSummary.possession[0]}%`,
                            away: `${currentFixture.statsSummary.possession[1]}%`,
                            valHome: currentFixture.statsSummary.possession[0],
                            valAway: currentFixture.statsSummary.possession[1],
                          },
                          {
                            label: 'Total Tembakan',
                            home: currentFixture.statsSummary.totalShots[0],
                            away: currentFixture.statsSummary.totalShots[1],
                            valHome: currentFixture.statsSummary.totalShots[0],
                            valAway: currentFixture.statsSummary.totalShots[1],
                          },
                          {
                            label: 'Tembakan ke Gawang',
                            home: currentFixture.statsSummary.shotsOnTarget[0],
                            away: currentFixture.statsSummary.shotsOnTarget[1],
                            valHome: currentFixture.statsSummary.shotsOnTarget[0],
                            valAway: currentFixture.statsSummary.shotsOnTarget[1],
                          },
                          {
                            label: 'Akurasi Operan',
                            home: `${currentFixture.statsSummary.passAccuracy[0]}%`,
                            away: `${currentFixture.statsSummary.passAccuracy[1]}%`,
                            valHome: currentFixture.statsSummary.passAccuracy[0],
                            valAway: currentFixture.statsSummary.passAccuracy[1],
                          },
                          {
                            label: 'Tendangan Sudut',
                            home: currentFixture.statsSummary.corners[0],
                            away: currentFixture.statsSummary.corners[1],
                            valHome: currentFixture.statsSummary.corners[0],
                            valAway: currentFixture.statsSummary.corners[1],
                          },
                          {
                            label: 'Pelanggaran',
                            home: currentFixture.statsSummary.fouls[0],
                            away: currentFixture.statsSummary.fouls[1],
                            valHome: currentFixture.statsSummary.fouls[0],
                            valAway: currentFixture.statsSummary.fouls[1],
                          },
                          {
                            label: 'Kartu Kuning',
                            home: `${currentFixture.statsSummary.yellowCards[0]} 🟨`,
                            away: `${currentFixture.statsSummary.yellowCards[1]} 🟨`,
                            valHome: currentFixture.statsSummary.yellowCards[0],
                            valAway: currentFixture.statsSummary.yellowCards[1],
                          },
                          {
                            label: 'Kartu Merah',
                            home: `${currentFixture.statsSummary.redCards[0]} 🟥`,
                            away: `${currentFixture.statsSummary.redCards[1]} 🟥`,
                            valHome: currentFixture.statsSummary.redCards[0],
                            valAway: currentFixture.statsSummary.redCards[1],
                          },
                          {
                            label: 'Penyelamatan Kiper',
                            home: currentFixture.statsSummary.saves[0],
                            away: currentFixture.statsSummary.saves[1],
                            valHome: currentFixture.statsSummary.saves[0],
                            valAway: currentFixture.statsSummary.saves[1],
                          },
                        ].map((stat, i) => {
                          const total = (Number(stat.valHome) || 0) + (Number(stat.valAway) || 0) || 1;
                          const pctHome = Math.round(((Number(stat.valHome) || 0) / total) * 100);

                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="font-mono text-blue-600 dark:text-cyan-400">
                                  {stat.home}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                                  {stat.label}
                                </span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">
                                  {stat.away}
                                </span>
                              </div>
                              {/* Comparative Visual Bar */}
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-blue-600 rounded-l-full transition-all duration-500"
                                  style={{ width: `${pctHome}%` }}
                                />
                                <div
                                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-r-full transition-all duration-500"
                                  style={{ width: `${100 - pctHome}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Statistik pertandingan akan otomatis tercatat saat pertandingan berlangsung.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Tactical Highlights & Knowledge Notes */}
                {heroDetailTab === 'highlights' && (
                  <div className="space-y-2">
                    {currentFixture.highlights && currentFixture.highlights.length > 0 ? (
                      <ul className="space-y-2 text-xs">
                        {currentFixture.highlights.map((h: string, i: number) => (
                          <li
                            key={i}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border leading-relaxed ${
                              isPro
                                ? 'bg-slate-900/40 border-slate-800 text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Belum ada catatan taktikal untuk laga ini.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Sub-Page Tab 2: Dedicated Schedule & Calendar of Matches (Jadwal Pertandingan Lengkap) */}
      {matchViewTab === 'schedule' && (
        <div className="space-y-3.5">
          {/* Header & Filter Controls */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <h3 className="text-sm font-black tracking-tight">Kalender & Jadwal Laga</h3>
              <p className="text-[11px] text-slate-400">
                Pertandingan yang telah dilalui & jadwal yang akan dihadapi
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  scheduleFilter === 'all'
                    ? isPro
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-700 text-white'
                    : isPro
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setScheduleFilter('upcoming')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  scheduleFilter === 'upcoming'
                    ? isPro
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-700 text-white'
                    : isPro
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Mendatang
              </button>
              <button
                onClick={() => setScheduleFilter('finished')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  scheduleFilter === 'finished'
                    ? isPro
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-700 text-white'
                    : isPro
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Hasil
              </button>
            </div>
          </div>

          {/* List of Match Cards */}
          <div className="space-y-3">
            {filteredSchedule.map((fix: MatchFixture) => {
              const isFinished = fix.status === 'FINISHED';
              return (
                <div
                  key={fix.id}
                  onClick={() => {
                    setSelectedFixtureId(fix.id);
                    setMatchViewTab('featured');
                  }}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer active:scale-[0.99] ${
                    selectedFixtureId === fix.id
                      ? isPro
                        ? 'bg-[#181D2A] border-cyan-500/50 ring-1 ring-cyan-500/30'
                        : 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                      : isPro
                      ? 'bg-[#121620] border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Top Status & Date Pill */}
                  <div className="flex items-center justify-between text-[10px] font-bold pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 font-mono font-semibold">{fix.roundOrWeek}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-mono font-black text-[9.5px] ${
                        isFinished
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isFinished ? 'SELESAI (FT)' : `${fix.date.split(' ')[0]} ${fix.date.split(' ')[1]} • ${fix.time}`}
                    </span>
                  </div>

                  {/* Teams & Score / Schedule (Mobile-First Sofascore Format - Zero Ellipsis) */}
                  <div className="py-1.5 space-y-2.5">
                    {/* Home Club */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <ClubThumb name={fix.homeTeam} logoUrl={fix.homeLogo} />
                        <span
                          className={`text-xs leading-tight ${
                            fix.homeTeam.includes('PERSIB')
                              ? 'font-black text-blue-600 dark:text-cyan-400'
                              : 'font-bold text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {fix.homeTeam}
                        </span>
                      </div>
                      {isFinished ? (
                        <span className="font-mono font-black text-sm text-slate-950 dark:text-white shrink-0 pl-2">
                          {fix.homeScore}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 shrink-0 pl-2">-</span>
                      )}
                    </div>

                    {/* Away Club */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <ClubThumb name={fix.awayTeam} logoUrl={fix.awayLogo} />
                        <span
                          className={`text-xs leading-tight ${
                            fix.awayTeam.includes('PERSIB')
                              ? 'font-black text-blue-600 dark:text-cyan-400'
                              : 'font-bold text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {fix.awayTeam}
                        </span>
                      </div>
                      {isFinished ? (
                        <span className="font-mono font-black text-sm text-slate-950 dark:text-white shrink-0 pl-2">
                          {fix.awayScore}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-400 shrink-0 pl-2">-</span>
                      )}
                    </div>
                  </div>

                  {/* Venue and Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5 text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                      <span className="truncate">{fix.venue}</span>
                    </div>
                    <span className="text-blue-600 dark:text-cyan-400 font-extrabold shrink-0 ml-2 flex items-center gap-0.5">
                      Lihat Detail <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Sub-Page Tab 3: Dedicated Group Cards & Standings (Klasemen Group Card Lengkap) */}
      {matchViewTab === 'standings' && (
        <div className="space-y-4">
          {/* Visual High-Impact Group Card */}
          {activeTournament === 'acl2' && (
            <div
              className={`p-5 rounded-3xl border shadow-lg ${
                isPro
                  ? 'bg-gradient-to-br from-blue-900/40 via-[#121620] to-[#0E1118] border-blue-800/50'
                  : 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-cyan-300">
                  Grup E • Klasemen Sementara
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                  Juara Grup E • Lolos 16 Besar
                </span>
              </div>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    PERSIB Bandung
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Rekor Sempurna 100% Menang (4 Laga, 12 Poin)
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">12</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-blue-900/40 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Main</span>
                  <span className="font-mono font-bold text-xs">4 Laga</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">8 : 1</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+7</span>
                </div>
              </div>
            </div>
          )}

          {activeTournament === 'shopee_cup' && (
            <div
              className={`p-5 rounded-3xl border shadow-lg ${
                isPro
                  ? 'bg-gradient-to-br from-orange-950/40 via-[#121620] to-[#0E1118] border-orange-800/50'
                  : 'bg-gradient-to-br from-orange-50 via-white to-amber-50/30 border-orange-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-orange-600 dark:text-orange-400">
                  Grup B • Shopee Cup ASEAN
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider">
                  Puncak Klasemen Grup B
                </span>
              </div>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    PERSIB Bandung
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Debut Kemenangan Comeback 3-1 di Markas Port FC
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-orange-600 dark:text-orange-400">3</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-orange-900/40 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Main</span>
                  <span className="font-mono font-bold text-xs">1 Laga</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">3 : 1</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+2</span>
                </div>
              </div>
            </div>
          )}

          {activeTournament === 'liga1' && (
            <div
              className={`p-5 rounded-3xl border shadow-lg ${
                isPro
                  ? 'bg-gradient-to-br from-blue-900/30 via-[#121620] to-[#0E1118] border-slate-800'
                  : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400">
                  BRI Liga 1 • Pekan 8 Faktual
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white text-[9px] font-black uppercase tracking-wider">
                  Posisi #4 (Championship Zone)
                </span>
              </div>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    PERSIB Bandung
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Hanya terpaut 2 poin dari puncak klasemen (18 Poin)
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">16</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Rekor Laga</span>
                  <span className="font-mono font-bold text-xs">5M - 1S - 2K</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">15 : 8</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+7</span>
                </div>
              </div>
            </div>
          )}

          {/* Standings Table Container */}
          <div
            className={`rounded-[32px] border p-5 shadow-xl transition-all ${
              isPro
                ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
            }`}
          >
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                  Tabel Klasemen Lengkap
                </span>
                <h3 className="text-sm font-black tracking-tight mt-0.5">
                  {activeTournament === 'shopee_cup'
                    ? 'ASEAN Club Championship 2026/27'
                    : activeTournament === 'acl2'
                    ? 'AFC Champions League Two 2026/27'
                    : '18 Klub BRI Liga 1 2026/2027'}
                </h3>
              </div>
              <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                Verified PT LIB & AFC
              </span>
            </div>

            <div className="overflow-x-auto no-scrollbar mt-3">
              {activeTournament === 'shopee_cup' || activeTournament === 'acl2' ? (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-2 text-center">#</th>
                      <th className="py-2.5 px-2">Klub</th>
                      <th className="py-2.5 px-1.5 text-center">Main</th>
                      <th className="py-2.5 px-1.5 text-center">M-S-K</th>
                      <th className="py-2.5 px-1.5 text-center">Gol</th>
                      <th className="py-2.5 px-2 text-center font-black">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTournament === 'shopee_cup' ? shopeeCupStandings : aclStandings).map(
                      (team: GroupTeam, index: number) => (
                        <tr
                          key={team.name}
                          className={`border-b transition-colors ${
                            team.isPersib
                              ? isPro
                                ? 'bg-blue-600/15 border-blue-800/80 text-cyan-300 font-black'
                                : 'bg-blue-50/80 border-blue-200 text-blue-950 font-black'
                              : isPro
                              ? 'border-slate-800/50 text-slate-300'
                              : 'border-slate-100 text-slate-800'
                          }`}
                        >
                          <td className="py-3 px-2 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-black text-[10px] ${
                                index === 0
                                  ? 'bg-blue-600 text-white'
                                  : isPro
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-bold text-xs truncate max-w-[170px]">
                            <div className="flex items-center gap-2">
                              <ClubThumb name={team.name} logoUrl={team.logoUrl} />
                              <span className="truncate">{team.name}</span>
                              {team.isPersib && (
                                <span className="ml-1 text-[8.5px] uppercase px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono shrink-0">
                                  {activeTournament === 'shopee_cup' ? 'Puncak Grup' : 'Juara Grup'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-1.5 text-center font-mono text-[11px]">{team.played}</td>
                          <td className="py-3 px-1.5 text-center font-mono text-[11px] text-slate-400">
                            {team.won}-{team.drawn}-{team.lost ?? 0}
                          </td>
                          <td className="py-3 px-1.5 text-center font-mono text-[11px] text-slate-400">
                            {team.gf}:{team.ga}
                          </td>
                          <td className="py-3 px-2 text-center font-mono font-black text-sm text-blue-600 dark:text-cyan-400">
                            {team.points}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                      <th className="py-2.5 px-2 text-center">#</th>
                      <th className="py-2.5 px-2">Klub</th>
                      <th className="py-2.5 px-1 text-center">M</th>
                      <th className="py-2.5 px-1 text-center">M-S-K</th>
                      <th className="py-2.5 px-1 text-center">SG</th>
                      <th className="py-2.5 px-2 text-center font-black">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liga1Standings.map((row: LeagueStandingRow) => (
                      <tr
                        key={row.team}
                        className={`border-b transition-colors ${
                          row.isPersib
                            ? isPro
                              ? 'bg-blue-600/15 border-blue-800/80 text-cyan-300 font-black'
                              : 'bg-blue-50/80 border-blue-200 text-blue-950 font-black'
                            : isPro
                            ? 'border-slate-800/50 text-slate-300'
                            : 'border-slate-100 text-slate-800'
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-black text-[10px] ${
                              row.isPersib
                                ? 'bg-blue-600 text-white'
                                : row.rank <= 3
                                ? 'bg-amber-400 text-slate-950'
                                : isPro
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 font-bold text-xs truncate max-w-[160px]">
                          <div className="flex items-center gap-2">
                            <ClubThumb name={row.team} logoUrl={row.logoUrl} />
                            <span className="truncate">{row.team}</span>
                            {row.isPersib && (
                              <span className="ml-1 text-[8px] uppercase px-1 rounded bg-blue-700 text-white font-mono shrink-0">
                                Persib
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono text-[11px]">{row.played}</td>
                        <td className="py-2.5 px-1 text-center font-mono text-[10px] text-slate-400">
                          {row.won}-{row.drawn}-{row.lost}
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono text-[11px] text-slate-400">
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-black text-sm text-blue-600 dark:text-cyan-400">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Sub-Page Tab 4: Interactive 2D Visual Pitch & Lineup List (Taktik XI & Skuad) */}
      {matchViewTab === 'lineup' && (
        <div className="space-y-4">
          {/* Card Formasi Visual Lapangan (Interactive 2D Football Pitch) */}
          <div
            className={`rounded-[32px] border p-4 sm:p-5 shadow-2xl transition-all overflow-hidden ${
              isPro
                ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
            }`}
          >
            {/* Header Formasi & Live Clock Ticker */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
                    Formasi Visual 4-2-3-1
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-600/30 text-blue-700 dark:text-cyan-300 font-mono text-[9px] font-black uppercase whitespace-nowrap">
                    Igor Tolic
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Posisi spasial & pergerakan taktis real-time per detik
                </p>
              </div>

              {/* Live Match Clock Ticker (Ticking every second) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span className="font-mono font-black text-[11px] sm:text-xs">
                    {liveMinute}:{String(liveSeconds).padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTacticsPlaying((prev) => !prev)}
                  className={`p-1.5 sm:p-2 rounded-xl flex items-center justify-center transition-all ${
                    isTacticsPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : isPro
                      ? 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-blue-700 hover:bg-slate-200'
                  }`}
                  title={isTacticsPlaying ? 'Jeda Simulasi Taktik' : 'Putar Siklus Taktik Otomatis'}
                >
                  {isTacticsPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Tactical Phase Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3 text-center">
              {[
                { step: 1, label: 'Fase 1: Build-Up' },
                { step: 2, label: 'Fase 2: Flank Overload' },
                { step: 3, label: 'Fase 3: Box Finishing' },
              ].map((phase) => (
                <button
                  key={phase.step}
                  type="button"
                  onClick={() => {
                    setIsTacticsPlaying(false);
                    setActiveTacticalStep(phase.step);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition-all ${
                    activeTacticalStep === phase.step
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {phase.label}
                </button>
              ))}
            </div>

            {/* Tactical Phase Briefing Card */}
            <div
              className={`p-2.5 rounded-2xl border text-xs mb-3 transition-all ${
                isPro
                  ? 'bg-blue-950/20 border-blue-900/50 text-cyan-200'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-600 dark:text-cyan-400">
                <Activity className="w-3.5 h-3.5" />
                <span>{currentTacticalPhase.label}</span>
              </div>
              <p className="text-[10px] mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentTacticalPhase.description}
              </p>
            </div>

            {/* 2D Green Football Pitch Canvas */}
            <div className="relative w-full h-[450px] rounded-2xl bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-950 border-2 border-emerald-500/50 overflow-hidden shadow-inner select-none">
              {/* Pitch Grass Stripes */}
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                <div className="flex-1 bg-white/5" />
                <div className="flex-1 bg-transparent" />
                <div className="flex-1 bg-white/5" />
                <div className="flex-1 bg-transparent" />
                <div className="flex-1 bg-white/5" />
                <div className="flex-1 bg-transparent" />
              </div>

              {/* Pitch White Markings */}
              {/* Outer Inset Border */}
              <div className="absolute inset-2 border border-white/30 rounded-xl pointer-events-none" />

              {/* Halfway Line */}
              <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-white/30 pointer-events-none" />

              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/30 pointer-events-none flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
              </div>

              {/* Top Penalty Area (Opponent Box) */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-44 h-20 border-b border-x border-white/30 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 border-b border-x border-white/30" />
              </div>

              {/* Bottom Penalty Area (Persib Box) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-44 h-20 border-t border-x border-white/30 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-8 border-t border-x border-white/30" />
              </div>

              {/* Gliding Animated Football ⚽ */}
              {currentTacticalPhase.ballPos && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20 pointer-events-none"
                  style={{
                    bottom: `${currentTacticalPhase.ballPos.x}%`,
                    left: `${currentTacticalPhase.ballPos.y}%`,
                  }}
                >
                  <span className="inline-block text-base filter drop-shadow-md animate-bounce">
                    ⚽
                  </span>
                </div>
              )}

              {/* 11 Starting Players Position Nodes with Verified Profile Photos */}
              {currentTacticalPhase.playerPositions?.map((pos) => {
                const fullPlayer = players.find(
                  (p) => p.number === pos.number || p.name.toLowerCase().includes(pos.name.toLowerCase())
                );

                return (
                  <div
                    key={pos.id}
                    onClick={() => {
                      if (fullPlayer) setSelectedPlayer(fullPlayer);
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-700 ease-out group z-10 hover:z-30 active:scale-95"
                    style={{
                      bottom: `${pos.x}%`,
                      left: `${pos.y}%`,
                    }}
                  >
                    <div className="relative">
                      {/* Round Player Avatar Node - Clean Photo WITHOUT any text covering the face */}
                      <div className="w-10 h-10 rounded-full ring-2 ring-white/95 dark:ring-slate-700 shadow-xl overflow-hidden bg-slate-900 group-hover:scale-110 group-hover:ring-cyan-300 transition-all flex items-center justify-center p-0.5">
                        <img
                          src={getPlayerAvatar(pos.name)}
                          alt={pos.name}
                          className="w-full h-full object-contain select-none scale-[0.88] origin-bottom"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.player-fallback-num') as HTMLElement;
                            if (fallback) fallback.style.display = 'block';
                          }}
                          loading="lazy"
                        />
                        {/* Fallback ONLY shown when image fails to load */}
                        <span className="player-fallback-num hidden font-mono font-black text-[10px] text-white">
                          #{pos.number}
                        </span>
                      </div>

                      {/* Number Badge - Positioned outside on the bottom-right corner */}
                      <span className="absolute -bottom-1 -right-1 bg-blue-700 text-white font-mono text-[8.5px] font-black px-1.5 py-0.2 rounded-full border border-white dark:border-slate-800 shadow-sm leading-tight">
                        {pos.number}
                      </span>
                    </div>

                    {/* Player Name Pill */}
                    <span className="mt-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-bold text-white shadow-md whitespace-nowrap tracking-tight group-hover:bg-blue-700 transition-colors">
                      {pos.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2.5 text-center">
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                💡 Ketuk foto pemain di lapangan untuk melihat profil medis & statistik lengkap
              </span>
            </div>
          </div>

          {/* 11 Pemain Pertama (Starting XI) & Substitutes Card */}
          <div
            className={`rounded-[32px] border p-5 shadow-xl transition-all ${
              isPro
                ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
            }`}
          >
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-sm font-black tracking-tight">Daftar Skuad & Rating Fisik</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Head Coach: <strong className="text-blue-600 dark:text-cyan-400">Igor Tolic</strong> • Starting XI & Rotasi
              </p>
            </div>

            <div className="space-y-4">
              {/* Starting XI Section */}
              <div>
                <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-amber-500 flex items-center justify-between">
                  <span>11 Pemain Pertama (Starting XI)</span>
                  <span className="text-emerald-500 font-bold">100% Siap Tempur</span>
                </h4>
                <div className="space-y-2">
                  {startingXI.map((player: Player) => (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                        isPro
                          ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-400/50'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-600 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          name={player.name}
                          number={player.number}
                          avatarUrl={player.avatarUrl}
                          position={player.position}
                          isStarting={true}
                          size="md"
                        />
                        <div>
                          <div className="text-xs font-black">{player.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                              {player.position}
                            </span>{' '}
                            • {player.nationality} • {player.marketValue}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-500 font-bold">
                          {player.fitness.percentage}% Fit
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Substitutes Section */}
              <div>
                <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-slate-400">
                  Pemain Pengganti & Rotasi (Substitutes)
                </h4>
                <div className="space-y-2">
                  {substitutes.map((player: Player) => (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                        isPro
                          ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlayerAvatar
                          name={player.name}
                          number={player.number}
                          avatarUrl={player.avatarUrl}
                          position={player.position}
                          isStarting={false}
                          size="md"
                        />
                        <div>
                          <div className="text-xs font-bold">{player.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            <span className="font-mono font-bold text-slate-500">{player.position}</span> •{' '}
                            {player.nationality}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-emerald-500 font-bold">
                          {player.fitness.percentage}% Fit
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
