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
  Activity,
  Swords,
  TrendingUp,
  Target,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  MatchFixture,
  Player,
  LeagueStandingRow,
  GroupTeam,
  TacticalPlayerPos,
  TacticalDuelMatchup,
} from '@/types/club';
import {
  getClubLogo,
  getPlayerAvatar,
  getClubProfile,
  getOpponentSquad,
  convertOpponentPlayerToPlayer,
} from '@/data/persib-data';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { ClubIntelligenceView } from './ClubIntelligenceView';

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

// Helper component for Tactical Pitch Player Node with isolated state
function TacticalPlayerNode({
  pos,
  fullPlayer,
  onSelectPlayer,
}: {
  pos: TacticalPlayerPos;
  fullPlayer?: Player;
  onSelectPlayer: (player: Player) => void;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={() => {
        if (fullPlayer) onSelectPlayer(fullPlayer);
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
          {!hasError ? (
            <img
              src={getPlayerAvatar(pos.name)}
              alt={pos.name}
              className="w-full h-full object-contain select-none scale-[0.88] origin-bottom"
              onError={() => setHasError(true)}
              loading="lazy"
            />
          ) : (
            <span className="font-mono font-black text-[10px] text-white">
              #{pos.number}
            </span>
          )}
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
  // REFACTOR: Decouple from hardcoded 'l1-p8' string. Null allows dynamic auto-selection of active/latest match
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  // REFACTOR: AAA-grade expanded match center tabs with opponent squad, tactical duels, spatial pitch, and momentum
  const [heroDetailTab, setHeroDetailTab] = useState<'events' | 'lineups' | 'duels' | 'pitch' | 'stats' | 'highlights'>('events');
  const [selectedClubForIntel, setSelectedClubForIntel] = useState<string | null>(null);
  const [heroLineupFilter, setHeroLineupFilter] = useState<'all' | 'persib' | 'opponent'>('all');
  const [taktikClashMode, setTaktikClashMode] = useState<'dual' | 'persib' | 'opponent'>('dual');

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
  // REFACTOR: Dynamically prioritize explicit selection -> LIVE match -> tournament-aware matchday -> latest finished/scheduled
  const currentFixture: MatchFixture =
    (selectedFixtureId ? tournamentFixtures.find((f: MatchFixture) => f.id === selectedFixtureId) : null) ||
    tournamentFixtures.find((f) => f.status === 'LIVE') ||
    (activeTournament === 'shopee_cup'
      ? tournamentFixtures.find((f) => f.id === 'shopee-26-md2-ft') || [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED')
      : activeTournament === 'acl2'
      ? tournamentFixtures.find((f) => f.id === 'acl2-26-md4-live') || [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED')
      : tournamentFixtures.find((f) => f.id === 'l1-p10') || tournamentFixtures.find((f) => f.id === 'l1-p9') || [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED')) ||
    [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED' || f.status === 'SCHEDULED') ||
    tournamentFixtures[0] ||
    fixtures[0];

  const filteredSchedule = tournamentFixtures.filter((fix) => {
    if (scheduleFilter === 'upcoming') return fix.status === 'SCHEDULED' || fix.status === 'LIVE';
    if (scheduleFilter === 'finished') return fix.status === 'FINISHED';
    return true;
  });

  const startingXI: Player[] = players.filter((p: Player) => p.squadRole === 'starting');
  const substitutes: Player[] = players.filter((p: Player) => p.squadRole === 'substitute');
  const persibStanding = liga1Standings.find((r) => r.isPersib || r.team.toLowerCase().includes('persib'));
  const persibAclTeam = aclStandings.find((t) => t.isPersib || t.name.toLowerCase().includes('persib'));
  const persibShopeeTeam = shopeeCupStandings.find((t) => t.isPersib || t.name.toLowerCase().includes('persib'));

  // REFACTOR: Opponent squad, tactical duels, and dual formation telemetry
  const isPersibHome = currentFixture.homeTeam.toUpperCase().includes('PERSIB');
  const opponentTeamName = isPersibHome ? currentFixture.awayTeam : currentFixture.homeTeam;
  const opponentLogo = isPersibHome ? currentFixture.awayLogo : currentFixture.homeLogo;
  const opponentSquadData = currentFixture.opponentSquad || getOpponentSquad(opponentTeamName);
  const opponentProfile = getClubProfile(opponentTeamName);
  const activeTacticalDuels: TacticalDuelMatchup[] =
    currentFixture.tacticalDuels && currentFixture.tacticalDuels.length > 0
      ? currentFixture.tacticalDuels
      : [
          {
            id: 'duel-default-1',
            title: 'Pertarungan Maestro Lini Tengah',
            zone: 'Central Midfield Zone',
            persibPlayer: {
              name: 'Thom Haye',
              number: 33,
              position: 'MF (DMF)',
              rating: 9.2,
              avatarUrl: getPlayerAvatar('Thom Haye'),
            },
            opponentPlayer: {
              name: opponentSquadData.startingXI[5]?.name || opponentSquadData.startingXI[0]?.name || 'Gelandang Lawan',
              number: opponentSquadData.startingXI[5]?.number || 8,
              position: opponentSquadData.startingXI[5]?.position || 'MF',
              rating: 8.5,
              avatarUrl: opponentSquadData.startingXI[5]?.avatarUrl,
            },
            keyInsight: 'Pertarungan penguasaan tempo dan progresi bola ke sepertiga akhir pertahanan lawan.',
            winProbability: [62, 38],
          },
          {
            id: 'duel-default-2',
            title: 'Duel Benteng Udara vs Ujung Tombak',
            zone: 'Central Defensive Box',
            persibPlayer: {
              name: 'Patricio Matricardi',
              number: 48,
              position: 'DF (CB)',
              rating: 8.7,
              avatarUrl: getPlayerAvatar('Patricio Matricardi'),
            },
            opponentPlayer: {
              name: opponentSquadData.startingXI[9]?.name || 'Striker Lawan',
              number: opponentSquadData.startingXI[9]?.number || 9,
              position: opponentSquadData.startingXI[9]?.position || 'CF',
              rating: 8.8,
              avatarUrl: opponentSquadData.startingXI[9]?.avatarUrl,
            },
            keyInsight: 'Duel fisik kotak penalti untuk menetralisir crossing udara dan bola liar secepat mungkin.',
            winProbability: [59, 41],
          },
        ];

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
              : `Peringkat #${persibStanding?.rank || 6}`}
          </span>
        </div>

        {/* Competition Selector (Responsive 3-Column Grid - Zero Text Clipping) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setActiveTournament('liga1');
              // REFACTOR: Dynamically clear selection so active matchday (Pekan 9) resolves automatically
              setSelectedFixtureId(null);
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
              // REFACTOR: Dynamically clear selection so latest ACL Two match resolves automatically
              setSelectedFixtureId(null);
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
              // REFACTOR: Dynamically clear selection so latest Shopee Cup match resolves automatically
              setSelectedFixtureId(null);
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
          onClick={() => {
            setMatchViewTab('standings');
            setSelectedClubForIntel(null);
          }}
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
                    (selectedFixtureId ? selectedFixtureId === fix.id : currentFixture.id === fix.id)
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
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider mb-4">
                <span className="text-slate-400 font-mono text-[9px] sm:text-[10px] whitespace-nowrap shrink-0">{currentFixture.tournament}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-cyan-300 font-extrabold text-[9px] sm:text-[9.5px] whitespace-nowrap truncate max-w-[65%] text-right">
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
                  <span className="text-[9px] font-mono font-bold text-slate-400 mt-1 uppercase whitespace-nowrap">
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
              <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-200 dark:border-slate-800/80">
                <div className="shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider whitespace-nowrap">
                    {currentFixture.status === 'FINISHED' ? 'Skor Akhir' : 'Jadwal Kick-off'}
                  </span>
                  <div className="mt-0.5 whitespace-nowrap">
                    {currentFixture.status === 'FINISHED' ? (
                      <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-cyan-400">
                        {currentFixture.homeScore} : {currentFixture.awayScore}
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                          {currentFixture.time.split(' ')[0]}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 font-mono">
                          {currentFixture.time.split(' ').slice(1).join(' ') || 'WIB'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider whitespace-nowrap">
                    {currentFixture.status === 'FINISHED' ? 'Status Laga' : 'Tanggal Pertandingan'}
                  </span>
                  <div className="text-[11px] sm:text-xs font-bold mt-1 whitespace-nowrap">
                    {currentFixture.status === 'FINISHED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] whitespace-nowrap">
                        FT (Selesai)
                      </span>
                    ) : (
                      <span className="font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap">
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

              {/* Match Intelligence Navigation Switcher (6 Comprehensive AAA Sub-tabs) */}
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center mb-3.5">
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('events')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'events'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">⚽ Gol & Kartu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('lineups')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'lineups'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">👥 Skuad & XI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('duels')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'duels'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">⚔️ Duel 1v1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('pitch')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'pitch'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">🗺️ Formasi 2D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('stats')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'stats'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">📊 Statistik</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('highlights')}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl text-[9px] sm:text-[10px] font-black transition-all flex items-center justify-center gap-0.5 sm:gap-1 whitespace-nowrap overflow-hidden ${
                      heroDetailTab === 'highlights'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="truncate">💡 Catatan</span>
                  </button>
                </div>

                {/* Tab 1: Detailed Match Events (Gol, Assist, Kartu Merah, Kartu Kuning) with Verified Player & Assist Avatars */}
                {heroDetailTab === 'events' && (
                  <div className="space-y-2">
                    {currentFixture.detailedEvents && currentFixture.detailedEvents.length > 0 ? (
                      currentFixture.detailedEvents.map((ev, idx) => {
                        const matchedPersib = players.find(
                          (p) =>
                            ev.player.toLowerCase().includes(p.name.toLowerCase()) ||
                            p.name.toLowerCase().includes(ev.player.toLowerCase())
                        );
                        const matchedOpp = opponentSquadData.startingXI
                          .concat(opponentSquadData.substitutes)
                          .find(
                            (op) =>
                              ev.player.toLowerCase().includes(op.name.toLowerCase()) ||
                              op.name.toLowerCase().includes(ev.player.toLowerCase())
                          );
                        const targetPlayerObj: Player | null = matchedPersib
                          ? matchedPersib
                          : matchedOpp
                          ? convertOpponentPlayerToPlayer(matchedOpp, opponentTeamName)
                          : null;

                        const matchedAssistPersib = ev.assistBy
                          ? players.find(
                              (p) =>
                                ev.assistBy?.toLowerCase().includes(p.name.toLowerCase()) ||
                                p.name.toLowerCase().includes(ev.assistBy?.toLowerCase() || '')
                            )
                          : null;
                        const matchedAssistOpp = ev.assistBy
                          ? opponentSquadData.startingXI
                              .concat(opponentSquadData.substitutes)
                              .find(
                                (op) =>
                                  ev.assistBy?.toLowerCase().includes(op.name.toLowerCase()) ||
                                  op.name.toLowerCase().includes(ev.assistBy?.toLowerCase() || '')
                              )
                          : null;
                        const assistPlayerObj: Player | null = matchedAssistPersib
                          ? matchedAssistPersib
                          : matchedAssistOpp
                          ? convertOpponentPlayerToPlayer(matchedAssistOpp, opponentTeamName)
                          : null;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (targetPlayerObj) setSelectedPlayer(targetPlayerObj);
                            }}
                            className={`p-2.5 rounded-2xl border flex items-start gap-2.5 transition-all ${
                              targetPlayerObj ? 'cursor-pointer active:scale-[0.99]' : ''
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

                            {/* Verified Player Photo Avatar */}
                            <div className="shrink-0">
                              <PlayerAvatar
                                name={targetPlayerObj ? targetPlayerObj.name : ev.player}
                                avatarUrl={targetPlayerObj?.avatarUrl}
                                number={targetPlayerObj?.number}
                                size="sm"
                              />
                            </div>

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
                                {targetPlayerObj && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                                    #{targetPlayerObj.number} {targetPlayerObj.position}
                                  </span>
                                )}
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
                                <div
                                  onClick={(e) => {
                                    if (assistPlayerObj) {
                                      e.stopPropagation();
                                      setSelectedPlayer(assistPlayerObj);
                                    }
                                  }}
                                  className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-1 flex items-center gap-1.5"
                                >
                                  <div className="shrink-0">
                                    <PlayerAvatar
                                      name={assistPlayerObj ? assistPlayerObj.name : ev.assistBy}
                                      avatarUrl={assistPlayerObj?.avatarUrl}
                                      number={assistPlayerObj?.number}
                                      size="xs"
                                    />
                                  </div>
                                  <span>👟 Assist:</span>
                                  <span className="underline decoration-blue-400/50 hover:text-blue-500">
                                    {ev.assistBy}
                                  </span>
                                </div>
                              )}

                              {ev.detail && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
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

                {/* Tab 2: Skuad Lengkap Lawan & Persib (Starting XI & Substitutes) */}
                {heroDetailTab === 'lineups' && (
                  <div className="space-y-3.5">
                    {/* Filter Skuad Selector */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <button
                        type="button"
                        onClick={() => setHeroLineupFilter('all')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black transition-all ${
                          heroLineupFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Semua Skuad
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroLineupFilter('persib')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black transition-all ${
                          heroLineupFilter === 'persib'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        🔵 Persib
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroLineupFilter('opponent')}
                        className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-black transition-all truncate ${
                          heroLineupFilter === 'opponent'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        🔴 {opponentTeamName}
                      </button>
                    </div>

                    {/* Skuad Lawan (Starting XI & Substitutes) */}
                    {(heroLineupFilter === 'all' || heroLineupFilter === 'opponent') && (
                      <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <ClubThumb name={opponentTeamName} logoUrl={opponentLogo || opponentProfile.logoUrl} />
                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                              Skuad Resmi: {opponentTeamName}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold">
                            {opponentProfile.preferredFormation}
                          </span>
                        </div>

                        {/* Opponent Starting XI */}
                        <div>
                          <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center justify-between">
                            <span>Starting XI ({opponentSquadData.startingXI.length} Pemain)</span>
                            <span className="text-emerald-500">Terverifikasi Kick-Off</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {opponentSquadData.startingXI.map((opp) => {
                              const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                              return (
                                <div
                                  key={opp.id}
                                  onClick={() => setSelectedPlayer(oppAsPlayer)}
                                  className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                                    isPro
                                      ? 'bg-slate-900/60 border-slate-800 hover:border-red-500/50'
                                      : 'bg-white border-slate-200 hover:border-red-500 shadow-xs'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <PlayerAvatar
                                      name={opp.name}
                                      avatarUrl={opp.avatarUrl}
                                      number={opp.number}
                                      position={opp.position.includes('GK') ? 'GK' : opp.position.includes('DF') ? 'DF' : opp.position.includes('MF') ? 'MF' : 'FW'}
                                      size="sm"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-black truncate">{opp.name}</div>
                                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                                        <span className="font-mono font-bold text-red-500">{opp.position}</span>
                                        <span>•</span>
                                        <span>{opp.tacticalRole || opp.marketValue}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                                    #{opp.number}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Opponent Substitutes */}
                        {opponentSquadData.substitutes.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">
                              Pemain Cadangan / Substitutes ({opponentSquadData.substitutes.length} Pemain)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {opponentSquadData.substitutes.map((opp) => {
                                const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                                return (
                                  <div
                                    key={opp.id}
                                    onClick={() => setSelectedPlayer(oppAsPlayer)}
                                    className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                                      isPro
                                        ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700'
                                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <PlayerAvatar
                                        name={opp.name}
                                        avatarUrl={opp.avatarUrl}
                                        number={opp.number}
                                        position={opp.position.includes('GK') ? 'GK' : opp.position.includes('DF') ? 'DF' : opp.position.includes('MF') ? 'MF' : 'FW'}
                                        size="xs"
                                      />
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold truncate">{opp.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                          <span className="font-mono text-slate-500 font-bold">{opp.position}</span> • {opp.tacticalRole || opp.marketValue}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                      #{opp.number}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Skuad PERSIB Bandung */}
                    {(heroLineupFilter === 'all' || heroLineupFilter === 'persib') && (
                      <div className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">
                              Skuad Resmi: PERSIB BANDUNG
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-600 dark:text-cyan-400 font-bold">
                            4-2-3-1 Modern Pangeran Biru
                          </span>
                        </div>

                        {/* Persib Starting XI */}
                        <div>
                          <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 flex items-center justify-between">
                            <span>Starting XI ({startingXI.length} Pemain)</span>
                            <span className="text-emerald-500">100% Siap Tempur</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {startingXI.map((player) => (
                              <div
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                                  isPro
                                    ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                                    : 'bg-white border-slate-200 hover:border-blue-600 shadow-xs'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <PlayerAvatar
                                    name={player.name}
                                    avatarUrl={player.avatarUrl}
                                    number={player.number}
                                    position={player.position}
                                    size="sm"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-black truncate">{player.name}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                                      <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">{player.position}</span>
                                      <span>•</span>
                                      <span>{player.marketValue}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-cyan-300 shrink-0">
                                  #{player.number}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Persib Substitutes */}
                        {substitutes.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">
                              Pemain Cadangan / Substitutes ({substitutes.length} Pemain)
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {substitutes.map((player) => (
                                <div
                                  key={player.id}
                                  onClick={() => setSelectedPlayer(player)}
                                  className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                                    isPro
                                      ? 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700'
                                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <PlayerAvatar
                                      name={player.name}
                                      avatarUrl={player.avatarUrl}
                                      number={player.number}
                                      position={player.position}
                                      size="xs"
                                    />
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold truncate">{player.name}</div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        <span className="font-mono text-slate-500 font-bold">{player.position}</span> • {player.nationality}
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                    #{player.number}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Key Tactical Duels (1v1 Clash Cards) with Probabilities & Scouting Notes */}
                {heroDetailTab === 'duels' && (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-xs">
                      <div className="flex items-center gap-2 font-black text-blue-600 dark:text-cyan-400 text-[11px]">
                        <Swords className="w-4 h-4 shrink-0" />
                        <span>Analisis Duel Kunci Pertandingan (1-on-1 Head-to-Head Clash)</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">
                        Pertarungan spasial kunci yang menentukan penguasaan bola dan konversi peluang di atas lapangan.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {activeTacticalDuels.map((duel, dIdx) => {
                        const matchedPersib = players.find((p) => p.name.toLowerCase().includes(duel.persibPlayer.name.toLowerCase()));
                        const matchedOpp = opponentSquadData.startingXI.concat(opponentSquadData.substitutes).find((op) => op.name.toLowerCase().includes(duel.opponentPlayer.name.toLowerCase()));
                        const oppAsPlayer = matchedOpp ? convertOpponentPlayerToPlayer(matchedOpp, opponentTeamName) : null;

                        return (
                          <div
                            key={duel.id || dIdx}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isPro
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-slate-50/80 border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-black tracking-tight">{duel.title}</span>
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-cyan-300 font-bold uppercase">
                                {duel.zone}
                              </span>
                            </div>

                            {/* Dual Clash Fighters Visual */}
                            <div className="flex items-center justify-between gap-2">
                              {/* Persib Fighter */}
                              <div
                                onClick={() => { if (matchedPersib) setSelectedPlayer(matchedPersib); }}
                                className={`flex-1 p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                  isPro ? 'bg-slate-900/90 border-blue-800/60 hover:border-cyan-400' : 'bg-white border-blue-200 hover:border-blue-400'
                                }`}
                              >
                                <PlayerAvatar
                                  name={duel.persibPlayer.name}
                                  avatarUrl={duel.persibPlayer.avatarUrl}
                                  number={duel.persibPlayer.number}
                                  position={duel.persibPlayer.position.includes('CB') || duel.persibPlayer.position.includes('DF') ? 'DF' : duel.persibPlayer.position.includes('MF') ? 'MF' : 'FW'}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-black truncate">{duel.persibPlayer.name}</div>
                                  <div className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">
                                    #{duel.persibPlayer.number} • {duel.persibPlayer.position}
                                  </div>
                                </div>
                              </div>

                              {/* VS Center Pillar */}
                              <div className="shrink-0 flex flex-col items-center px-1">
                                <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-[10px] text-slate-700 dark:text-slate-300">
                                  VS
                                </span>
                              </div>

                              {/* Opponent Fighter */}
                              <div
                                onClick={() => { if (oppAsPlayer) setSelectedPlayer(oppAsPlayer); }}
                                className={`flex-1 p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                  isPro ? 'bg-slate-900/90 border-red-800/60 hover:border-red-400' : 'bg-white border-red-200 hover:border-red-400'
                                }`}
                              >
                                <PlayerAvatar
                                  name={duel.opponentPlayer.name}
                                  avatarUrl={duel.opponentPlayer.avatarUrl}
                                  number={duel.opponentPlayer.number}
                                  position={duel.opponentPlayer.position.includes('CB') || duel.opponentPlayer.position.includes('DF') ? 'DF' : duel.opponentPlayer.position.includes('MF') ? 'MF' : 'FW'}
                                  size="sm"
                                />
                                <div className="min-w-0 flex-1 text-right sm:text-left">
                                  <div className="text-xs font-black truncate">{duel.opponentPlayer.name}</div>
                                  <div className="text-[10px] font-mono text-red-500 font-bold">
                                    #{duel.opponentPlayer.number} • {duel.opponentPlayer.position}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Win Probability Bar */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono font-black">
                                <span className="text-blue-600 dark:text-cyan-400">{duel.winProbability[0]}% Dominan</span>
                                <span className="text-slate-400">Probabilitas Duel</span>
                                <span className="text-red-500">{duel.winProbability[1]}% Dominan</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-blue-600 rounded-l-full transition-all duration-500" style={{ width: `${duel.winProbability[0]}%` }} />
                                <div className="h-full bg-red-500 rounded-r-full transition-all duration-500" style={{ width: `${duel.winProbability[1]}%` }} />
                              </div>
                            </div>

                            {/* Tactical Note */}
                            <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                              💡 {duel.keyInsight}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 4: Interactive 2D Pitch Dual Formation Clash */}
                {heroDetailTab === 'pitch' && (
                  <div className="space-y-3">
                    {/* Mode Toggle inside Pitch Tab */}
                    <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <button
                        type="button"
                        onClick={() => setTaktikClashMode('dual')}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                          taktikClashMode === 'dual'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        ⚡ Dual Bentrok
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaktikClashMode('persib')}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all ${
                          taktikClashMode === 'persib'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        🔵 Formasi Persib
                      </button>
                      <button
                        type="button"
                        onClick={() => setTaktikClashMode('opponent')}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all truncate ${
                          taktikClashMode === 'opponent'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        🔴 {opponentTeamName}
                      </button>
                    </div>

                    {/* 2D Green Football Pitch Canvas */}
                    <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-950 border-2 border-emerald-500/50 overflow-hidden shadow-inner select-none">
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
                      <div className="absolute inset-2 border border-white/30 rounded-xl pointer-events-none" />
                      <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-white/30 pointer-events-none" />
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

                      {/* Team Name Watermarks */}
                      <div className="absolute top-4 left-4 text-[10px] font-mono font-black text-white/40 tracking-wider uppercase pointer-events-none">
                        {opponentTeamName} ({opponentProfile.preferredFormation})
                      </div>
                      <div className="absolute bottom-4 right-4 text-[10px] font-mono font-black text-cyan-300/40 tracking-wider uppercase pointer-events-none">
                        PERSIB BANDUNG (4-2-3-1)
                      </div>

                      {/* Center Ball ⚽ */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <span className="inline-block text-base filter drop-shadow-md animate-bounce">
                          ⚽
                        </span>
                      </div>

                      {/* Dual Bentrok Mode: Renders Both Persib & Opponent XI */}
                      {(taktikClashMode === 'dual' || taktikClashMode === 'opponent') &&
                        opponentSquadData.startingXI.map((opp) => {
                          const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                          // Calculate position on upper half (bottom: 54% to 92%)
                          const posX = opp.pitchX !== undefined ? opp.pitchX : 75;
                          const posY = opp.pitchY !== undefined ? opp.pitchY : 50;

                          return (
                            <div
                              key={opp.id}
                              onClick={() => setSelectedPlayer(oppAsPlayer)}
                              style={{ bottom: `${posX}%`, left: `${posY}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform active:scale-90"
                            >
                              <div className="relative">
                                <div className="w-8 h-8 rounded-full border-2 border-red-500 overflow-hidden shadow-lg bg-slate-900 group-hover:scale-110 transition-transform">
                                  <img
                                    src={opp.avatarUrl}
                                    alt={opp.name}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover object-top"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        opp.name
                                      )}&background=dc2626&color=ffffff&bold=true`;
                                    }}
                                  />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono font-black text-[8px] flex items-center justify-center border border-white">
                                  {opp.number}
                                </span>
                              </div>
                              <span className="mt-0.5 px-1.5 py-0.2 rounded bg-black/75 backdrop-blur-xs text-[8px] font-bold text-white whitespace-nowrap shadow-xs">
                                {opp.name.split(' ').slice(0, 2).join(' ')}
                              </span>
                            </div>
                          );
                        })}

                      {/* Persib XI on lower half (bottom: 6% to 46%) */}
                      {(taktikClashMode === 'dual' || taktikClashMode === 'persib') &&
                        (currentTacticalPhase.playerPositions && currentTacticalPhase.playerPositions.length > 0
                          ? currentTacticalPhase.playerPositions
                          : [
                              { id: 'p-gk', name: 'Teja Paku Alam', number: 14, role: 'GK', x: 8, y: 50 },
                              { id: 'p-rb', name: 'Sandy Walsh', number: 6, role: 'RB', x: 20, y: 82 },
                              { id: 'p-cb1', name: 'Patricio Matricardi', number: 4, role: 'CB', x: 16, y: 62 },
                              { id: 'p-cb2', name: 'Gabriel Mutombo', number: 3, role: 'CB', x: 16, y: 38 },
                              { id: 'p-lb', name: 'Eliano Reijnders', number: 2, role: 'LB', x: 20, y: 18 },
                              { id: 'p-dm1', name: 'Thom Haye', number: 33, role: 'DM', x: 30, y: 60 },
                              { id: 'p-dm2', name: 'Marc Klok', number: 23, role: 'DM', x: 30, y: 40 },
                              { id: 'p-rw', name: 'Mariano Peralta', number: 10, role: 'RW', x: 42, y: 82 },
                              { id: 'p-am', name: 'Luciano Guaycochea', number: 8, role: 'AM', x: 40, y: 50 },
                              { id: 'p-lw', name: 'Ragnar Oratmangoen', number: 77, role: 'LW', x: 42, y: 18 },
                              { id: 'p-cf', name: 'Balša Sekulić', number: 99, role: 'CF', x: 47, y: 50 },
                            ]
                        ).map((pos) => {
                          const fullPlayer = players.find(
                            (p) => p.number === pos.number || p.name.toLowerCase().includes(pos.name.toLowerCase())
                          );

                          return (
                            <TacticalPlayerNode
                              key={pos.id}
                              pos={pos}
                              fullPlayer={fullPlayer}
                              onSelectPlayer={setSelectedPlayer}
                            />
                          );
                        })}
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        💡 Ketuk avatar pemain mana pun di atas lapangan untuk membuka lembar analisis mendalam
                      </span>
                    </div>
                  </div>
                )}

                {/* Tab 5: Detailed Match Statistics & Live Momentum Timeline */}
                {heroDetailTab === 'stats' && (
                  <div className="space-y-3.5">
                    {/* Live Momentum Timeline Bar Chart */}
                    {currentFixture.liveMomentumTimeline && currentFixture.liveMomentumTimeline.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-black">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                            <span>Grafik Momentum Tekanan Laga (90 Menit)</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-mono font-bold">
                            <span className="flex items-center gap-1 text-blue-600 dark:text-cyan-400">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              Persib
                            </span>
                            <span className="flex items-center gap-1 text-red-500">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              {opponentTeamName}
                            </span>
                          </div>
                        </div>

                        {/* Momentum Bars */}
                        <div className="h-24 w-full flex items-center justify-between gap-0.5 pt-4 pb-2 border-b border-slate-200 dark:border-slate-800 relative">
                          {/* Center Zero Line */}
                          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-300 dark:bg-slate-700 pointer-events-none" />

                          {currentFixture.liveMomentumTimeline.map((pt, pIdx) => {
                            const diff = pt.persibPressure - pt.opponentPressure;
                            const isPositive = diff >= 0;
                            const heightPct = Math.min(100, Math.max(20, Math.abs(diff)));

                            return (
                              <div
                                key={pIdx}
                                title={`Menit ${pt.minute}': ${pt.highlight || (isPositive ? `Persib Menekan (${pt.persibPressure}%)` : `${opponentTeamName} Menekan (${pt.opponentPressure}%)`)}`}
                                className="flex-1 flex flex-col items-center justify-center h-full relative group cursor-pointer"
                              >
                                {pt.highlight && (
                                  <span className="absolute -top-3 text-[10px] animate-bounce z-10">
                                    {pt.highlight.includes('Gol') ? '⚽' : pt.highlight.includes('Kartu') ? '🟨' : '⚡'}
                                  </span>
                                )}
                                <div className="h-full w-full flex flex-col justify-center">
                                  {isPositive ? (
                                    <div className="h-1/2 flex items-end">
                                      <div
                                        className="w-full bg-blue-600 group-hover:bg-cyan-400 rounded-t-xs transition-all"
                                        style={{ height: `${heightPct}%` }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-1/2 flex items-start">
                                      <div
                                        className="w-full bg-red-500 group-hover:bg-red-400 rounded-b-xs transition-all"
                                        style={{ height: `${heightPct}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <span>0&apos; Kick-Off</span>
                          <span>45&apos; HT</span>
                          <span>90&apos; Full-Time</span>
                        </div>
                      </div>
                    )}

                    {/* Sofascore Dual-Bar Comparison */}
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

                    {/* // REFACTOR: Pencetak Gol & Kontributor Laga Resmi Terverifikasi */}
                    {currentFixture.detailedEvents &&
                      currentFixture.detailedEvents.filter((ev) => ev.type === 'goal').length > 0 && (
                        <div
                          className={`p-3.5 rounded-2xl border space-y-2.5 ${
                            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 text-xs font-black">
                              <Target className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                              <span>Pencetak Gol Pertandingan Ini</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {currentFixture.detailedEvents.filter((ev) => ev.type === 'goal').length} Gol Tercipta
                            </span>
                          </div>

                          <div className="space-y-2">
                            {currentFixture.detailedEvents
                              .filter((ev) => ev.type === 'goal')
                              .map((ev, gIdx) => {
                                const matchedPersib = players.find(
                                  (p) =>
                                    ev.player.toLowerCase().includes(p.name.toLowerCase()) ||
                                    p.name.toLowerCase().includes(ev.player.toLowerCase())
                                );
                                const matchedOpp = opponentSquadData.startingXI
                                  .concat(opponentSquadData.substitutes)
                                  .find(
                                    (op) =>
                                      ev.player.toLowerCase().includes(op.name.toLowerCase()) ||
                                      op.name.toLowerCase().includes(ev.player.toLowerCase())
                                  );
                                const targetPlayerObj: Player | null = matchedPersib
                                  ? matchedPersib
                                  : matchedOpp
                                  ? convertOpponentPlayerToPlayer(matchedOpp, opponentTeamName)
                                  : null;

                                const matchedAssistPersib = ev.assistBy
                                  ? players.find(
                                      (p) =>
                                        ev.assistBy?.toLowerCase().includes(p.name.toLowerCase()) ||
                                        p.name.toLowerCase().includes(ev.assistBy?.toLowerCase() || '')
                                    )
                                  : null;
                                const matchedAssistOpp = ev.assistBy
                                  ? opponentSquadData.startingXI
                                    .concat(opponentSquadData.substitutes)
                                    .find(
                                      (op) =>
                                        ev.assistBy?.toLowerCase().includes(op.name.toLowerCase()) ||
                                        op.name.toLowerCase().includes(ev.assistBy?.toLowerCase() || '')
                                    )
                                  : null;
                                const assistPlayerObj: Player | null = matchedAssistPersib
                                  ? matchedAssistPersib
                                  : matchedAssistOpp
                                  ? convertOpponentPlayerToPlayer(matchedAssistOpp, opponentTeamName)
                                  : null;

                                return (
                                  <div
                                    key={gIdx}
                                    onClick={() => {
                                      if (targetPlayerObj) setSelectedPlayer(targetPlayerObj);
                                    }}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                                      targetPlayerObj ? 'cursor-pointer active:scale-[0.99]' : ''
                                    } ${
                                      ev.team === 'home'
                                        ? isPro
                                          ? 'bg-blue-950/30 border-blue-900/50'
                                          : 'bg-blue-50/60 border-blue-100'
                                        : isPro
                                        ? 'bg-slate-900 border-slate-800'
                                        : 'bg-slate-50 border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="font-mono font-black text-[10px] px-2 py-0.5 rounded-lg bg-blue-600 text-white shrink-0">
                                        {ev.minute}
                                      </span>
                                      <PlayerAvatar
                                        name={targetPlayerObj ? targetPlayerObj.name : ev.player}
                                        avatarUrl={targetPlayerObj?.avatarUrl}
                                        number={targetPlayerObj?.number}
                                        size="sm"
                                      />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-black text-xs truncate">
                                            {ev.player}
                                          </span>
                                          {targetPlayerObj && (
                                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                                              #{targetPlayerObj.number}
                                            </span>
                                          )}
                                        </div>
                                        {ev.detail && (
                                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                            {ev.detail}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {ev.assistBy && (
                                      <div className="flex items-center gap-1.5 shrink-0 text-right">
                                        <div className="min-w-0 hidden sm:block">
                                          <span className="text-[8px] text-slate-400 font-mono block uppercase">
                                            Assist
                                          </span>
                                          <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 truncate">
                                            {ev.assistBy}
                                          </span>
                                        </div>
                                        <PlayerAvatar
                                          name={assistPlayerObj ? assistPlayerObj.name : ev.assistBy}
                                          avatarUrl={assistPlayerObj?.avatarUrl}
                                          number={assistPlayerObj?.number}
                                          size="xs"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                    {/* // REFACTOR: Akumulasi Top Skor & Top Assist Resmi Musim 2026/2027 */}
                    <div
                      className={`p-3.5 rounded-2xl border space-y-3 ${
                        isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs font-black">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          <span>Papan Peringkat Gol & Assist Klub 2026/2027</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>PT LIB & AFC Valid</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Top Skor Card */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-1.5 ${
                            isPro ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block pb-1 border-b border-slate-200 dark:border-slate-800">
                            ⚽ Top Skor (Semua Ajang)
                          </span>
                          <div className="space-y-1 pt-0.5">
                            {[
                              { name: 'Balša Sekulić', count: 8, num: 99 },
                              { name: 'Mariano Peralta', count: 5, num: 10 },
                              { name: 'Luka Menalo', count: 4, num: 9 },
                              { name: 'Marc Klok', count: 1, num: 23 },
                              { name: 'Beckham Putra', count: 1, num: 7 },
                              { name: 'Adam Alis', count: 1, num: 18 },
                              { name: 'Uilliam Barros', count: 1, num: 94 },
                              { name: 'Berguinho', count: 1, num: 97 },
                            ].slice(0, 4).map((p, pI) => (
                              <div key={pI} className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold truncate text-slate-800 dark:text-slate-200">
                                  {pI + 1}. {p.name}
                                </span>
                                <span className="font-mono font-black text-blue-600 dark:text-cyan-400 shrink-0">
                                  {p.count} Gol
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Assist Card */}
                        <div
                          className={`p-2.5 rounded-xl border space-y-1.5 ${
                            isPro ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <span className="text-[9px] font-mono font-bold uppercase text-slate-400 block pb-1 border-b border-slate-200 dark:border-slate-800">
                            👟 Top Assist (Semua Ajang)
                          </span>
                          <div className="space-y-1 pt-0.5">
                            {[
                              { name: 'Thom Haye', count: 6, num: 33 },
                              { name: 'Marc Klok', count: 4, num: 23 },
                              { name: 'Eliano Reijnders', count: 3, num: 2 },
                              { name: 'Beckham Putra', count: 3, num: 7 },
                              { name: 'Mariano Peralta', count: 2, num: 10 },
                            ].slice(0, 4).map((p, pI) => (
                              <div key={pI} className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold truncate text-slate-800 dark:text-slate-200">
                                  {pI + 1}. {p.name}
                                </span>
                                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                  {p.count} Ast
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: Tactical Highlights & Knowledge Notes */}
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
                    (selectedFixtureId ? selectedFixtureId === fix.id : currentFixture.id === fix.id)
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
        selectedClubForIntel ? (
          <ClubIntelligenceView
            profile={getClubProfile(
              selectedClubForIntel,
              liga1Standings.find((r: LeagueStandingRow) => r.team === selectedClubForIntel)
            )}
            standingRow={liga1Standings.find((r: LeagueStandingRow) => r.team === selectedClubForIntel)}
            onBack={() => setSelectedClubForIntel(null)}
          />
        ) : (
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
                  Grup E • AFC Champions League Two
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
                    Rekor Sempurna 100% Menang ({persibAclTeam?.played ?? 4} Laga, {persibAclTeam?.points ?? 12} Poin)
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{persibAclTeam?.points ?? 12}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-blue-900/40 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Main</span>
                  <span className="font-mono font-bold text-xs">{persibAclTeam?.played ?? 4} Laga</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">{persibAclTeam?.gf ?? 8} : {persibAclTeam?.ga ?? 1}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+{((persibAclTeam?.gf ?? 8) - (persibAclTeam?.ga ?? 1))}</span>
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
                    Menang 6-0 vs Shan United & 3-1 vs Port FC (Rekor Sempurna 100%)
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-orange-600 dark:text-orange-400">{persibShopeeTeam?.points ?? 6}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-orange-900/40 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Main</span>
                  <span className="font-mono font-bold text-xs">{persibShopeeTeam?.played ?? 2} Laga</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">{persibShopeeTeam?.gf ?? 9} : {persibShopeeTeam?.ga ?? 1}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+{((persibShopeeTeam?.gf ?? 9) - (persibShopeeTeam?.ga ?? 1))}</span>
                </div>
              </div>
            </div>
          )}

          {activeTournament === 'liga1' && persibStanding && (
            <div
              className={`p-5 rounded-3xl border shadow-lg ${
                isPro
                  ? 'bg-gradient-to-br from-blue-900/30 via-[#121620] to-[#0E1118] border-slate-800'
                  : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-blue-400">
                  Super League 2026/27 • Pekan {persibStanding.played} Terkini
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-white text-[9px] font-black uppercase tracking-wider">
                  Peringkat #{persibStanding.rank} (Championship Zone)
                </span>
              </div>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <h4 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                    PERSIB Bandung
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                    Hanya terpaut 4 poin dari pemuncak klasemen (Dewa United 20 Poin)
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-blue-600 dark:text-cyan-400">{persibStanding.points}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">Poin</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-center text-[10px]">
                <div>
                  <span className="block text-slate-400 font-medium">Rekor Laga</span>
                  <span className="font-mono font-bold text-xs">{persibStanding.won}M - {persibStanding.drawn}S - {persibStanding.lost}K</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Gol (GF:GA)</span>
                  <span className="font-mono font-bold text-xs">{persibStanding.gf} : {persibStanding.ga}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">
                    {persibStanding.gd > 0 ? `+${persibStanding.gd}` : persibStanding.gd}
                  </span>
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
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-600 dark:text-cyan-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                <Users className="w-3 h-3" /> Ketuk Klub: Profil & Scouting
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
                          onClick={() => setSelectedClubForIntel(team.name)}
                          className={`border-b transition-colors cursor-pointer hover:bg-blue-500/10 active:scale-[0.99] select-none group ${
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
                              <span className="truncate group-hover:text-blue-500 dark:group-hover:text-cyan-300 transition-colors">
                                {team.name}
                              </span>
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
                        onClick={() => setSelectedClubForIntel(row.team)}
                        className={`border-b transition-colors cursor-pointer hover:bg-blue-500/10 active:scale-[0.99] select-none group ${
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
                            <span className="truncate group-hover:text-blue-500 dark:group-hover:text-cyan-300 transition-colors">
                              {row.team}
                            </span>
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
      )
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
            {/* 3-Way Tactical Mode Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-3 text-center">
              <button
                type="button"
                onClick={() => setTaktikClashMode('dual')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all ${
                  taktikClashMode === 'dual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ⚡ Bentrok Dual Formasi
              </button>
              <button
                type="button"
                onClick={() => setTaktikClashMode('persib')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all ${
                  taktikClashMode === 'persib'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔵 Persib 4-2-3-1
              </button>
              <button
                type="button"
                onClick={() => setTaktikClashMode('opponent')}
                className={`py-2 px-1 rounded-xl text-[10px] font-black transition-all truncate ${
                  taktikClashMode === 'opponent'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔴 {opponentTeamName}
              </button>
            </div>

            {/* Header Formasi & Telemetry */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight text-slate-950 dark:text-white whitespace-nowrap">
                    {taktikClashMode === 'dual'
                      ? `Bentrok Taktikal: Persib (4-2-3-1) vs ${opponentTeamName} (${opponentProfile.preferredFormation})`
                      : taktikClashMode === 'opponent'
                      ? `Formasi ${opponentTeamName}: ${opponentProfile.preferredFormation}`
                      : 'Formasi Visual 4-2-3-1 Persib Bandung'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-600/30 text-blue-700 dark:text-cyan-300 font-mono text-[9px] font-black uppercase whitespace-nowrap">
                    {taktikClashMode === 'opponent' ? opponentProfile.headCoach : 'Igor Tolic'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {taktikClashMode === 'dual'
                    ? 'Konfrontasi spasial 22 pemain utama dengan verified avatar transfermarkt & klub'
                    : 'Posisi spasial & pergerakan taktis real-time per detik'}
                </p>
              </div>

              {/* Tactical Phase Telemetry Badge */}
              {taktikClashMode === 'persib' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400" />
                  <span>Fase {activeTacticalStep}/3</span>
                </div>
              )}
            </div>

            {/* Tactical Phase Selector Tabs (Only when Persib formation mode) */}
            {taktikClashMode === 'persib' && (
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
            )}

            {/* Tactical Phase Briefing Card */}
            {taktikClashMode === 'persib' && (
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
            )}

            {/* 2D Green Football Pitch Canvas */}
            <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-950 border-2 border-emerald-500/50 overflow-hidden shadow-inner select-none">
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
              <div className="absolute inset-2 border border-white/30 rounded-xl pointer-events-none" />
              <div className="absolute top-1/2 left-2 right-2 h-[1px] bg-white/30 pointer-events-none" />
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

              {/* Watermarks */}
              <div className="absolute top-4 left-4 text-[10px] font-mono font-black text-white/40 tracking-wider uppercase pointer-events-none">
                {opponentTeamName} ({opponentProfile.preferredFormation})
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-mono font-black text-cyan-300/40 tracking-wider uppercase pointer-events-none">
                PERSIB BANDUNG (4-2-3-1)
              </div>

              {/* Animated or Centered Football ⚽ */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out z-20 pointer-events-none"
                style={{
                  bottom: taktikClashMode === 'persib' && currentTacticalPhase.ballPos ? `${currentTacticalPhase.ballPos.x}%` : '50%',
                  left: taktikClashMode === 'persib' && currentTacticalPhase.ballPos ? `${currentTacticalPhase.ballPos.y}%` : '50%',
                }}
              >
                <span className="inline-block text-base filter drop-shadow-md animate-bounce">
                  ⚽
                </span>
              </div>

              {/* Opponent Starting XI Nodes (Upper Half) */}
              {(taktikClashMode === 'dual' || taktikClashMode === 'opponent') &&
                opponentSquadData.startingXI.map((opp) => {
                  const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                  const posX = opp.pitchX !== undefined ? opp.pitchX : 75;
                  const posY = opp.pitchY !== undefined ? opp.pitchY : 50;

                  return (
                    <div
                      key={opp.id}
                      onClick={() => setSelectedPlayer(oppAsPlayer)}
                      style={{ bottom: `${posX}%`, left: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform active:scale-90"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full border-2 border-red-500 overflow-hidden shadow-lg bg-slate-900 group-hover:scale-110 transition-transform">
                          <img
                            src={opp.avatarUrl}
                            alt={opp.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                opp.name
                              )}&background=dc2626&color=ffffff&bold=true`;
                            }}
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono font-black text-[8px] flex items-center justify-center border border-white">
                          {opp.number}
                        </span>
                      </div>
                      <span className="mt-0.5 px-1.5 py-0.2 rounded bg-black/75 backdrop-blur-xs text-[8px] font-bold text-white whitespace-nowrap shadow-xs">
                        {opp.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  );
                })}

              {/* Persib 11 Starting Players Position Nodes */}
              {(taktikClashMode === 'dual' || taktikClashMode === 'persib') &&
                (currentTacticalPhase.playerPositions && currentTacticalPhase.playerPositions.length > 0
                  ? currentTacticalPhase.playerPositions
                  : [
                      { id: 'p-gk', name: 'Teja Paku Alam', number: 14, role: 'GK', x: 8, y: 50 },
                      { id: 'p-rb', name: 'Sandy Walsh', number: 6, role: 'RB', x: 20, y: 82 },
                      { id: 'p-cb1', name: 'Patricio Matricardi', number: 4, role: 'CB', x: 16, y: 62 },
                      { id: 'p-cb2', name: 'Gabriel Mutombo', number: 3, role: 'CB', x: 16, y: 38 },
                      { id: 'p-lb', name: 'Eliano Reijnders', number: 2, role: 'LB', x: 20, y: 18 },
                      { id: 'p-dm1', name: 'Thom Haye', number: 33, role: 'DM', x: 30, y: 60 },
                      { id: 'p-dm2', name: 'Marc Klok', number: 23, role: 'DM', x: 30, y: 40 },
                      { id: 'p-rw', name: 'Mariano Peralta', number: 10, role: 'RW', x: 42, y: 82 },
                      { id: 'p-am', name: 'Luciano Guaycochea', number: 8, role: 'AM', x: 40, y: 50 },
                      { id: 'p-lw', name: 'Ragnar Oratmangoen', number: 77, role: 'LW', x: 42, y: 18 },
                      { id: 'p-cf', name: 'Balša Sekulić', number: 99, role: 'CF', x: 47, y: 50 },
                    ]
                ).map((pos) => {
                  const fullPlayer = players.find(
                    (p) => p.number === pos.number || p.name.toLowerCase().includes(pos.name.toLowerCase())
                  );

                  return (
                    <TacticalPlayerNode
                      key={pos.id}
                      pos={pos}
                      fullPlayer={fullPlayer}
                      onSelectPlayer={setSelectedPlayer}
                    />
                  );
                })}
            </div>

            <div className="mt-2.5 text-center">
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                💡 Ketuk foto pemain mana pun di lapangan untuk membuka lembar analisis mendalam
              </span>
            </div>
          </div>

          {/* Skuad Lawan (Starting XI & Substitutes) Card when in dual or opponent mode */}
          {(taktikClashMode === 'dual' || taktikClashMode === 'opponent') && (
            <div
              className={`rounded-[32px] border p-5 shadow-xl transition-all ${
                isPro
                  ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                  : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black tracking-tight text-red-500">
                    Daftar Skuad Resmi: {opponentTeamName}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pelatih: <strong className="text-red-400">{opponentProfile.headCoach}</strong> • Formasi: {opponentProfile.preferredFormation}
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-black">
                  Nilai Skuad {opponentProfile.squadMarketValue}
                </span>
              </div>

              <div className="space-y-4">
                {/* Starting XI Section */}
                <div>
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-red-500 flex items-center justify-between">
                    <span>11 Pemain Pertama (Starting XI)</span>
                    <span className="text-emerald-500 font-bold">Terverifikasi Kick-Off</span>
                  </h4>
                  <div className="space-y-2">
                    {opponentSquadData.startingXI.map((opp) => {
                      const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                      return (
                        <div
                          key={opp.id}
                          onClick={() => setSelectedPlayer(oppAsPlayer)}
                          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                            isPro
                              ? 'bg-slate-900/80 border-slate-800 hover:border-red-500/50'
                              : 'bg-slate-50 border-slate-200 hover:border-red-500 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PlayerAvatar
                              name={opp.name}
                              number={opp.number}
                              avatarUrl={opp.avatarUrl}
                              position={opp.position.includes('GK') ? 'GK' : opp.position.includes('DF') ? 'DF' : opp.position.includes('MF') ? 'MF' : 'FW'}
                              isStarting={true}
                              size="md"
                            />
                            <div>
                              <div className="text-xs font-black">{opp.name}</div>
                              <div className="text-[10px] text-slate-400 font-medium">
                                <span className="font-mono font-bold text-red-500">
                                  {opp.position}
                                </span>{' '}
                                • {opp.nationality} • {opp.tacticalRole || opp.marketValue}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-emerald-500 font-bold">
                              {opp.fitnessPercentage || 100}% Fit
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Opponent Substitutes Section */}
                {opponentSquadData.substitutes.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-slate-400">
                      Pemain Cadangan & Rotasi ({opponentSquadData.substitutes.length} Pemain)
                    </h4>
                    <div className="space-y-2">
                      {opponentSquadData.substitutes.map((opp) => {
                        const oppAsPlayer = convertOpponentPlayerToPlayer(opp, opponentTeamName);
                        return (
                          <div
                            key={opp.id}
                            onClick={() => setSelectedPlayer(oppAsPlayer)}
                            className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                              isPro
                                ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <PlayerAvatar
                                name={opp.name}
                                number={opp.number}
                                avatarUrl={opp.avatarUrl}
                                position={opp.position.includes('GK') ? 'GK' : opp.position.includes('DF') ? 'DF' : opp.position.includes('MF') ? 'MF' : 'FW'}
                                isStarting={false}
                                size="md"
                              />
                              <div>
                                <div className="text-xs font-bold">{opp.name}</div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  <span className="font-mono font-bold text-slate-500">{opp.position}</span> •{' '}
                                  {opp.nationality}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-emerald-500 font-bold">
                                {opp.fitnessPercentage || 100}% Fit
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 11 Pemain Pertama (Starting XI) & Substitutes Card (Persib) */}
          {(taktikClashMode === 'dual' || taktikClashMode === 'persib') && (
            <div
              className={`rounded-[32px] border p-5 shadow-xl transition-all ${
                isPro
                  ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
                  : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
              }`}
            >
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-black tracking-tight text-blue-600 dark:text-cyan-400">Daftar Skuad & Rating Fisik: PERSIB BANDUNG</h3>
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
          )}
        </div>
      )}
    </div>
  );
}
