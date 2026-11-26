'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
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
  Award,
  Crown,
  Globe,
  Shield,
} from 'lucide-react';
import {
  MatchFixture,
  Player,
  LeagueStandingRow,
  GroupTeam,
  TacticalPlayerPos,
  TacticalDuelMatchup,
  TopScorerEntry,
} from '@/types/club';
import {
  getClubLogo,
  getPlayerAvatar,
  getClubProfile,
  getOpponentSquad,
  convertOpponentPlayerToPlayer,
  TOP_SCORERS_2026_2027,
  OFFICIAL_SQUAD_2026_2027,
} from '@/data/persib-data';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { ClubIntelligenceView } from './ClubIntelligenceView';
import { isFixtureTodayWib, isFixtureInFuture } from '@/lib/groq';

function playerMatchesScorer(playerName: string, scorers: Set<string>): boolean {
  if (!playerName || scorers.size === 0) return false;
  const clean = playerName.toLowerCase().trim();
  if (scorers.has(clean)) return true;
  for (const s of scorers) {
    if (clean.includes(s) || s.includes(clean)) return true;
  }
  return false;
}

// Helper to parse round and extra tag (e.g. "Pekan 10 (Laga Kandang - Super Big Match)" -> main: "Pekan 10 (Laga Kandang)", subBadge: "Super Big Match")
function parseRoundAndExtra(raw: string): { mainText: string; subBadge: string | null } {
  if (!raw) return { mainText: '', subBadge: null };

  if (/super big match/i.test(raw)) {
    const cleaned = raw
      .replace(/\s*-\s*super big match[a-z0-9\s]*/i, '')
      .replace(/super big match[a-z0-9\s]*/i, '')
      .replace(/\(\s*\)/g, '')
      .trim();
    const match = raw.match(/super big match[a-z0-9\s]*/i);
    const badge = match ? match[0].trim() : 'Super Big Match';
    return {
      mainText: cleaned.replace(/\s+-\s*$/, '').trim(),
      subBadge: badge,
    };
  }

  if (/big match/i.test(raw)) {
    const cleaned = raw
      .replace(/\s*-\s*big match[a-z0-9\s]*/i, '')
      .replace(/big match[a-z0-9\s]*/i, '')
      .replace(/\(\s*\)/g, '')
      .trim();
    const match = raw.match(/big match[a-z0-9\s]*/i);
    const badge = match ? match[0].trim() : 'Big Match';
    return {
      mainText: cleaned.replace(/\s+-\s*$/, '').trim(),
      subBadge: badge,
    };
  }

  const parenMatch = raw.match(/^([^(]+)\(([^)]+)\)$/);
  if (parenMatch) {
    const roundPrefix = parenMatch[1].trim();
    const inside = parenMatch[2].trim();
    if (inside.includes(' - ')) {
      const parts = inside.split(' - ');
      return {
        mainText: `${roundPrefix} (${parts[0].trim()})`,
        subBadge: parts.slice(1).join(' - ').trim(),
      };
    }
  }

  return { mainText: raw, subBadge: null };
}

// Compact, elegant date format for mobile cards to prevent text wrapping or truncation
function formatCardDate(dateStr: string, timeStr: string): string {
  if (!dateStr) return timeStr || '';
  const shortDate = dateStr
    .replace('Januari', 'Jan')
    .replace('Februari', 'Feb')
    .replace('Maret', 'Mar')
    .replace('April', 'Apr')
    .replace('Mei', 'Mei')
    .replace('Juni', 'Jun')
    .replace('Juli', 'Jul')
    .replace('Agustus', 'Ags')
    .replace('September', 'Sep')
    .replace('Oktober', 'Okt')
    .replace('November', 'Nov')
    .replace('Desember', 'Des');

  const withoutYear = shortDate.replace(/\s+202[0-9]/, '').trim();
  return timeStr ? `${withoutYear} • ${timeStr}` : withoutYear;
}

