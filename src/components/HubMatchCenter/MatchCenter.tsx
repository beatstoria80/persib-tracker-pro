'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { TacticalPitch2D } from './TacticalPitch2D';
import { ScenarioSimulator } from './ScenarioSimulator';
import { Trophy, Calendar, CheckCircle2, Shield, MapPin, Users, Award } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Mobile Tournament Selector Card */}
      <div
        className={`rounded-2xl border p-3.5 transition-all ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_20px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
              isPro
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}
          >
            <Award className="w-3 h-3" /> 2026/27 • Coach Igor Tolic
          </span>
          <span className="text-[10px] font-bold text-emerald-600 font-mono">Pekan 11 #1</span>
        </div>

        {/* Tournament Switcher (2-Column Mobile Buttons) */}
        <div
          className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
            isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => setActiveTournament('liga1')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTournament === 'liga1'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-900 hover:bg-white'
            }`}
          >
            <span>🇮🇩 BRI Liga 1</span>
          </button>

          <button
            onClick={() => setActiveTournament('acl2')}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTournament === 'acl2'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-900 hover:bg-white'
            }`}
          >
            <span>🌏 ACL Two</span>
          </button>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs font-semibold whitespace-nowrap">
          <button
            onClick={() => setMatchViewTab('match_card')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'match_card'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Laga Pekan 11
          </button>
          <button
            onClick={() => setMatchViewTab('lineup')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'lineup'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Line-Up 4-2-3-1
          </button>
          <button
            onClick={() => setMatchViewTab('tactics')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'tactics'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Taktik 2D
          </button>
          <button
            onClick={() => setMatchViewTab('standings')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'standings'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Klasemen
          </button>
        </div>
      </div>

      {/* Tab 1: Match Card (Optimized for Mobile Portrait) */}
      {matchViewTab === 'match_card' && (
        <div
          className={`rounded-2xl border overflow-hidden relative transition-all duration-300 ${
            isPro
              ? 'bg-gradient-to-br from-[#0c192c] via-[#091220] to-[#050912] border-blue-900/60 shadow-md text-slate-100'
              : 'bg-white border-slate-300 shadow-sm text-slate-950'
          }`}
        >
          {isPro && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400" />
          )}

          <div className="p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-bold text-amber-500 uppercase font-mono">{currentFixture.tournament}</span>
              </div>
              <span className={`flex items-center gap-1 font-medium ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                <Calendar className="w-3 h-3" /> {currentFixture.date}
              </span>
            </div>

            {/* Match Scoreboard Row (Native mobile feel) */}
            <div className="flex items-center justify-between py-6">
              {/* Home */}
              <div className="flex flex-col items-center flex-1 text-center">
                <div className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-md shrink-0">
                  PSB
                </div>
                <span className="font-black text-xs mt-2 leading-tight">{currentFixture.homeTeam}</span>
                <span className="text-[10px] text-slate-500 font-semibold">Tolic (H)</span>
              </div>

              {/* Score */}
              <div className="flex flex-col items-center px-2">
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-black font-mono ${isPro ? 'text-cyan-300' : 'text-blue-900'}`}>
                    {currentFixture.homeScore}
                  </span>
                  <span className="text-xl font-light text-slate-400">-</span>
                  <span className={`text-4xl font-black font-mono ${isPro ? 'text-slate-300' : 'text-slate-800'}`}>
                    {currentFixture.awayScore}
                  </span>
                </div>
                <span
                  className={`mt-1.5 text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                    currentFixture.status === 'FINISHED'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                  }`}
                >
                  FULL TIME
                </span>
              </div>

              {/* Away */}
              <div className="flex flex-col items-center flex-1 text-center">
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                    isPro
                      ? 'bg-slate-800 text-rose-400 ring-1 ring-slate-700'
                      : 'bg-rose-50 border-2 border-rose-300 text-rose-700 shadow-sm'
                  }`}
                >
                  {currentFixture.awayTeam.substring(0, 3).toUpperCase()}
                </div>
                <span className="font-black text-xs mt-2 leading-tight">{currentFixture.awayTeam}</span>
                <span className="text-[10px] text-slate-500 font-semibold">PT LIB (A)</span>
              </div>
            </div>

            {/* Venue & Highlights */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" /> Stadion:
                </span>
                <strong className={`font-semibold ${isPro ? 'text-slate-200' : 'text-slate-900'}`}>
                  {currentFixture.venue}
                </strong>
              </div>

              {currentFixture.highlights && currentFixture.highlights.length > 0 && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] ${
                    isPro ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-500 block mb-1">
                    Sorotan Laga:
                  </span>
                  <ul className="space-y-0.5 list-disc list-inside">
                    {currentFixture.highlights.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lineup (Starting XI vs Substitutes) */}
      {matchViewTab === 'lineup' && (
        <div
          className={`rounded-2xl border p-4 transition-all ${
            isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Line-Up Resmi Musim 2026/2027
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Head Coach: <strong className="text-blue-600">Igor Tolic</strong> (Formasi 4-2-3-1)
            </p>
          </div>

          <div className="mb-4">
            <h4
              className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isPro ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 11 Pemain Pertama (Starting XI)
            </h4>
            <div className="space-y-2">
              {startingXI.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                    isPro
                      ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                      : 'bg-white border-slate-200 hover:border-blue-600 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-700 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                      {player.fitness.percentage}% Fit
                    </span>
                    <span className="text-[10px] text-slate-500">★ {player.stats.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              className={`text-[11px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isPro ? 'text-cyan-400' : 'text-blue-700'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span> Pemain Cadangan (Substitutes)
            </h4>
            <div className="space-y-2">
              {substitutes.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                    isPro
                      ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isPro ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
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
                    <span className="text-[10px] text-slate-500">{player.stats.appearances} Laga</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2D Tactics */}
      {matchViewTab === 'tactics' && <TacticalPitch2D />}

      {/* Tab 4: Standings */}
      {matchViewTab === 'standings' && (
        <div className="space-y-4">
          {activeTournament === 'liga1' ? (
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <span
                  className={`text-[10px] font-mono font-bold uppercase ${
                    isPro ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  BRI Liga 1 2026/2027 (Pekan 11)
                </span>
                <h3 className="text-sm font-black tracking-tight mt-0.5">
                  PERSIB Pemuncak Klasemen (27 Poin)
                </h3>
              </div>

              <div className="overflow-x-auto no-scrollbar mt-3">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr
                      className={`border-b font-bold ${
                        isPro ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      <th className="py-2 px-2">#</th>
                      <th className="py-2 px-2">Klub</th>
                      <th className="py-2 px-1 text-center">M</th>
                      <th className="py-2 px-1 text-center">SG</th>
                      <th className="py-2 px-2 text-center font-bold">Poin</th>
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
                            ? 'border-slate-800/40 text-slate-300'
                            : 'border-slate-200 text-slate-800'
                        }`}
                      >
                        <td className="py-2.5 px-2">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-[10px] ${
                              row.rank === 1
                                ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-300'
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
                        <td className="py-2.5 px-2 font-bold text-[11px] truncate max-w-[140px]">
                          {row.team}
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono text-[11px]">{row.played}</td>
                        <td
                          className={`py-2.5 px-1 text-center font-mono text-[11px] font-bold ${
                            isPro ? 'text-cyan-300' : 'text-blue-700'
                          }`}
                        >
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td
                          className={`py-2.5 px-2 text-center font-mono font-black text-xs ${
                            isPro ? 'text-cyan-300' : 'text-blue-900'
                          }`}
                        >
                          {row.points}
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
