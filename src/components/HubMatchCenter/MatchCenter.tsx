'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { MapPin, ChevronRight } from 'lucide-react';
import { MatchFixture, Player, LeagueStandingRow, GroupTeam } from '@/types/club';
import { getClubLogo } from '@/data/persib-data';

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
      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider shadow-md transition-transform hover:scale-105 p-2 ${
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

// Helper thumbnail for tables and pills
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
  } = useClubTracker();
  const isPro = mode === 'pro';

  const [matchViewTab, setMatchViewTab] = useState<'match_card' | 'standings' | 'lineup'>('match_card');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('acl2-26-md4-live');

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  const currentFixture: MatchFixture =
    tournamentFixtures.find((f: MatchFixture) => f.id === selectedFixtureId) || tournamentFixtures[0] || fixtures[0];

  const startingXI: Player[] = players.filter((p: Player) => p.squadRole === 'starting');
  const substitutes: Player[] = players.filter((p: Player) => p.squadRole === 'substitute');

  return (
    <div className="space-y-5">
      {/* 1. Explore & Title Section (Inspired by Dribbble Reference) */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
            Official Competition Hub
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {activeTournament === 'shopee_cup'
              ? 'Puncak Grup B'
              : activeTournament === 'acl2'
              ? 'Juara Grup E'
              : 'Peringkat #4'}
          </span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          {activeTournament === 'shopee_cup'
            ? 'SHOPEE CUP'
            : activeTournament === 'acl2'
            ? 'ACL TWO'
            : 'LIGA 1'}
        </h1>
      </div>

      {/* 2. Horizontal League Pill Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => {
            setActiveTournament('liga1');
            setSelectedFixtureId('l1-p8');
          }}
          className={`px-4 py-2.5 rounded-full text-xs font-black tracking-tight transition-all duration-200 shrink-0 ${
            activeTournament === 'liga1'
              ? isPro
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-blue-700 text-white shadow-md shadow-blue-700/25'
              : isPro
              ? 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          BRI Liga 1
        </button>

        <button
          onClick={() => {
            setActiveTournament('acl2');
            setSelectedFixtureId('acl2-26-md4-live');
          }}
          className={`px-4 py-2.5 rounded-full text-xs font-black tracking-tight transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
            activeTournament === 'acl2'
              ? isPro
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-blue-700 text-white shadow-md shadow-blue-700/25'
              : isPro
              ? 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <span>ACL Two</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        <button
          onClick={() => {
            setActiveTournament('shopee_cup');
            setSelectedFixtureId('shopee-26-md1-ft');
          }}
          className={`px-4 py-2.5 rounded-full text-xs font-black tracking-tight transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
            activeTournament === 'shopee_cup'
              ? isPro
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/25'
              : isPro
              ? 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
          }`}
        >
          <span>Shopee Cup (ASEAN)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </button>
      </div>

      {/* 3. Sub-Navigation Tabs with Minimal Whitespace */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
          isPro
            ? 'bg-[#121620] border-slate-800 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600 shadow-xs'
        }`}
      >
        <button
          onClick={() => setMatchViewTab('match_card')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold transition-all text-center ${
            matchViewTab === 'match_card'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Matches
        </button>
        <button
          onClick={() => setMatchViewTab('standings')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold transition-all text-center ${
            matchViewTab === 'standings'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Standings
        </button>
        <button
          onClick={() => setMatchViewTab('lineup')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold transition-all text-center ${
            matchViewTab === 'lineup'
              ? isPro
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'bg-blue-50 text-blue-900 shadow-xs'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Tactics XI
        </button>
      </div>

      {/* 4. Tab 1: Bi-Tone Dual Surface Match Card (Signature Dribbble Style) */}
      {matchViewTab === 'match_card' && (
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
                  <span>{fix.roundOrWeek}</span>
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

              <div className="flex items-center justify-between">
                {/* Home Team */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <ClubBadge
                    name={currentFixture.homeTeam}
                    logoUrl={currentFixture.homeLogo}
                    isPersib={currentFixture.homeTeam.includes('PERSIB')}
                    isPro={isPro}
                  />
                  <h4 className="font-black text-xs mt-2.5 leading-snug line-clamp-1 max-w-[110px]">
                    {currentFixture.homeTeam}
                  </h4>
                  <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">Home</span>
                </div>

                {/* Center: Circular VS Pill */}
                <div className="flex flex-col items-center px-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shadow-md border ${
                      isPro
                        ? 'bg-[#0E1118] border-slate-700 text-cyan-300'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    VS
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <ClubBadge
                    name={currentFixture.awayTeam}
                    logoUrl={currentFixture.awayLogo}
                    isPersib={currentFixture.awayTeam.includes('PERSIB')}
                    isPro={isPro}
                  />
                  <h4 className="font-black text-xs mt-2.5 leading-snug line-clamp-1 max-w-[110px]">
                    {currentFixture.awayTeam}
                  </h4>
                  <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">Away</span>
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
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Score / Schedule</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    {currentFixture.status === 'FINISHED' ? (
                      <span className="text-3xl font-black font-mono tracking-tight text-blue-600 dark:text-cyan-400">
                        {currentFixture.homeScore} : {currentFixture.awayScore}
                      </span>
                    ) : (
                      <span className="text-xl font-black font-mono tracking-tight text-blue-700 dark:text-cyan-300">
                        {currentFixture.time}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {currentFixture.status === 'FINISHED' ? 'FT' : currentFixture.date}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono font-bold flex items-center gap-1 justify-end">
                    <MapPin className="w-3 h-3 text-blue-600" /> Venue
                  </div>
                  <p className="text-xs font-bold mt-0.5 truncate max-w-[140px]">
                    {currentFixture.venue}
                  </p>
                </div>
              </div>

              {/* Aggregate Score Ribbon if applicable */}
              {currentFixture.aggregateScore && (
                <div
                  className={`mt-3.5 p-2.5 rounded-2xl text-center text-xs font-bold font-mono border ${
                    isPro
                      ? 'bg-blue-950/60 border-blue-800/60 text-cyan-300'
                      : 'bg-blue-100/70 border-blue-200 text-blue-950'
                  }`}
                >
                  🏆 {currentFixture.aggregateScore}
                </div>
              )}

              {/* Key Events Timeline (Minimalist Stepper) */}
              {currentFixture.events && currentFixture.events.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/60">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Match Highlights & Goals
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 font-mono">100% Real-Time</span>
                  </div>
                  <div className="space-y-2">
                    {currentFixture.events.map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <span
                          className={`font-mono font-black text-[10px] px-2 py-0.5 rounded-md shrink-0 ${
                            ev.type === 'goal'
                              ? 'bg-emerald-500 text-white'
                              : isPro
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {ev.minute}
                        </span>
                        <span className={`text-[11.5px] leading-snug ${ev.type === 'goal' ? 'font-black text-blue-600 dark:text-cyan-300' : 'text-slate-600 dark:text-slate-300'}`}>
                          {ev.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights List */}
              {currentFixture.highlights && currentFixture.highlights.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/60">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5">
                    Laporan Taktis Pertandingan:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {currentFixture.highlights.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5 leading-snug">
                        <span className="text-blue-500 font-bold shrink-0">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Standings Table (Minimalist & Roomy) */}
      {matchViewTab === 'standings' && (
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
                {activeTournament === 'shopee_cup'
                  ? 'Grup B • ASEAN Club Championship (Shopee Cup) 2026/27'
                  : activeTournament === 'acl2'
                  ? 'Grup E • AFC Champions League Two 2026/27'
                  : 'BRI Liga 1 • Musim 2026/2027'}
              </span>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                {activeTournament === 'shopee_cup'
                  ? 'PERSIB Puncak Klasemen Grup B (3 Poin • Comeback 3-1 di Markas Port FC)'
                  : activeTournament === 'acl2'
                  ? 'PERSIB Juara Grup E (12 Poin • Lolos 16 Besar)'
                  : 'PERSIB Posisi #4 (16 Poin • Beda 2 Poin dari Puncak)'}
              </h3>
            </div>
            <span className="text-[9px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
              Verified
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
      )}

      {/* 6. Tab 3: Tactics Lineup List */}
      {matchViewTab === 'lineup' && (
        <div
          className={`rounded-[32px] border p-5 shadow-xl transition-all ${
            isPro
              ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
              : 'bg-white border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
          }`}
        >
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-black tracking-tight">Formasi Taktis 4-2-3-1</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Head Coach: <strong className="text-blue-600 dark:text-cyan-400">Igor Tolic</strong> • Starting XI & Substitutes
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-amber-500">
                11 Pemain Pertama (Starting XI)
              </h4>
              <div className="space-y-2">
                {startingXI.map((player: Player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                      isPro
                        ? 'bg-slate-900/80 border-slate-800 hover:border-cyan-400/50'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-600 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-700 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                        #{player.number}
                      </span>
                      <div>
                        <div className="text-xs font-black">{player.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {player.position} • {player.nationality}
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

            <div className="pt-2">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-wider mb-2 text-blue-500">
                Skuad Cadangan & Rotasi
              </h4>
              <div className="space-y-2">
                {substitutes.map((player: Player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all ${
                      isPro
                        ? 'bg-slate-900/40 border-slate-800/60 hover:border-cyan-400/50'
                        : 'bg-white border-slate-200 hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          isPro ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        #{player.number}
                      </span>
                      <div>
                        <div className="text-xs font-black">{player.name}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {player.position} • {player.nationality}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        {player.fitness.percentage}%
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
  );
}