// Simplifies long Indonesian stadium names to concise names that never truncate on mobile
function simplifyVenueName(venue: string): string {
  if (!venue) return '';
  if (venue.includes('Gelora Bandung Lautan Api') || venue.includes('GBLA')) {
    return 'Stadion GBLA, Bandung';
  }
  if (venue.includes('Si Jalak Harupat')) {
    return 'Stadion Si Jalak Harupat';
  }
  if (venue.includes('Indomilk Arena')) {
    return 'Indomilk Arena, Tangerang';
  }
  if (venue.includes('Gelora Bung Tomo') || venue.includes('GBT')) {
    return 'Gelora Bung Tomo, Surabaya';
  }
  if (venue.includes('Kapten I Wayan Dipta')) {
    return 'Stadion Dipta, Gianyar';
  }
  if (venue.includes('Jalan Besar')) {
    return 'Jalan Besar Stadium, Singapura';
  }
  if (venue.includes('Sultan Ibrahim')) {
    return 'Sultan Ibrahim Stadium, JDT';
  }
  return venue;
}

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
  hasScored,
}: {
  pos: TacticalPlayerPos;
  fullPlayer?: Player;
  onSelectPlayer: (player: Player) => void;
  hasScored?: boolean;
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
        {/* Goal Indicator Pill if Scored in Live Match */}
        {hasScored && (
          <span className="absolute -top-2 -left-1 text-[11px] filter drop-shadow-md z-20 animate-bounce">
            ⚽
          </span>
        )}

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
    topScorers,
  } = useClubTracker();
  const isPro = mode === 'pro';
  const activeTopScorers = topScorers || TOP_SCORERS_2026_2027;

  // Sub-Page Navigation Tabs: Laga (featured), Jadwal (schedule), Klasemen (standings), Taktik (lineup), Top Skor (scorers)
  const [matchViewTab, setMatchViewTab] = useState<'featured' | 'schedule' | 'standings' | 'lineup' | 'scorers'>('featured');
  const [scorerTournamentFilter, setScorerTournamentFilter] = useState<'liga1' | 'acl2' | 'shopee'>('liga1');
  const [scorerScopeFilter, setScorerScopeFilter] = useState<'all' | 'persib'>('all');
  // REFACTOR: Decouple from hardcoded 'l1-p8' string. Null allows dynamic auto-selection of active/latest match
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  // Minimize & Density controls to prevent mobile scrolling fatigue
  const [isScheduleMinimized, setIsScheduleMinimized] = useState<boolean>(true);
  const [scheduleViewDensity, setScheduleViewDensity] = useState<'compact' | 'full'>('full');
  const [isStandingsMinimized, setIsStandingsMinimized] = useState<boolean>(true);
  // REFACTOR: AAA-grade expanded match center tabs with opponent squad, tactical duels, spatial pitch, and momentum
  const [heroDetailTab, setHeroDetailTab] = useState<'events' | 'lineups' | 'duels' | 'pitch' | 'stats' | 'highlights'>('events');
  const [selectedClubForIntel, setSelectedClubForIntel] = useState<string | null>(null);
  const [selectedMomentumIdx, setSelectedMomentumIdx] = useState<number | null>(null);
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
      description: 'Thom Haye turun menjemput bola di antara bek tengah Mutombo & Matricardi.',
      ballPos: { x: 34, y: 50 },
      playerPositions: [],
    };

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  const globalTodayMatch = fixtures.find((f) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
  const todayFixtureInTournament = tournamentFixtures.find((f) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
  const latestFinishedInTournament = [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED');
  const nextScheduledInTournament = tournamentFixtures.find((f) => f.status === 'SCHEDULED' && !isFixtureTodayWib(f.date));

  // Dynamic tournament-aware resolution: selected -> LIVE -> today's match -> latest finished -> next scheduled
  const currentFixture: MatchFixture =
    (selectedFixtureId ? tournamentFixtures.find((f: MatchFixture) => f.id === selectedFixtureId) : null) ||
    tournamentFixtures.find((f) => f.status === 'LIVE') ||
    todayFixtureInTournament ||
    latestFinishedInTournament ||
    nextScheduledInTournament ||
    tournamentFixtures[0] ||
    fixtures[0];

  const filteredSchedule = tournamentFixtures.filter((fix) => {
    if (scheduleFilter === 'upcoming') return fix.status === 'SCHEDULED' || fix.status === 'LIVE';
    if (scheduleFilter === 'finished') return fix.status === 'FINISHED';
    return true;
  });

  // Dynamic minimized slice centering around active match or top matches to eliminate scroll fatigue
  const displayedSchedule = React.useMemo(() => {
    if (!isScheduleMinimized) {
      return filteredSchedule;
    }
    if (scheduleFilter === 'all') {
      const activeIdx = filteredSchedule.findIndex((f) => f.id === currentFixture.id);
      if (activeIdx !== -1) {
        const start = Math.max(0, activeIdx - 2);
        return filteredSchedule.slice(start, start + 6);
      }
      return filteredSchedule.slice(0, 6);
    }
    if (scheduleFilter === 'finished') {
      return filteredSchedule.slice(-5);
    }
    if (scheduleFilter === 'upcoming') {
      return filteredSchedule.slice(0, 5);
    }
    return filteredSchedule.slice(0, 6);
  }, [filteredSchedule, isScheduleMinimized, scheduleFilter, currentFixture.id]);

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

  // Dynamic set of goal scorers in active match for 2D tactical pitch highlight
  const matchScorers = useMemo(() => {
    const list = new Set<string>();
    if (currentFixture.detailedEvents) {
      for (const ev of currentFixture.detailedEvents) {
        if (ev.type === 'goal' && ev.player) {
          list.add(ev.player.toLowerCase().trim());
        }
      }
    }
    return list;
  }, [currentFixture.detailedEvents]);

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
            <h2 className={`text-base sm:text-lg font-black tracking-tight uppercase ${isPro ? 'text-white' : 'text-slate-950'}`}>
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

        {/* Real-time Matchday Quick-Jump Alert when a match is active/today in another tournament */}
        {globalTodayMatch && globalTodayMatch.tournamentKey !== activeTournament && (
          <button
            type="button"
            onClick={() => {
              setActiveTournament(globalTodayMatch.tournamentKey);
              setSelectedFixtureId(globalTodayMatch.id);
            }}
            className="w-full mt-2 p-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 flex items-center justify-between text-left transition-all active:scale-98"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">
                Laga Hari Ini ({globalTodayMatch.tournamentKey.toUpperCase()}): {globalTodayMatch.homeTeam} vs {globalTodayMatch.awayTeam} ({globalTodayMatch.time})
              </span>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 shrink-0 flex items-center">
              Lihat <ChevronRight className="w-3 h-3" />
            </span>
          </button>
        )}
      </div>

      {/* 2. Structured Sub-Page Navigation Tabs (5-Column Responsive Grid - Zero Truncation Mobile) */}
      <div
        className={`p-1 rounded-2xl border grid grid-cols-5 gap-0.5 sm:gap-1 text-xs font-bold ${
          isPro
            ? 'bg-[#121620] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600 shadow-xs'
        }`}
      >
        <button
          onClick={() => setMatchViewTab('featured')}
          className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
            matchViewTab === 'featured'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-tight leading-none">Laga</span>
        </button>

        <button
          onClick={() => setMatchViewTab('schedule')}
          className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
            matchViewTab === 'schedule'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-tight leading-none">Jadwal</span>
        </button>

        <button
          onClick={() => {
            setMatchViewTab('standings');
            setSelectedClubForIntel(null);
          }}
          className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
            matchViewTab === 'standings'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-tight leading-none">Klasemen</span>
        </button>

        <button
          onClick={() => setMatchViewTab('lineup')}
          className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
            matchViewTab === 'lineup'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-tight leading-none">Taktik</span>
        </button>

        <button
          onClick={() => setMatchViewTab('scorers')}
          className={`py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-xl transition-all text-center flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 ${
            matchViewTab === 'scorers'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <span className="text-[9.5px] sm:text-[11px] font-extrabold tracking-tight leading-none">Top Skor</span>
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
              <div className="flex items-start justify-between gap-2 text-[10px] font-bold uppercase tracking-wider mb-4">
                <span className="text-slate-400 font-mono text-[9px] sm:text-[10px] whitespace-nowrap shrink-0 mt-0.5">
                  {currentFixture.tournament}
                </span>
                {(() => {
                  const heroParsed = parseRoundAndExtra(currentFixture.roundOrWeek);
                  return (
                    <div className="flex flex-col items-end gap-1 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-cyan-300 font-extrabold text-[9px] sm:text-[9.5px] whitespace-nowrap text-right">
                        {heroParsed.mainText}
                      </span>
                      {heroParsed.subBadge && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-black text-[8.5px] uppercase tracking-wider whitespace-nowrap">
                          🔥 {heroParsed.subBadge}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {(() => {
                const isStrictlyFuture = isFixtureInFuture(currentFixture.date, currentFixture.time);

                const isHeroLive =
                  !isStrictlyFuture &&
                  (currentFixture.status === 'LIVE' ||
                    (!['FINISHED', 'SCHEDULED'].includes(currentFixture.status) &&
                      (currentFixture.roundOrWeek.toLowerCase().includes('live') ||
                        currentFixture.time?.includes("'") ||
                        currentFixture.time?.toLowerCase().includes('ht') ||
                        currentFixture.time?.toLowerCase().includes('jeda') ||
                        currentFixture.time?.toLowerCase().includes('babak'))));

                const isHeroFinished =
                  !isStrictlyFuture &&
                  (currentFixture.status === 'FINISHED' ||
                    (currentFixture.status !== 'SCHEDULED' &&
                      (currentFixture.time?.toLowerCase().includes('ft') ||
                        currentFixture.time?.toLowerCase().includes('full time') ||
                        currentFixture.time?.toLowerCase().includes('selesai'))));

                const hasHeroScore =
                  !isStrictlyFuture &&
                  currentFixture.status !== 'SCHEDULED' &&
                  typeof currentFixture.homeScore === 'number' &&
                  typeof currentFixture.awayScore === 'number';

                const homeEvents =
                  currentFixture.detailedEvents?.filter(
                    (ev) => ev.team === 'home' && (ev.type === 'goal' || ev.type === 'red_card')
                  ) || [];

                const awayEvents =
                  currentFixture.detailedEvents?.filter(
                    (ev) => ev.team === 'away' && (ev.type === 'goal' || ev.type === 'red_card')
                  ) || [];

                const hasDetailedGoalOrCard = homeEvents.length > 0 || awayEvents.length > 0;
                const generalGoalEvents =
                  !hasDetailedGoalOrCard && currentFixture.events
                    ? currentFixture.events.filter((ev) => ev.type === 'goal' || ev.type === 'card')
                    : [];

                return (
                  <>
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

                      {/* Center: Live/Final Score or Circular VS Pill */}
                      <div className="flex flex-col items-center px-2 shrink-0">
                        {isHeroLive ? (
                          <>
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[8.5px] font-black uppercase tracking-wider mb-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>LIVE</span>
                            </div>
                            <div
                              className={`px-3.5 sm:px-4 py-1.5 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl font-mono tabular-nums shadow-md border ${
                                isPro
                                  ? 'bg-[#0E1118] border-red-500/40 text-white'
                                  : 'bg-white border-red-200 text-slate-950'
                              }`}
                            >
                              {currentFixture.homeScore ?? 0}
                              <span className="mx-1.5 text-red-500 text-base sm:text-lg">:</span>
                              {currentFixture.awayScore ?? 0}
                            </div>
                            <span className="text-[10px] font-mono font-extrabold text-red-500 mt-1.5 uppercase whitespace-nowrap">
                              {currentFixture.time}
                            </span>
                          </>
                        ) : isHeroFinished || hasHeroScore ? (
                          <>
                            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[8.5px] font-black uppercase tracking-wider mb-1.5 shadow-sm">
                              <span>{isHeroFinished ? 'FULL TIME' : 'SKOR'}</span>
                            </div>
                            <div
                              className={`px-3.5 sm:px-4 py-1.5 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl font-mono tabular-nums shadow-md border ${
                                isPro
                                  ? 'bg-[#0E1118] border-slate-700 text-cyan-300'
                                  : 'bg-white border-slate-200 text-slate-950'
                              }`}
                            >
                              {currentFixture.homeScore ?? 0}
                              <span className="mx-1.5 text-blue-500 text-base sm:text-lg">:</span>
                              {currentFixture.awayScore ?? 0}
                            </div>
                            <span className="text-[9.5px] font-mono font-bold text-slate-400 mt-1 uppercase whitespace-nowrap">
                              {isHeroFinished ? 'Selesai' : currentFixture.time}
                            </span>
                          </>
                        ) : (
                          <>
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
                              {currentFixture.time}
                            </span>
                          </>
                        )}
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

                    {/* Goal Scorers & Cards Strip (when LIVE, FINISHED, or has scores/events) */}
                    {(isHeroLive || isHeroFinished || hasHeroScore) && (
                      <>
                        {hasDetailedGoalOrCard ? (
                          <div
                            className={`mt-4 pt-3 border-t grid grid-cols-2 gap-3 text-[10.5px] ${
                              isPro ? 'border-slate-800/80 text-slate-300' : 'border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <div className="space-y-1 text-left">
                              {homeEvents.map((ev, idx) => (
                                <div key={idx} className="flex items-center gap-1 font-semibold leading-tight">
                                  <span>{ev.type === 'goal' ? '⚽' : '🟥'}</span>
                                  <span className="truncate">{ev.player}</span>
                                  <span className="font-mono text-[9.5px] text-blue-600 dark:text-cyan-400 font-bold shrink-0">
                                    {ev.minute}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-1 text-right">
                              {awayEvents.map((ev, idx) => (
                                <div key={idx} className="flex items-center justify-end gap-1 font-semibold leading-tight">
                                  <span className="font-mono text-[9.5px] text-rose-500 font-bold shrink-0">
                                    {ev.minute}
                                  </span>
                                  <span className="truncate">{ev.player}</span>
                                  <span>{ev.type === 'goal' ? '⚽' : '🟥'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : generalGoalEvents.length > 0 ? (
                          <div
                            className={`mt-4 pt-3 border-t space-y-1 text-[10.5px] ${
                              isPro ? 'border-slate-800/80 text-slate-300' : 'border-slate-200/80 text-slate-700'
                            }`}
                          >
                            {generalGoalEvents.map((ev, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 font-semibold text-xs leading-tight">
                                <span>{ev.type === 'goal' ? '⚽' : '🟨'}</span>
                                <span className="font-mono text-[9.5px] text-blue-500 font-bold">{ev.minute}</span>
                                <span className="truncate">{ev.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : currentFixture.scorers && currentFixture.scorers.length > 0 ? (
                          <div
                            className={`mt-4 pt-3 border-t flex flex-wrap items-center gap-2 text-[10.5px] ${
                              isPro ? 'border-slate-800/80 text-slate-300' : 'border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span className="font-bold text-slate-400 text-[10px]">⚽ Pencetak Gol:</span>
                            {currentFixture.scorers.map((sc: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-cyan-400 font-bold text-[10px]">
                                {sc}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </>
                );
              })()}
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
                {(() => {
                  const isStrictlyFuture = isFixtureInFuture(currentFixture.date, currentFixture.time);

                  const isHeroLive =
                    !isStrictlyFuture &&
                    (currentFixture.status === 'LIVE' ||
                      (!['FINISHED', 'SCHEDULED'].includes(currentFixture.status) &&
                        (currentFixture.roundOrWeek.toLowerCase().includes('live') ||
                          currentFixture.time?.includes("'") ||
                          currentFixture.time?.toLowerCase().includes('ht') ||
                          currentFixture.time?.toLowerCase().includes('jeda') ||
                          currentFixture.time?.toLowerCase().includes('babak'))));

                  const isHeroFinished =
                    !isStrictlyFuture &&
                    (currentFixture.status === 'FINISHED' ||
                      (currentFixture.status !== 'SCHEDULED' &&
                        (currentFixture.time?.toLowerCase().includes('ft') ||
                          currentFixture.time?.toLowerCase().includes('full time') ||
                          currentFixture.time?.toLowerCase().includes('selesai'))));

                  const hasHeroScore =
                    !isStrictlyFuture &&
                    currentFixture.status !== 'SCHEDULED' &&
                    typeof currentFixture.homeScore === 'number' &&
                    typeof currentFixture.awayScore === 'number';

                  return (
                    <>
                      <div className="shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider whitespace-nowrap">
                          {isHeroLive ? 'Skor Live' : isHeroFinished || hasHeroScore ? 'Skor Akhir' : 'Jadwal Kick-off'}
                        </span>
                        <div className="mt-0.5 whitespace-nowrap">
                          {isHeroLive ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-black font-mono text-red-500 dark:text-red-400 tabular-nums">
                                {currentFixture.homeScore ?? 0} : {currentFixture.awayScore ?? 0}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                • {currentFixture.time}
                              </span>
                            </div>
                          ) : isHeroFinished || hasHeroScore ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-cyan-400">
                                {currentFixture.homeScore ?? 0} : {currentFixture.awayScore ?? 0}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                                • {isHeroFinished ? 'Full Time' : currentFixture.time}
                              </span>
                            </div>
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
                          {isHeroLive || isHeroFinished || hasHeroScore ? 'Status Laga' : 'Tanggal Pertandingan'}
                        </span>
                        <div className="text-[11px] sm:text-xs font-bold mt-1 whitespace-nowrap">
                          {isHeroLive ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 font-extrabold text-[10px] whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                LIVE ({currentFixture.time})
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-400">{currentFixture.date}</span>
                            </div>
                          ) : isHeroFinished || hasHeroScore ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px] whitespace-nowrap">
                                FT (Selesai)
                              </span>
                              <span className="text-[9.5px] font-mono text-slate-400">{currentFixture.date}</span>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap">
                              {currentFixture.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Compact Live Stats Strip when LIVE or FINISHED */}
              {(currentFixture.status === 'LIVE' || currentFixture.status === 'FINISHED') && currentFixture.statsSummary && (
                <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-200 dark:border-slate-800/80 text-center text-[10px]">
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">Penguasaan</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                      {currentFixture.statsSummary.possession[0]}% - {currentFixture.statsSummary.possession[1]}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">On Target</span>
                    <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                      {currentFixture.statsSummary.shotsOnTarget[0]} - {currentFixture.statsSummary.shotsOnTarget[1]}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[9px] uppercase font-bold">Kartu Kuning</span>
                    <span className="font-mono font-extrabold text-amber-500">
                      🟨 {currentFixture.statsSummary.yellowCards[0]} - {currentFixture.statsSummary.yellowCards[1]}
                    </span>
                  </div>
                </div>
              )}

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
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar mb-3.5">
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('events')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'events'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>⚽ Gol & Kartu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('lineups')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'lineups'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>👥 Skuad & XI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('duels')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'duels'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>⚔️ Duel 1v1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('pitch')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'pitch'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>🗺️ Formasi 2D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('stats')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'stats'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>📊 Statistik</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeroDetailTab('highlights')}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[10.5px] font-black transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                      heroDetailTab === 'highlights'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>💡 Catatan</span>
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
                                    {player.disciplinary && player.disciplinary.status !== 'cleared' && (
                                      <div className="mt-1">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-tight ${
                                          player.disciplinary.status === 'red_card_suspended'
                                            ? activeTournament === 'liga1'
                                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                                              : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                        }`}>
                                          {player.disciplinary.status === 'red_card_suspended'
                                            ? activeTournament === 'liga1'
                                              ? '🟥 Sanksi KM (Absen P11 / Opsi Denda)'
                                              : '✅ Sah Tampil Asia (ACL Two)'
                                            : player.disciplinary.badgeText}
                                        </span>
                                      </div>
                                    )}
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
                            className={`w-full overflow-hidden p-3 sm:p-3.5 rounded-2xl border transition-all ${
                              isPro
                                ? 'bg-slate-900/60 border-slate-800'
                                : 'bg-slate-50/80 border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start sm:items-center justify-between gap-2 pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
                              <span className="text-xs font-black tracking-tight flex-1 min-w-0">{duel.title}</span>
                              <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-cyan-300 font-bold uppercase shrink-0 whitespace-nowrap">
                                {duel.zone}
                              </span>
                            </div>

                            {/* Dual Clash Fighters Visual */}
                            <div className="flex items-center justify-between gap-1.5 sm:gap-2 w-full min-w-0">
                              {/* Persib Fighter */}
                              <div
                                onClick={() => { if (matchedPersib) setSelectedPlayer(matchedPersib); }}
                                className={`flex-1 min-w-0 p-2 sm:p-2.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all overflow-hidden ${
                                  isPro ? 'bg-slate-900/90 border-blue-800/60 hover:border-cyan-400' : 'bg-white border-blue-200 hover:border-blue-400'
                                }`}
                              >
                                <PlayerAvatar
                                  name={duel.persibPlayer.name}
                                  avatarUrl={duel.persibPlayer.avatarUrl}
                                  number={duel.persibPlayer.number}
                                  position={duel.persibPlayer.position.includes('CB') || duel.persibPlayer.position.includes('DF') ? 'DF' : duel.persibPlayer.position.includes('MF') ? 'MF' : 'FW'}
                                  size="xs"
                                />
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="text-[11px] sm:text-xs font-black truncate leading-tight" title={duel.persibPlayer.name}>
                                    {duel.persibPlayer.name}
                                  </div>
                                  <div className="text-[9.5px] font-mono text-blue-600 dark:text-cyan-400 font-bold truncate mt-0.5">
                                    #{duel.persibPlayer.number} • {duel.persibPlayer.position}
                                  </div>
                                </div>
                              </div>

                              {/* VS Center Pillar */}
                              <div className="shrink-0 flex flex-col items-center px-0.5">
                                <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-[9px] text-slate-700 dark:text-slate-300 shadow-xs">
                                  VS
                                </span>
                              </div>

                              {/* Opponent Fighter */}
                              <div
                                onClick={() => { if (oppAsPlayer) setSelectedPlayer(oppAsPlayer); }}
                                className={`flex-1 min-w-0 p-2 sm:p-2.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all overflow-hidden ${
                                  isPro ? 'bg-slate-900/90 border-red-800/60 hover:border-red-400' : 'bg-white border-red-200 hover:border-red-400'
                                }`}
                              >
                                <PlayerAvatar
                                  name={duel.opponentPlayer.name}
                                  avatarUrl={duel.opponentPlayer.avatarUrl}
                                  number={duel.opponentPlayer.number}
                                  position={duel.opponentPlayer.position.includes('CB') || duel.opponentPlayer.position.includes('DF') ? 'DF' : duel.opponentPlayer.position.includes('MF') ? 'MF' : 'FW'}
                                  size="xs"
                                />
                                <div className="min-w-0 flex-1 overflow-hidden text-left">
                                  <div className="text-[11px] sm:text-xs font-black truncate leading-tight" title={duel.opponentPlayer.name}>
                                    {duel.opponentPlayer.name}
                                  </div>
                                  <div className="text-[9.5px] font-mono text-red-500 font-bold truncate mt-0.5">
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
                          const oppHasScored = playerMatchesScorer(opp.name, matchScorers);

                          return (
                            <div
                              key={opp.id}
                              onClick={() => setSelectedPlayer(oppAsPlayer)}
                              style={{ bottom: `${posX}%`, left: `${posY}%` }}
                              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform active:scale-90"
                            >
                              <div className="relative">
                                {oppHasScored && (
                                  <span className="absolute -top-2 -left-1 text-[11px] filter drop-shadow-md z-20 animate-bounce">
                                    ⚽
                                  </span>
                                )}
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
                              { id: 'p-lw', name: 'Luka Menalo', number: 9, role: 'LW', x: 42, y: 18 },
                              { id: 'p-cf', name: 'Balša Sekulić', number: 99, role: 'CF', x: 47, y: 50 },
                            ]
                        ).map((pos) => {
                          const fullPlayer = players.find(
                            (p) => p.number === pos.number || p.name.toLowerCase().includes(pos.name.toLowerCase())
                          );
                          const hasScored = playerMatchesScorer(pos.name, matchScorers);

                          return (
                            <TacticalPlayerNode
                              key={pos.id}
                              pos={pos}
                              fullPlayer={fullPlayer}
                              onSelectPlayer={setSelectedPlayer}
                              hasScored={hasScored}
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
                    {currentFixture.liveMomentumTimeline && currentFixture.liveMomentumTimeline.length > 0 && (() => {
                      const timeline = currentFixture.liveMomentumTimeline;
                      const activePoint =
                        (selectedMomentumIdx !== null && timeline[selectedMomentumIdx]) ||
                        timeline.find((p) => p.minute === 81) ||
                        timeline[timeline.length - 1];
                      const activeIdx = timeline.findIndex((p) => p.minute === activePoint?.minute);

                      // Calculate average pressure
                      const avgPersib = Math.round(
                        timeline.reduce((acc, curr) => acc + curr.persibPressure, 0) / timeline.length
                      );
                      const avgOpponent = 100 - avgPersib;

                      return (
                        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/75 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                          {/* Header Bar */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-black min-w-0">
                              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                              <span className="truncate">Momentum Laga</span>
                              <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 shrink-0">
                                90&apos;
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] font-mono font-bold shrink-0">
                              <span className="flex items-center gap-1 text-blue-600 dark:text-cyan-400">
                                <span className="w-2 h-2 rounded-full bg-blue-600" />
                                Persib {avgPersib}%
                              </span>
                              <span className="flex items-center gap-1 text-rose-500">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                {opponentTeamName} {avgOpponent}%
                              </span>
                            </div>
                          </div>

                          {/* Graphical Visual Zone Indicator */}
                          <div className="relative pt-6 pb-2">
                            {/* Visual Zone labels */}
                            <div className="absolute top-0 left-0 right-0 flex justify-between text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pointer-events-none px-1">
                              <span className="text-blue-500/80">▲ Dominasi PERSIB</span>
                              <span className="text-rose-500/80">▼ Tekanan Lawan</span>
                            </div>

                            {/* Momentum Bars Container */}
                            <div className="h-28 w-full flex items-center justify-between gap-1 border-y border-dashed border-slate-300 dark:border-slate-700/60 relative bg-slate-100/40 dark:bg-slate-950/40 rounded-xl px-1.5">
                              {/* Center Baseline Zero Line */}
                              <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-slate-300 dark:bg-slate-700 pointer-events-none z-0" />

                              {/* Half-time Divider Line at 45' */}
                              <div className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-[1px] bg-slate-300/60 dark:bg-slate-800 pointer-events-none z-0 flex flex-col justify-between items-center">
                                <span className="text-[7.5px] font-mono font-bold text-slate-400 -mt-2.5 bg-slate-50 dark:bg-slate-900 px-1 rounded">HT</span>
                              </div>

                              {timeline.map((pt, pIdx) => {
                                const diff = pt.persibPressure - pt.opponentPressure;
                                const isPositive = diff >= 0;
                                const heightPct = Math.min(100, Math.max(22, Math.abs(diff) * 1.2));
                                const isCurrentActive = pIdx === activeIdx;

                                const isGoal = pt.highlight && (pt.highlight.includes('Gol') || pt.highlight.includes('GOOOL'));
                                const isRedCard = pt.highlight && (pt.highlight.includes('Kartu Merah') || pt.highlight.includes('🟥'));

                                return (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => setSelectedMomentumIdx(pIdx)}
                                    title={`Menit ${pt.minute}': Persib ${pt.persibPressure}% vs ${opponentTeamName} ${pt.opponentPressure}%`}
                                    className={`flex-1 flex flex-col items-center justify-center h-full relative group cursor-pointer transition-transform active:scale-95 z-10 ${
                                      isCurrentActive ? 'scale-105' : 'hover:opacity-90'
                                    }`}
                                  >
                                    {/* Event Badge above or below bar */}
                                    {isGoal && (
                                      <span className="absolute -top-3 text-[10px] animate-bounce z-20 drop-shadow-md">
                                        ⚽
                                      </span>
                                    )}
                                    {isRedCard && (
                                      <span className="absolute -top-3 text-[10px] animate-pulse z-20 drop-shadow-md">
                                        🟥
                                      </span>
                                    )}

                                    {/* Bar Graphic with sophisticated styling */}
                                    <div className="h-full w-full flex flex-col justify-center items-center py-1">
                                      {isPositive ? (
                                        <div className="h-1/2 w-full flex items-end justify-center">
                                          <div
                                            className={`w-full max-w-[16px] rounded-t-md transition-all ${
                                              isCurrentActive
                                                ? 'bg-gradient-to-t from-blue-600 to-cyan-400 ring-2 ring-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                                                : 'bg-gradient-to-t from-blue-700 to-blue-500 group-hover:from-blue-600 group-hover:to-cyan-400'
                                            }`}
                                            style={{ height: `${heightPct}%` }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="h-1/2 w-full flex items-start justify-center">
                                          <div
                                            className={`w-full max-w-[16px] rounded-b-md transition-all ${
                                              isCurrentActive
                                                ? 'bg-gradient-to-b from-rose-600 to-red-400 ring-2 ring-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                                                : 'bg-gradient-to-b from-rose-600 to-red-600 group-hover:from-rose-500 group-hover:to-red-400'
                                            }`}
                                            style={{ height: `${heightPct}%` }}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    {/* Minute Marker Tick */}
                                    <span
                                      className={`text-[8.5px] font-mono font-bold mt-1 leading-none ${
                                        isCurrentActive
                                          ? 'text-cyan-400 font-black scale-110'
                                          : 'text-slate-400 group-hover:text-slate-200'
                                      }`}
                                    >
                                      {pt.minute}&apos;
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Interactive Tactical Insight Card for the selected minute */}
                          {activePoint && (
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-cyan-500/30 shadow-xs space-y-2 transition-all animate-fade-in">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                                  <span className="font-mono font-black text-xs text-slate-950 dark:text-cyan-300">
                                    Fase Menit {activePoint.minute}&apos;
                                  </span>
                                </div>
                                <span
                                  className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                                    activePoint.persibPressure >= 70
                                      ? 'bg-cyan-500/15 text-cyan-400 border-cyan-400/40'
                                      : activePoint.persibPressure > 50
                                      ? 'bg-blue-500/15 text-blue-400 border-blue-400/30'
                                      : activePoint.persibPressure === 50
                                      ? 'bg-slate-500/15 text-slate-400 border-slate-400/30'
                                      : 'bg-rose-500/15 text-rose-400 border-rose-400/40'
                                  }`}
                                >
                                  {activePoint.persibPressure >= 70
                                    ? '⚡ Dominasi Serangan Penuh'
                                    : activePoint.persibPressure > 50
                                    ? 'Persib Menguasai Lini'
                                    : activePoint.persibPressure === 50
                                    ? 'Duel Berimbang Netral'
                                    : 'Tekanan Serangan Lawan'}
                                </span>
                              </div>

                              {/* Dual Pressure Meter */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono font-bold">
                                  <span className="text-blue-600 dark:text-cyan-400">
                                    PERSIB {activePoint.persibPressure}%
                                  </span>
                                  <span className="text-rose-500">
                                    {opponentTeamName} {activePoint.opponentPressure}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                  <div
                                    className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-300"
                                    style={{ width: `${activePoint.persibPressure}%` }}
                                  />
                                  <div
                                    className="bg-gradient-to-r from-rose-500 to-red-600 h-full transition-all duration-300"
                                    style={{ width: `${activePoint.opponentPressure}%` }}
                                  />
                                </div>
                              </div>

                              {/* Tactical Narrative Callout */}
                              {activePoint.highlight && (
                                <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 font-medium pt-0.5">
                                  {activePoint.highlight}
                                </p>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-0.5 px-0.5">
                            <span>0&apos; Kick-Off</span>
                            <span>💡 Ketuk pilar menit untuk rincian taktik</span>
                            <span>90+&apos; Selesai</span>
                          </div>
                        </div>
                      );
                    })()}

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
                            {OFFICIAL_SQUAD_2026_2027
                              .filter((p) => (p.stats?.goals ?? 0) > 0)
                              .sort((a, b) => (b.stats?.goals ?? 0) - (a.stats?.goals ?? 0))
                              .slice(0, 4)
                              .map((p, pI) => (
                                <div key={p.id || p.name} className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold truncate text-slate-800 dark:text-slate-200">
                                    {pI + 1}. {p.name}
                                  </span>
                                  <span className="font-mono font-black text-blue-600 dark:text-cyan-400 shrink-0">
                                    {p.stats?.goals ?? 0} Gol
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
                            {OFFICIAL_SQUAD_2026_2027
                              .filter((p) => (p.stats?.assists ?? 0) > 0)
                              .sort((a, b) => (b.stats?.assists ?? 0) - (a.stats?.assists ?? 0))
                              .slice(0, 4)
                              .map((p, pI) => (
                                <div key={p.id || p.name} className="flex items-center justify-between text-[11px]">
                                  <span className="font-extrabold truncate text-slate-800 dark:text-slate-200">
                                    {pI + 1}. {p.name}
                                  </span>
                                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                                    {p.stats?.assists ?? 0} Ast
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h3 className="text-sm font-black tracking-tight">Kalender & Jadwal Laga</h3>
              <p className="text-[11px] text-slate-400">
                Pertandingan yang telah dilalui & jadwal yang akan dihadapi
              </p>
            </div>
            <div className="flex items-center gap-1 self-start sm:self-auto">
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

          {/* Sub-Bar: View Density Switcher & Minimization Status (Anti Capek Scroll) */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">
                {isScheduleMinimized ? `Diperkecil: ${displayedSchedule.length} dari ${filteredSchedule.length} laga` : `Lengkap: ${filteredSchedule.length} laga`}
              </span>
              {filteredSchedule.length > 6 && (
                <button
                  onClick={() => setIsScheduleMinimized(!isScheduleMinimized)}
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-cyan-400 hover:bg-blue-500/20 transition-colors shrink-0"
                >
                  {isScheduleMinimized ? 'Buka Semua' : 'Perkecil'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setScheduleViewDensity('compact')}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition-all flex items-center gap-1 ${
                  scheduleViewDensity === 'compact'
                    ? isPro
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Tampilan ringkas padat anti scroll panjang"
              >
                <Minimize2 className="w-3 h-3" />
                Mode Ringkas
              </button>
              <button
                onClick={() => setScheduleViewDensity('full')}
                className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold transition-all flex items-center gap-1 ${
                  scheduleViewDensity === 'full'
                    ? isPro
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Tampilan kartu detail lengkap"
              >
                <Maximize2 className="w-3 h-3" />
                Kartu Detail
              </button>
            </div>
          </div>

          {/* List of Matches: Either High-Density Compact Rows OR Full Rich Cards */}
          {scheduleViewDensity === 'compact' ? (
            <div className="space-y-1.5">
              {displayedSchedule.map((fix: MatchFixture) => {
                const isFinished = !isFixtureInFuture(fix.date, fix.time) && fix.status === 'FINISHED';
                const isCurrent = (selectedFixtureId ? selectedFixtureId === fix.id : currentFixture.id === fix.id);
                const parsedRound = parseRoundAndExtra(fix.roundOrWeek);

                return (
                  <div
                    key={fix.id}
                    onClick={() => {
                      setSelectedFixtureId(fix.id);
                      setMatchViewTab('featured');
                    }}
                    className={`px-3 py-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 active:scale-[0.99] select-none ${
                      isCurrent
                        ? isPro
                          ? 'bg-[#181D2A] border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-300'
                        : isPro
                        ? 'bg-[#121620] border-slate-800/80 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Left: Round Pill & Date */}
                    <div className="shrink-0 w-[64px]">
                      <span className="font-mono font-black text-[10px] text-slate-400 dark:text-slate-400 truncate block">
                        {parsedRound.mainText}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-mono truncate">
                        {fix.date ? fix.date.replace(/\s+202[0-9]/, '').trim() : ''}
                      </span>
                    </div>

                    {/* Center: Matchup (Home vs Away) */}
                    <div className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-1">
                      <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                        <span
                          className={`text-[11px] truncate text-right ${
                            fix.homeTeam.includes('PERSIB')
                              ? 'font-black text-blue-600 dark:text-cyan-400'
                              : 'font-semibold text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {fix.homeTeam.replace(' FC', '')}
                        </span>
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <ClubThumb name={fix.homeTeam} logoUrl={fix.homeLogo} />
                        </div>
                      </div>

                      <span className="text-[9.5px] font-bold text-slate-400 shrink-0">vs</span>

                      <div className="flex-1 flex items-center justify-start gap-1.5 min-w-0">
                        <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                          <ClubThumb name={fix.awayTeam} logoUrl={fix.awayLogo} />
                        </div>
                        <span
                          className={`text-[11px] truncate text-left ${
                            fix.awayTeam.includes('PERSIB')
                              ? 'font-black text-blue-600 dark:text-cyan-400'
                              : 'font-semibold text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {fix.awayTeam.replace(' FC', '')}
                        </span>
                      </div>
                    </div>

                    {/* Right: Score or Schedule Time */}
                    <div className="shrink-0 text-right w-[60px]">
                      {isFinished ? (
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-block text-center min-w-[42px]">
                          {fix.homeScore} - {fix.awayScore}
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 inline-block text-center min-w-[42px]">
                          {fix.time || 'TBA'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSchedule.map((fix: MatchFixture) => {
                const isFinished = !isFixtureInFuture(fix.date, fix.time) && fix.status === 'FINISHED';
                const parsedRound = parseRoundAndExtra(fix.roundOrWeek);

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
                    {/* Top Status & Date Header - Clean Sub-Badge Layout */}
                    <div className="pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-slate-400 font-mono font-bold text-[10.5px] block leading-tight">
                            {parsedRound.mainText}
                          </span>
                          {parsedRound.subBadge && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
                                🔥 {parsedRound.subBadge}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-mono font-black text-[9.5px] whitespace-nowrap shadow-2xs ${
                              isFinished
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800'
                                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800'
                            }`}
                          >
                            {isFinished ? 'SELESAI (FT)' : formatCardDate(fix.date, fix.time)}
                          </span>
                        </div>
                      </div>
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

                    {/* Venue and Action - Concise Venue Display */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px]">
                      <div className="flex items-center gap-1.5 text-slate-400 min-w-0 pr-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{simplifyVenueName(fix.venue)}</span>
                      </div>
                      <span className="text-blue-600 dark:text-cyan-400 font-extrabold shrink-0 flex items-center gap-0.5">
                        Lihat Detail <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Expand / Minimize Toggle Button */}
          {filteredSchedule.length > 5 && (
            <div className="pt-2 text-center">
              <button
                onClick={() => setIsScheduleMinimized(!isScheduleMinimized)}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.99] ${
                  isPro
                    ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-800 text-cyan-400 shadow-md'
                    : 'bg-white hover:bg-blue-50 border-blue-200 text-blue-700 shadow-xs'
                }`}
              >
                {isScheduleMinimized ? (
                  <>
                    <ChevronDown className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Tampilkan Seluruh Laga ({filteredSchedule.length} Pertandingan Lengkap)</span>
                    <span className="text-[10px] font-mono opacity-60">+{filteredSchedule.length - displayedSchedule.length} Laga</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Perkecil Tampilan Laga (Mode Minimalis - Anti Capek Scroll)</span>
                  </>
                )}
              </button>
            </div>
          )}
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
            {/* Quick Top Scorer Callout Shortcut for Active Tournament */}
            {(() => {
              const currentKey = activeTournament === 'liga1' ? 'liga1' : activeTournament === 'shopee_cup' ? 'shopee' : 'acl2';
              const topList = activeTopScorers[currentKey] || [];
              const leader = topList[0];
              if (!leader) return null;

              return (
                <div
                  onClick={() => {
                    setScorerTournamentFilter(currentKey);
                    setMatchViewTab('scorers');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] ${
                    isPro
                      ? 'bg-amber-950/20 border-amber-900/40 hover:bg-amber-950/30'
                      : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/70 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-amber-400 bg-slate-900">
                      <img
                        src={leader.avatarUrl || getPlayerAvatar(leader.playerName)}
                        alt={leader.playerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.playerName)}&background=d97706&color=ffffff&bold=true`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                          👑 Top Scorer {activeTournament === 'liga1' ? 'Super League' : activeTournament === 'shopee_cup' ? 'Shopee Cup' : 'ACL Two'}
                        </span>
                      </div>
                      <h5 className="text-xs font-black truncate text-slate-900 dark:text-white mt-0.5">
                        {leader.playerName} <span className="font-semibold text-[10.5px] text-slate-400">({leader.clubName})</span>
                      </h5>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                        {leader.goals} Gol
                      </span>
                      <span className="block text-[9px] text-slate-400 font-mono">
                        {leader.matches} Laga
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })()}

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
                  <h4 className={`text-xl font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-950'}`}>
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
                  <span className="font-mono font-bold text-xs">{persibAclTeam?.gf ?? 6} : {persibAclTeam?.ga ?? 1}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium">Selisih Gol</span>
                  <span className="font-mono font-bold text-emerald-500 text-xs">+{((persibAclTeam?.gf ?? 6) - (persibAclTeam?.ga ?? 1))}</span>
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
                  <h4 className={`text-xl font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-950'}`}>
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
                  <h4 className={`text-xl font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-950'}`}>
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
                    {(isStandingsMinimized ? liga1Standings.slice(0, 6) : liga1Standings).map((row: LeagueStandingRow) => (
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

              {/* Bottom Expand / Minimize Toggle Button for Liga 1 Standings Table */}
              {liga1Standings.length > 6 && (
                <div className="p-2.5 border-t border-slate-200 dark:border-slate-800/80 text-center bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    onClick={() => setIsStandingsMinimized(!isStandingsMinimized)}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all active:scale-[0.99] ${
                      isPro
                        ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isStandingsMinimized ? (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                        <span>Tampilkan Seluruh 18 Klub Klasemen (12 Klub Lainnya)</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
                        <span>Perkecil Klasemen (Top 6 Papan Atas Saja)</span>
                      </>
                    )}
                  </button>
                </div>
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
                  <h3 className={`text-xs sm:text-sm font-black tracking-tight whitespace-nowrap ${isPro ? 'text-white' : 'text-slate-950'}`}>
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
                  const oppHasScored = playerMatchesScorer(opp.name, matchScorers);

                  return (
                    <div
                      key={opp.id}
                      onClick={() => setSelectedPlayer(oppAsPlayer)}
                      style={{ bottom: `${posX}%`, left: `${posY}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-10 transition-transform active:scale-90"
                    >
                      <div className="relative">
                        {oppHasScored && (
                          <span className="absolute -top-2 -left-1 text-[11px] filter drop-shadow-md z-20 animate-bounce">
                            ⚽
                          </span>
                        )}
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
                      { id: 'p-lw', name: 'Luka Menalo', number: 9, role: 'LW', x: 42, y: 18 },
                      { id: 'p-cf', name: 'Balša Sekulić', number: 99, role: 'CF', x: 47, y: 50 },
                    ]
                ).map((pos) => {
                  const fullPlayer = players.find(
                    (p) => p.number === pos.number || p.name.toLowerCase().includes(pos.name.toLowerCase())
                  );
                  const hasScored = playerMatchesScorer(pos.name, matchScorers);

                  return (
                    <TacticalPlayerNode
                      key={pos.id}
                      pos={pos}
                      fullPlayer={fullPlayer}
                      onSelectPlayer={setSelectedPlayer}
                      hasScored={hasScored}
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

      {/* 7. Sub-Page Tab 5: Dedicated Top Scorers & Playmaker Hub (Semua Event Resmi) */}
      {matchViewTab === 'scorers' && (
        <div className="space-y-4">
          {/* Header & Tournament Filter Controls */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isPro
                ? 'bg-gradient-to-br from-[#121622] via-[#0E121A] to-[#0A0D14] border-slate-800'
                : 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-blue-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                    Pusat Top Skor & Playmaker
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Statistik gol & assist resmi terpisah per kompetisi musim 2026/2027 (Liga 1, ACL Two, Shopee Cup)
                </p>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                GOLDEN BOOT
              </span>
            </div>

            {/* Tournament Selector Pills - Masing-masing Kompetisi Terpisah (Tanpa Akumulasi Campuran) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'liga1', label: 'BRI Liga 1 (Super League)' },
                { id: 'acl2', label: 'ACL Two (Asia)' },
                { id: 'shopee', label: 'Shopee Cup (ASEAN)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setScorerTournamentFilter(t.id as 'liga1' | 'acl2' | 'shopee')}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] font-extrabold whitespace-nowrap transition-all border shrink-0 ${
                    scorerTournamentFilter === t.id
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : isPro
                      ? 'bg-[#161B28] text-slate-400 border-slate-800 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scope Filter Switcher: Seluruh Klub Kompetisi vs Khusus PERSIB */}
            <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Cakupan:
              </span>
              <div className="flex items-center gap-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => setScorerScopeFilter('all')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[10.5px] font-extrabold transition-all border flex items-center justify-center gap-1.5 ${
                    scorerScopeFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : isPro
                      ? 'bg-[#161B28] text-slate-400 border-slate-800 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Seluruh Klub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScorerScopeFilter('persib')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[10.5px] font-extrabold transition-all border flex items-center justify-center gap-1.5 ${
                    scorerScopeFilter === 'persib'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : isPro
                      ? 'bg-[#161B28] text-slate-400 border-slate-800 hover:text-white'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Khusus PERSIB</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Banner (3 Cards) */}
          {(() => {
            const rawList = activeTopScorers[scorerTournamentFilter] || [];
            const list = scorerScopeFilter === 'persib' ? rawList.filter((sc) => sc.isPersib) : rawList;
            const topScorer = list[0];

            return (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className={`p-3 rounded-2xl border text-center ${
                      isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Total Gol Tim</span>
                    <div className="text-xl font-black font-mono text-blue-600 dark:text-cyan-400 mt-0.5">
                      {scorerTournamentFilter === 'liga1'
                        ? '18 Gol'
                        : scorerTournamentFilter === 'acl2'
                        ? '6 Gol'
                        : '9 Gol'}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {scorerTournamentFilter === 'liga1'
                        ? '10 Laga (Super League)'
                        : scorerTournamentFilter === 'acl2'
                        ? '4 Laga (Grup E Asia)'
                        : '2 Laga (Grup B ASEAN)'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between ${
                      isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Top Scorer #1</span>
                    <div className="flex items-center justify-center gap-2 my-1">
                      {topScorer && (
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-md">
                          <img
                            src={topScorer.avatarUrl || getPlayerAvatar(topScorer.playerId || topScorer.playerName)}
                            alt={topScorer.playerName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getPlayerAvatar(topScorer.playerName);
                            }}
                          />
                        </div>
                      )}
                      <div className="text-xl font-black font-mono text-amber-500">
                        {topScorer ? `${topScorer.goals} Gol` : '-'}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium truncate block max-w-full">
                      {topScorer ? `${topScorer.playerName} (${topScorer.clubName.replace('PERSIB Bandung', 'PERSIB')})` : '-'}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl border text-center ${
                      isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Raja Assist</span>
                    <div className="text-xl font-black font-mono text-emerald-500 mt-0.5">
                      {scorerTournamentFilter === 'liga1' ? '5 Ast' : scorerTournamentFilter === 'acl2' ? '3 Ast' : '2 Ast'}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium truncate block">
                      {scorerTournamentFilter === 'liga1'
                        ? 'Thom Haye (#33)'
                        : scorerTournamentFilter === 'acl2'
                        ? 'Thom Haye (#33)'
                        : 'Arif Aiman / Beckham'}
                    </span>
                  </div>
                </div>

                {/* Golden Boot Podium (Top 3 Visual Display) */}
                {(() => {
                  const first = list[0];
                  const second = list[1];
                  const third = list[2];

                  if (!first) return null;

                  return (
                    <div
                      className={`p-4 rounded-3xl border transition-all ${
                        isPro
                          ? 'bg-gradient-to-b from-[#181D2A] to-[#10141D] border-slate-800'
                          : 'bg-gradient-to-b from-blue-50/50 to-white border-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="text-center mb-3">
                        <span className="text-[10px] font-mono uppercase font-black tracking-wider text-amber-500 flex items-center justify-center gap-1">
                          <Crown className="w-3.5 h-3.5" />
                          PODIUM GOLDEN BOOT {scorerTournamentFilter === 'liga1' ? 'BRI LIGA 1' : scorerTournamentFilter === 'acl2' ? 'ACL TWO' : 'SHOPEE CUP'} ({scorerScopeFilter === 'persib' ? 'PERSIB' : 'SELURUH KLUB'})
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 items-end pt-2 pb-1">
                        {/* Rank 2 (Silver) */}
                        {second && (
                          <div className="flex flex-col items-center text-center">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-500 shadow-md bg-slate-800">
                                <img
                                  src={second.avatarUrl || getPlayerAvatar(second.playerName)}
                                  alt={second.playerName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(second.playerName)}&background=475569&color=ffffff&bold=true`;
                                  }}
                                />
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-black text-[10px] flex items-center justify-center shadow-xs">
                                2
                              </span>
                            </div>
                            <h4 className="text-[11px] font-black mt-2 leading-tight truncate w-full text-slate-900 dark:text-white">
                              {second.playerName.split(' ')[0]}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-medium truncate w-full">
                              {second.clubName.replace('PERSIB Bandung', 'PERSIB')}
                            </span>
                            <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-black text-slate-800 dark:text-slate-200">
                              {second.goals} Gol
                            </div>
                          </div>
                        )}

                        {/* Rank 1 (Gold - Elevated) */}
                        {first && (
                          <div className="flex flex-col items-center text-center -translate-y-2">
                            <div className="relative">
                              <div className="w-18 h-18 rounded-full overflow-hidden border-3 border-amber-400 shadow-lg shadow-amber-500/20 bg-slate-900">
                                <img
                                  src={first.avatarUrl || getPlayerAvatar(first.playerName)}
                                  alt={first.playerName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(first.playerName)}&background=d97706&color=ffffff&bold=true`;
                                  }}
                                />
                              </div>
                              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400 text-base">
                                👑
                              </span>
                              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                                1
                              </span>
                            </div>
                            <h4 className="text-xs font-black mt-2.5 leading-tight truncate w-full text-amber-500 dark:text-amber-400">
                              {first.playerName}
                            </h4>
                            <span className="text-[9.5px] text-slate-400 font-medium truncate w-full">
                              {first.clubName.replace('PERSIB Bandung', 'PERSIB')}
                            </span>
                            <div className="mt-1 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-mono font-black shadow-xs">
                              {first.goals} Gol
                            </div>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                              {first.assists} Assist • {first.matches} Laga
                            </span>
                          </div>
                        )}

                        {/* Rank 3 (Bronze) */}
                        {third && (
                          <div className="flex flex-col items-center text-center">
                            <div className="relative">
                              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-700/70 shadow-md bg-slate-800">
                                <img
                                  src={third.avatarUrl || getPlayerAvatar(third.playerName)}
                                  alt={third.playerName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(third.playerName)}&background=92400e&color=ffffff&bold=true`;
                                  }}
                                />
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                                3
                              </span>
                            </div>
                            <h4 className="text-[11px] font-black mt-2 leading-tight truncate w-full text-slate-900 dark:text-white">
                              {third.playerName.split(' ')[0]}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-medium truncate w-full">
                              {third.clubName.replace('PERSIB Bandung', 'PERSIB')}
                            </span>
                            <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-black text-slate-800 dark:text-slate-200">
                              {third.goals} Gol
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Full Leaderboard Table / Cards */}
                <div
                  className={`p-4 rounded-3xl border transition-all ${
                    isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Daftar Pencetak Gol {scorerTournamentFilter === 'liga1' ? 'BRI Liga 1 (Super League)' : scorerTournamentFilter === 'acl2' ? 'AFC Champions League Two' : 'Shopee Cup ASEAN'} ({scorerScopeFilter === 'persib' ? 'Khusus PERSIB' : 'Seluruh Klub'})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Peringkat & Efisiensi
                    </span>
                  </div>

                  <div className="space-y-2">
                    {list.map((sc: TopScorerEntry, scIndex: number) => (
                      <div
                        key={`${sc.tournament}-${sc.playerName}-${scIndex}`}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                          sc.isPersib
                            ? isPro
                              ? 'bg-blue-950/20 border-blue-900/40 hover:bg-blue-950/30'
                              : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50/80'
                            : isPro
                            ? 'bg-[#161B28] border-slate-800 hover:bg-[#1a2130]'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-full font-mono font-black text-[11px] flex items-center justify-center shrink-0 ${
                              scIndex === 0
                                ? 'bg-amber-400 text-slate-950'
                                : scIndex === 1
                                ? 'bg-slate-300 text-slate-900'
                                : scIndex === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {scIndex + 1}
                          </span>

                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                              src={sc.avatarUrl || getPlayerAvatar(sc.playerId || sc.playerName)}
                              alt={sc.playerName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getPlayerAvatar(sc.playerId || sc.playerName);
                              }}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs truncate text-slate-900 dark:text-white">
                                {sc.playerName}
                              </span>
                              {sc.isPersib && (
                                <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black bg-blue-600 text-white shrink-0">
                                  PERSIB
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{sc.clubName}</span>
                              <span>•</span>
                              <span>{sc.position}</span>
                              <span>•</span>
                              <span>{sc.matches} Main</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-black font-mono text-blue-600 dark:text-cyan-400">
                            {sc.goals} <span className="text-[10px] font-sans font-bold text-slate-400">GOL</span>
                          </div>
                          <div className="text-[9.5px] font-mono text-slate-400">
                            {sc.assists} Ast • {Math.round(sc.minutesPlayed / Math.max(1, sc.goals))} m/gol
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            );
          })()}

          {/* Raja Assist Spotlight (Playmakers of the Season) */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Raja Assist (Playmaker Kunci)
                </h4>
              </div>
              <span className="text-[9.5px] font-mono text-emerald-500 font-bold">
                Kreasi Peluang
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {OFFICIAL_SQUAD_2026_2027
                .filter((p) => (p.stats?.assists ?? 0) > 0)
                .sort((a, b) => (b.stats?.assists ?? 0) - (a.stats?.assists ?? 0))
                .slice(0, 4)
                .map((pm) => (
                  <div
                    key={pm.id || pm.name}
                    className={`p-3 rounded-2xl border transition-all ${
                      isPro ? 'bg-[#161B28] border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{pm.number}</span>
                      <span className="text-xs font-mono font-black text-emerald-500">{pm.stats?.assists ?? 0} Assist</span>
                    </div>
                    <div className="font-black text-xs text-slate-900 dark:text-white mt-1 truncate">
                      {pm.name}
                    </div>
                    <div className="text-[9.5px] text-slate-400 mt-0.5 truncate">
                      {pm.position === 'MF' ? 'Playmaker Maestro' : 'Penyerang Sayap'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
