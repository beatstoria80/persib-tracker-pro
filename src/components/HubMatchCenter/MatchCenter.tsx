'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { TacticalPitch2D } from './TacticalPitch2D';
import { ScenarioSimulator } from './ScenarioSimulator';
import { Trophy, Calendar, CheckCircle2, Shield, MapPin, Users, Award } from 'lucide-react';
// REFACTOR: Strictly imported typed models to prevent any implicit any
import { MatchFixture, Player, LeagueStandingRow } from '@/types/club';

export function MatchCenter() {
  const {
    mode,
    activeTournament,
    setActiveTournament,
    fixtures,
    liga1Standings,
    players,
    setSelectedPlayer,
  } = useClubTracker();
  const isPro = mode === 'pro';

  const [matchViewTab, setMatchViewTab] = useState<'match_card' | 'lineup' | 'tactics' | 'standings'>('match_card');

  const currentFixture: MatchFixture =
    fixtures.find((f: MatchFixture) => f.tournamentKey === activeTournament) || fixtures[0];

  const startingXI: Player[] = players.filter((p: Player) => p.squadRole === 'starting');
  const substitutes: Player[] = players.filter((p: Player) => p.squadRole === 'substitute');

  return (
    <div className="space-y-6">
      {/* Tournament Selector Header */}
      {/* REFACTOR: Enhanced container dynamic styling for ultra-bright contrast in State A and neon glow in State B */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isPro
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-amber-700 bg-amber-50 border-amber-300'
                }`}
              >
                <Award className="w-3 h-3" /> Musim Kompetisi 2026/2027 (Head Coach Igor Tolic)
              </span>
            </div>
            <h2
              className={`text-xl font-black tracking-tight flex items-center gap-2 ${
                isPro ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              Match Center & Turnamen Resmi
            </h2>
            <p className={`text-xs mt-0.5 ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
              Pusat data laga BRI Liga 1 2026/2027 (Pekan 11) & AFC Champions League Two
            </p>
          </div>

          {/* REFACTOR: Dynamic tournament toggle with high-contrast light borders and deep blue background */}
          <div
            className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border ${
              isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => setActiveTournament('liga1')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTournament === 'liga1'
                  ? isPro
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-blue-700 text-white shadow-md'
                  : isPro
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-blue-900 hover:bg-white'
              }`}
            >
              <span>🇮🇩 BRI Liga 1 2026/27</span>
              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                Peringkat #1
              </span>
            </button>

            <button
              onClick={() => setActiveTournament('acl2')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTournament === 'acl2'
                  ? isPro
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-blue-700 text-white shadow-md'
                  : isPro
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-700 hover:text-blue-900 hover:bg-white'
              }`}
            >
              <span>🌏 ACL Two 2026/27</span>
            </button>
          </div>
        </div>

        {/* View mode sub-navigation */}
        {/* REFACTOR: Made sub-nav tabs completely contrast-adaptive in light mode */}
        <div
          className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t text-xs font-semibold ${
            isPro ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => setMatchViewTab('match_card')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'match_card'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-800 hover:bg-slate-100'
            }`}
          >
            Laga Terpilih ({currentFixture.status === 'FINISHED' ? 'Hasil Resmi Pekan 11' : 'Jadwal'})
          </button>
          <button
            onClick={() => setMatchViewTab('lineup')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'lineup'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-800 hover:bg-slate-100'
            }`}
          >
            Susunan Pemain 2026/2027 (Starting XI & Cadangan)
          </button>
          <button
            onClick={() => setMatchViewTab('tactics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'tactics'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-800 hover:bg-slate-100'
            }`}
          >
            Animasi 2D & Spasial Taktik Igor Tolic
          </button>
          <button
            onClick={() => setMatchViewTab('standings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'standings'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600 font-bold'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-800 hover:bg-slate-100'
            }`}
          >
            Klasemen {activeTournament === 'liga1' ? 'BRI Liga 1 2026/2027' : 'ACL Two 2026/2027'}
          </button>
        </div>
      </div>

      {/* Tab 1: Match Card */}
      {matchViewTab === 'match_card' && (
        <div
          className={`rounded-3xl border overflow-hidden relative transition-all duration-300 ${
            isPro
              ? 'bg-gradient-to-br from-[#0c192c] via-[#091220] to-[#050912] border-blue-900/60 shadow-[0_8px_40px_rgba(0,102,255,0.18)]'
              // REFACTOR: Replaced dark card with clean white card and high-contrast typography in State A
              : 'bg-white border-slate-300 shadow-md text-slate-950'
          }`}
        >
          {isPro && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400" />
          )}

          <div className="p-6 sm:p-8">
            <div
              className={`flex flex-wrap items-center justify-between gap-3 pb-6 border-b ${
                isPro ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`p-2 rounded-xl border ${
                    isPro ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  <Shield className="w-5 h-5 text-amber-500" />
                </span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                    {currentFixture.tournament}
                  </div>
                  <div className={`text-sm font-semibold ${isPro ? 'text-slate-300' : 'text-slate-700'}`}>
                    {currentFixture.roundOrWeek}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                    currentFixture.status === 'FINISHED'
                      ? isPro
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : isPro
                      ? 'bg-blue-950 text-cyan-300 border-blue-800'
                      : 'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  {currentFixture.status === 'FINISHED' ? 'FULL TIME (RESMI PT LIB)' : 'JADWAL RESMI'}
                </span>
                <span className={`text-xs flex items-center gap-1 ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  <Calendar className="w-3.5 h-3.5" /> {currentFixture.date} • {currentFixture.time}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-center py-8 gap-6">
              <div className="flex items-center md:justify-end gap-4 text-left md:text-right">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentFixture.homeTeam}</h2>
                  <div className={`text-xs mt-1 ${isPro ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                    Igor Tolic • Formasi 4-2-3-1
                  </div>
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-md shrink-0">
                  PSB
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                {currentFixture.status === 'FINISHED' ? (
                  <>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-5xl sm:text-6xl font-black font-mono ${
                          isPro ? 'text-cyan-300' : 'text-blue-900'
                        }`}
                      >
                        {currentFixture.homeScore}
                      </span>
                      <span className="text-3xl font-light text-slate-400">-</span>
                      <span
                        className={`text-5xl sm:text-6xl font-black font-mono ${
                          isPro ? 'text-slate-300' : 'text-slate-800'
                        }`}
                      >
                        {currentFixture.awayScore}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-mono uppercase tracking-widest text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kemenangan Pekan 11 (Unbeaten)
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-2xl font-mono font-bold ${isPro ? 'text-slate-300' : 'text-slate-800'}`}>
                      VS
                    </div>
                    <div className="mt-2 text-xs font-mono text-blue-600 font-bold">
                      El Clasico Indonesia 2026/2027
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                    isPro
                      ? 'bg-slate-800 text-rose-400 ring-1 ring-slate-700'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-700 shadow-sm'
                  }`}
                >
                  {currentFixture.awayTeam.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentFixture.awayTeam}</h2>
                  <div className={`text-xs mt-1 ${isPro ? 'text-slate-400' : 'text-slate-600 font-semibold'}`}>
                    Lawan Resmi PT LIB
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                isPro ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <div className={`flex items-center gap-2 ${isPro ? 'text-slate-400' : 'text-slate-700'}`}>
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>
                  Venue: <strong className={isPro ? 'text-slate-200' : 'text-slate-950 font-bold'}>{currentFixture.venue}</strong>
                </span>
              </div>
              <div className={isPro ? 'text-slate-400 text-[11px]' : 'text-slate-600 text-[11px] font-medium'}>
                Data resmi dari Match Commissioner PT LIB & AFC musim 2026/2027
              </div>
            </div>

            {currentFixture.highlights && currentFixture.highlights.length > 0 && (
              <div
                className={`mt-4 p-3.5 rounded-xl border ${
                  isPro ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase text-amber-500 mb-1 block">
                  Sorotan Resmi Laga:
                </span>
                <ul
                  className={`text-xs space-y-1 list-disc list-inside ${
                    isPro ? 'text-slate-300' : 'text-slate-800 font-medium'
                  }`}
                >
                  {currentFixture.highlights.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Lineup (Starting XI vs Substitutes 2026/2027) */}
      {matchViewTab === 'lineup' && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all ${
            isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b mb-5 gap-2 ${
              isPro ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Line-Up Resmi Persib Bandung (Musim 2026/2027)
                </h3>
              </div>
              <p className={`text-xs mt-0.5 ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                Head Coach: <strong className={isPro ? 'text-cyan-300' : 'text-blue-700 font-bold'}>Igor Tolic</strong> • Strategic Advisor: <strong className="text-amber-500 font-bold">Bojan Hodak</strong> • Formasi: 4-2-3-1
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                isPro
                  ? 'text-cyan-300 bg-blue-950 border-blue-800'
                  : 'text-blue-900 bg-blue-50 border-blue-300'
              }`}
            >
              Formasi 4-2-3-1 Igor Tolic
            </span>
          </div>

          <div className="mb-6">
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isPro ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 11 Pemain Pertama (Starting XI)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {startingXI.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  // REFACTOR: Replaced hardcoded dark background with crisp white-to-slate card in State A
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isPro
                      ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                      : 'bg-white border-slate-300 hover:border-blue-600 shadow-sm hover:shadow'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-700 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                      {player.fitness.percentage}% Fit
                    </span>
                    <span className={`text-[10px] ${isPro ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                      ★ {player.stats.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isPro ? 'text-cyan-400' : 'text-blue-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Pemain Cadangan & Rotasi Resmi (Substitutes)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {substitutes.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isPro
                      ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                        isPro ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        player.fitness.status === 'cedera'
                          ? 'text-rose-600'
                          : player.fitness.status === 'latihan_terpisah'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {player.fitness.status === 'cedera' ? 'Cedera' : `${player.fitness.percentage}%`}
                    </span>
                    <span className={`text-[10px] ${isPro ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                      {player.stats.appearances} Laga
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2D & Spatial Tactical Pitch */}
      {matchViewTab === 'tactics' && <TacticalPitch2D />}

      {/* Tab 4: Standings */}
      {matchViewTab === 'standings' && (
        <div className="space-y-6">
          {activeTournament === 'liga1' ? (
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-2 ${
                  isPro ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-mono font-bold uppercase ${
                      isPro ? 'text-amber-400' : 'text-amber-700'
                    }`}
                  >
                    Klasemen Resmi Sementara BRI Liga 1 2026/2027 (Pekan 11)
                  </span>
                  <h3
                    className={`text-base font-black tracking-tight mt-0.5 ${
                      isPro ? 'text-slate-100' : 'text-slate-950'
                    }`}
                  >
                    PERSIB Bandung Pemuncak Klasemen (27 Poin - Rekor Tak Terkalahkan)
                  </h3>
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-blue-600 text-white shadow-sm">
                  🔥 Unbeaten 11 Pekan
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    {/* REFACTOR: High contrast table header in light mode */}
                    <tr
                      className={`border-b font-bold ${
                        isPro ? 'border-slate-800 text-slate-400 bg-slate-900/40' : 'border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      <th className="py-2.5 px-3"># Pos</th>
                      <th className="py-2.5 px-3">Klub</th>
                      <th className="py-2.5 px-2 text-center">Main</th>
                      <th className="py-2.5 px-2 text-center">M</th>
                      <th className="py-2.5 px-2 text-center">S</th>
                      <th className="py-2.5 px-2 text-center">K</th>
                      <th className="py-2.5 px-2 text-center">GM</th>
                      <th className="py-2.5 px-2 text-center">GK</th>
                      <th className="py-2.5 px-2 text-center">SG</th>
                      <th className="py-2.5 px-3 text-center font-bold">Poin</th>
                      <th className="py-2.5 px-3 text-center">Form (5 Laga)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liga1Standings.map((row: LeagueStandingRow) => (
                      <tr
                        key={row.team}
                        className={`border-b transition-colors ${
                          row.isPersib
                            ? isPro
                              ? 'bg-blue-950/70 border-blue-800 text-cyan-200 font-bold'
                              : 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                            : isPro
                            ? 'border-slate-800/40 hover:bg-slate-800/30 text-slate-300'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                              row.rank === 1
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                : row.rank <= 4
                                ? 'bg-blue-700 text-white'
                                : isPro
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 flex items-center gap-2">
                          <span>{row.team}</span>
                          {row.isPersib && (
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-700 text-white font-mono">
                              Pemuncak
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{row.played}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.won}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.drawn}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.lost}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.gf}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.ga}</td>
                        <td
                          className={`py-3 px-2 text-center font-mono font-bold ${
                            isPro ? 'text-cyan-300' : 'text-blue-700'
                          }`}
                        >
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td
                          className={`py-3 px-3 text-center font-mono font-extrabold text-sm ${
                            isPro ? 'text-cyan-300' : 'text-blue-900'
                          }`}
                        >
                          {row.points}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.form.map((res: string, i: number) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                                  res === 'W'
                                    ? 'bg-emerald-500 text-white'
                                    : res === 'D'
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-rose-500 text-white'
                                }`}
                              >
                                {res}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ScenarioSimulator />
          )}
        </div>
      )}
    </div>
  );
}
